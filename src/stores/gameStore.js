import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { getClientId } from '@/lib/clientId';
import { assignRoles, checkWinCondition, generateRoomCode, PHASE_DURATION } from '@/lib/gameLogic';

function formatErrorMessage(err) {
  if (!err) return null;
  const msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
    return 'Cannot connect to database. Please make sure your Supabase project is active and unpaused.';
  }
  return msg;
}

const ACTIVE_ROOM_KEY = 'werewolf_active_room_id';

export const useGameStore = create((set, get) => ({
  screen: 'home',
  room: null,
  players: [],
  messages: [],
  actions: [],
  votes: [],
  myPlayer: null,
  clientId: getClientId(),
  error: null,
  hasSeenRoleReveal: false,
  isAdvancing: false,
  isRestoring: false,

  setScreen: (screen) => set({ screen }),
  setError: (error) => set({ error: formatErrorMessage(error) }),
  dismissRoleReveal: () => set({ hasSeenRoleReveal: true, screen: 'night' }),

  restoreSession: async () => {
    try {
      const savedRoomId = localStorage.getItem(ACTIVE_ROOM_KEY);
      if (!savedRoomId) return;

      set({ isRestoring: true });
      const clientId = get().clientId;

      // Verify room still exists and fetch player
      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select()
        .eq('id', savedRoomId)
        .maybeSingle();

      if (roomErr || !room) {
        localStorage.removeItem(ACTIVE_ROOM_KEY);
        set({ isRestoring: false });
        return;
      }

      const { data: myPlayer } = await supabase
        .from('players')
        .select()
        .eq('room_id', room.id)
        .eq('client_id', clientId)
        .maybeSingle();

      if (!myPlayer) {
        localStorage.removeItem(ACTIVE_ROOM_KEY);
        set({ isRestoring: false });
        return;
      }

      set({ room, myPlayer, isRestoring: false });
      // subscribeToRoom will handle fetching all messages, players, and setting the proper screen
      get().subscribeToRoom(room.id);
    } catch (err) {
      localStorage.removeItem(ACTIVE_ROOM_KEY);
      set({ isRestoring: false });
    }
  },

  createRoom: async (name) => {
    try {
      const clientId = get().clientId;
      const code = generateRoomCode();

      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .insert({ code })
        .select()
        .single();

      if (roomErr || !room) {
        set({ error: formatErrorMessage(roomErr) || 'Failed to create room' });
        return;
      }

      const { data: player, error: playerErr } = await supabase
        .from('players')
        .insert({ room_id: room.id, client_id: clientId, name, is_moderator: true })
        .select()
        .single();

      if (playerErr || !player) {
        set({ error: formatErrorMessage(playerErr) || 'Failed to join created room' });
        return;
      }

      try {
        localStorage.setItem(ACTIVE_ROOM_KEY, room.id);
      } catch (_) {}
      set({ room, myPlayer: player, players: [player], screen: 'lobby', error: null, hasSeenRoleReveal: false });
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  joinRoom: async (code, name) => {
    try {
      const clientId = get().clientId;

      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select()
        .eq('code', code.toUpperCase())
        .single();

      if (roomErr || !room) {
        set({ error: 'Room not found. Please verify the code and try again.' });
        return;
      }
      if (room.status !== 'waiting') {
        set({ error: 'Game is already in progress in this room.' });
        return;
      }

      // Check player count
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      if ((count || 0) >= 15) {
        set({ error: 'Room is full (maximum 15 players).' });
        return;
      }

      // Check if already in room
      const { data: existing } = await supabase
        .from('players')
        .select()
        .eq('room_id', room.id)
        .eq('client_id', clientId)
        .maybeSingle();

      if (existing) {
        try {
          localStorage.setItem(ACTIVE_ROOM_KEY, room.id);
        } catch (_) {}
        set({ room, myPlayer: existing, screen: 'lobby', error: null, hasSeenRoleReveal: false });
        return;
      }

      const { data: player, error: playerErr } = await supabase
        .from('players')
        .insert({ room_id: room.id, client_id: clientId, name })
        .select()
        .single();

      if (playerErr || !player) {
        set({ error: formatErrorMessage(playerErr) || 'Failed to join room' });
        return;
      }

      try {
        localStorage.setItem(ACTIVE_ROOM_KEY, room.id);
      } catch (_) {}
      set({ room, myPlayer: player, screen: 'lobby', error: null, hasSeenRoleReveal: false });
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  leaveRoom: async () => {
    try {
      localStorage.removeItem(ACTIVE_ROOM_KEY);
    } catch (_) {}
    try {
      const { myPlayer } = get();
      if (myPlayer) {
        await supabase.from('players').delete().eq('id', myPlayer.id);
      }
    } catch (_) {}
    set({
      room: null,
      myPlayer: null,
      players: [],
      messages: [],
      actions: [],
      votes: [],
      screen: 'home',
      error: null,
      hasSeenRoleReveal: false,
    });
  },

  returnToLobby: async () => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer || !myPlayer.is_moderator) return;

    try {
      // Reset room
      await supabase
        .from('rooms')
        .update({ status: 'waiting', phase: 'lobby', round: 0, winner: null, phase_end_at: null })
        .eq('id', room.id);

      // Reset players
      await supabase
        .from('players')
        .update({ role: null, alive: true, is_ready: false, has_heal_potion: true, has_poison_potion: true })
        .eq('room_id', room.id);

      // Clear game state
      await supabase.from('game_actions').delete().eq('room_id', room.id);
      await supabase.from('votes').delete().eq('room_id', room.id);
      await supabase.from('messages').delete().eq('room_id', room.id);

      set({ hasSeenRoleReveal: false, isAdvancing: false });
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  toggleReady: async () => {
    const { myPlayer } = get();
    if (!myPlayer) return;
    try {
      await supabase
        .from('players')
        .update({ is_ready: !myPlayer.is_ready })
        .eq('id', myPlayer.id);
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  startGame: async () => {
    const { room, players } = get();
    if (!room || players.length < 4) return;

    try {
      const roles = assignRoles(players.length);

      // Assign roles to all players
      for (let i = 0; i < players.length; i++) {
        await supabase
          .from('players')
          .update({
            role: roles[i],
            alive: true,
            has_heal_potion: true,
            has_poison_potion: true,
          })
          .eq('id', players[i].id);
      }

      const phaseEnd = new Date(Date.now() + PHASE_DURATION * 1000).toISOString();

      await supabase
        .from('rooms')
        .update({ status: 'playing', phase: 'night', round: 1, phase_end_at: phaseEnd })
        .eq('id', room.id);

      await supabase
        .from('messages')
        .insert({
          room_id: room.id,
          content: '🌙 Night 1 begins. The village falls asleep. Werewolves and special roles awaken...',
          channel: 'system',
        });
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  sendMessage: async (content, channel = 'public') => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;
    try {
      await supabase
        .from('messages')
        .insert({ room_id: room.id, player_id: myPlayer.id, content, channel });
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  submitNightAction: async (actionType, targetId) => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;

    // Check if already acted this round
    const existing = get().actions.find(
      a => a.round === room.round && a.player_id === myPlayer.id && a.action_type === actionType
    );
    if (existing) return;

    try {
      await supabase
        .from('game_actions')
        .insert({
          room_id: room.id,
          round: room.round,
          player_id: myPlayer.id,
          action_type: actionType,
          target_id: targetId,
        });

      // Deduct witch potions
      if (actionType === 'witch_heal') {
        await supabase.from('players').update({ has_heal_potion: false }).eq('id', myPlayer.id);
        set(state => ({
          myPlayer: state.myPlayer ? { ...state.myPlayer, has_heal_potion: false } : null,
        }));
      } else if (actionType === 'witch_poison') {
        await supabase.from('players').update({ has_poison_potion: false }).eq('id', myPlayer.id);
        set(state => ({
          myPlayer: state.myPlayer ? { ...state.myPlayer, has_poison_potion: false } : null,
        }));
      }
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  submitVote: async (targetId) => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;

    try {
      // Upsert vote
      const { data: existing } = await supabase
        .from('votes')
        .select()
        .eq('room_id', room.id)
        .eq('round', room.round)
        .eq('voter_id', myPlayer.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('votes')
          .update({ target_id: targetId })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('votes')
          .insert({ room_id: room.id, round: room.round, voter_id: myPlayer.id, target_id: targetId });
      }
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    }
  },

  advancePhase: async () => {
    const { room, players, actions, isAdvancing } = get();
    if (!room || isAdvancing) return;

    set({ isAdvancing: true });

    try {
      const phaseEnd = new Date(Date.now() + PHASE_DURATION * 1000).toISOString();

      if (room.phase === 'night') {
        // Resolve night actions
        const round = room.round;
        const roundActions = actions.filter(a => a.round === round);

        // Werewolf target (majority vote, tie = no kill)
        const wolfKills = roundActions.filter(a => a.action_type === 'werewolf_kill' && a.target_id);
        const killTargets = {};
        wolfKills.forEach(a => {
          if (a.target_id) killTargets[a.target_id] = (killTargets[a.target_id] || 0) + 1;
        });

        const sortedKills = Object.entries(killTargets).sort((a, b) => b[1] - a[1]);
        let killTarget = null;
        let wolfTie = false;

        if (sortedKills.length > 0) {
          // If there's more than one target and top two have equal votes, it's a tie
          if (sortedKills.length > 1 && sortedKills[0][1] === sortedKills[1][1]) {
            wolfTie = true;
            killTarget = null;
          } else {
            killTarget = sortedKills[0][0];
          }
        }

        // Bodyguard protection (action_type: 'doctor_save')
        const bodyguardSave = roundActions.find(a => a.action_type === 'doctor_save')?.target_id;

        const killed = [];

        // Werewolf kill succeeds only if agreed upon and not protected by Bodyguard
        if (killTarget && killTarget !== bodyguardSave) {
          killed.push(killTarget);
          await supabase.from('players').update({ alive: false }).eq('id', killTarget);
        }

        // System messages for night results
        if (wolfTie) {
          await supabase.from('messages').insert({
            room_id: room.id,
            content: '☀️ Dawn breaks. The Werewolves were divided and could not agree on a victim — no one was attacked!',
            channel: 'system',
          });
        } else if (killed.length === 0) {
          await supabase.from('messages').insert({
            room_id: room.id,
            content: '☀️ Dawn breaks. No one was killed last night! The village survived peacefully.',
            channel: 'system',
          });
        } else {
          const killedNames = killed.map(id => players.find(p => p.id === id)?.name || 'Unknown');
          await supabase.from('messages').insert({
            room_id: room.id,
            content: `☀️ Dawn breaks. Tragically, ${killedNames.join(' and ')} did not survive the night.`,
            channel: 'system',
          });
        }

        // Check win condition
        const updatedPlayers = players.map(p => (killed.includes(p.id) ? { ...p, alive: false } : p));
        const winner = checkWinCondition(updatedPlayers);

        if (winner) {
          await supabase
            .from('rooms')
            .update({ phase: 'game_over', winner, status: 'finished' })
            .eq('id', room.id);
          return;
        }

        // Move to Day
        await supabase
          .from('rooms')
          .update({ phase: 'day', phase_end_at: phaseEnd })
          .eq('id', room.id);

        await supabase.from('messages').insert({
          room_id: room.id,
          content: `☀️ Day ${room.round} begins. Discuss in public chat and vote on who to eliminate before time runs out.`,
          channel: 'system',
        });
      } else if (room.phase === 'day') {
        // Resolve day votes
        const { data: roundVotes } = await supabase
          .from('votes')
          .select()
          .eq('room_id', room.id)
          .eq('round', room.round);

        let eliminatedId = null;

        if (roundVotes && roundVotes.length > 0) {
          const voteCounts = {};
          roundVotes.forEach(v => {
            if (v.target_id) voteCounts[v.target_id] = (voteCounts[v.target_id] || 0) + 1;
          });

          const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

          if (sorted.length > 0) {
            // Check for clear majority (strictly greater than second place)
            const hasTie = sorted.length > 1 && sorted[0][1] === sorted[1][1];

            if (!hasTie) {
              eliminatedId = sorted[0][0];
              await supabase.from('players').update({ alive: false }).eq('id', eliminatedId);

              const lynched = players.find(p => p.id === eliminatedId);
              await supabase.from('messages').insert({
                room_id: room.id,
                content: `⚖️ The village has spoken. ${lynched?.name || 'A player'} was voted out. Their role was: ${lynched?.role?.toUpperCase() || 'UNKNOWN'}.`,
                channel: 'system',
              });

              // Check if eliminated player was hunter
              if (lynched?.role === 'hunter') {
                const hunterAction = actions.find(
                  a => a.action_type === 'hunter_shoot' && a.player_id === lynched.id && a.target_id
                );
                if (hunterAction?.target_id) {
                  await supabase.from('players').update({ alive: false }).eq('id', hunterAction.target_id);
                  const hTarget = players.find(p => p.id === hunterAction.target_id);
                  await supabase.from('messages').insert({
                    room_id: room.id,
                    content: `🏹 As ${lynched.name} was eliminated, they fired a final shot and eliminated ${hTarget?.name || 'their target'}!`,
                    channel: 'system',
                  });
                }
              }

              // Check win condition
              const updatedPlayers = players.map(p =>
                p.id === eliminatedId ? { ...p, alive: false } : p
              );
              const winner = checkWinCondition(updatedPlayers);

              if (winner) {
                await supabase
                  .from('rooms')
                  .update({ phase: 'game_over', winner, status: 'finished' })
                  .eq('id', room.id);
                return;
              }
            } else {
              await supabase.from('messages').insert({
                room_id: room.id,
                content: '⚖️ The vote resulted in a tie! No one was eliminated today.',
                channel: 'system',
              });
            }
          } else {
            await supabase.from('messages').insert({
              room_id: room.id,
              content: '⚖️ No votes were submitted. No one was eliminated today.',
              channel: 'system',
            });
          }
        } else {
          await supabase.from('messages').insert({
            room_id: room.id,
            content: '⚖️ Time expired with no votes cast. No one was eliminated today.',
            channel: 'system',
          });
        }

        // Move to next night
        await supabase
          .from('rooms')
          .update({
            phase: 'night',
            round: room.round + 1,
            phase_end_at: phaseEnd,
          })
          .eq('id', room.id);

        await supabase.from('messages').insert({
          room_id: room.id,
          content: `🌙 Night ${room.round + 1} falls. The village goes to sleep...`,
          channel: 'system',
        });
      }
    } catch (err) {
      set({ error: formatErrorMessage(err) });
    } finally {
      set({ isAdvancing: false });
    }
  },

  subscribeToRoom: (roomId) => {
    const clientId = get().clientId;

    const fetchAll = async () => {
      try {
        const [roomRes, playersRes, messagesRes, actionsRes, votesRes] = await Promise.all([
          supabase.from('rooms').select().eq('id', roomId).single(),
          supabase.from('players').select().eq('room_id', roomId).order('created_at'),
          supabase.from('messages').select().eq('room_id', roomId).order('created_at'),
          supabase.from('game_actions').select().eq('room_id', roomId),
          supabase.from('votes').select().eq('room_id', roomId),
        ]);

        const myPlayer = playersRes.data?.find(p => p.client_id === clientId) || null;

        set({
          room: roomRes.data,
          players: playersRes.data || [],
          messages: messagesRes.data || [],
          actions: actionsRes.data || [],
          votes: votesRes.data || [],
          myPlayer,
        });

        // Set screen based on phase
        if (roomRes.data) {
          const phase = roomRes.data.phase;
          if (phase === 'lobby') {
            set({ screen: 'lobby', hasSeenRoleReveal: false });
          } else if (phase === 'night') {
            // If round 1 and hasn't seen role reveal, show reveal first
            if (roomRes.data.round === 1 && !get().hasSeenRoleReveal) {
              set({ screen: 'role_reveal' });
            } else {
              set({ screen: 'night' });
            }
          } else if (phase === 'day') {
            set({ screen: 'day' });
          } else if (phase === 'game_over') {
            set({ screen: 'game_over' });
          }
        }
      } catch (err) {
        set({ error: formatErrorMessage(err) });
      }
    };

    fetchAll();

    // Subscribe to changes
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        payload => {
          if (payload.new && 'id' in payload.new) {
            const newRoom = payload.new;
            const oldRoom = get().room;
            set({ room: newRoom });

            if (newRoom.phase === 'lobby') {
              set({ screen: 'lobby', hasSeenRoleReveal: false });
            } else if (newRoom.phase === 'night') {
              // If entering night 1 from lobby, show role reveal first
              if ((!oldRoom || oldRoom.phase === 'lobby') && newRoom.round === 1 && !get().hasSeenRoleReveal) {
                set({ screen: 'role_reveal' });
              } else {
                set({ screen: 'night' });
              }
            } else if (newRoom.phase === 'day') {
              set({ screen: 'day' });
            } else if (newRoom.phase === 'game_over') {
              set({ screen: 'game_over' });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('players')
            .select()
            .eq('room_id', roomId)
            .order('created_at')
            .then(({ data }) => {
              if (data) {
                const myPlayer = data.find(p => p.client_id === clientId) || null;
                set({ players: data, myPlayer });
              }
            });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        payload => {
          if (payload.new && 'id' in payload.new) {
            set(state => ({ messages: [...state.messages, payload.new] }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_actions', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('game_actions')
            .select()
            .eq('room_id', roomId)
            .then(({ data }) => {
              if (data) set({ actions: data });
            });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('votes')
            .select()
            .eq('room_id', roomId)
            .then(({ data }) => {
              if (data) set({ votes: data });
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
