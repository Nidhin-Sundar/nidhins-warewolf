import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { getClientId } from '@/lib/clientId';
import { assignRoles, checkWinCondition, generateRoomCode, PHASE_DURATION } from '@/lib/gameLogic';
import type { Tables } from '@/integrations/supabase/types';

type Room = Tables<'rooms'>;
type Player = Tables<'players'>;
type Message = Tables<'messages'>;
type GameAction = Tables<'game_actions'>;
type Vote = Tables<'votes'>;

export type GameScreen = 'home' | 'lobby' | 'role_reveal' | 'night' | 'day' | 'hunter_action' | 'game_over';

interface GameState {
  screen: GameScreen;
  room: Room | null;
  players: Player[];
  messages: Message[];
  actions: GameAction[];
  votes: Vote[];
  myPlayer: Player | null;
  clientId: string;
  error: string | null;

  setScreen: (s: GameScreen) => void;
  setError: (e: string | null) => void;

  createRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  returnToLobby: () => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;

  sendMessage: (content: string, channel?: string) => Promise<void>;
  submitNightAction: (actionType: string, targetId: string | null) => Promise<void>;
  submitVote: (targetId: string | null) => Promise<void>;

  advancePhase: () => Promise<void>;

  subscribeToRoom: (roomId: string) => () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'home',
  room: null,
  players: [],
  messages: [],
  actions: [],
  votes: [],
  myPlayer: null,
  clientId: getClientId(),
  error: null,

  setScreen: (screen) => set({ screen }),
  setError: (error) => set({ error }),

  createRoom: async (name) => {
    const clientId = get().clientId;
    const code = generateRoomCode();

    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .insert({ code })
      .select()
      .single();

    if (roomErr || !room) { set({ error: roomErr?.message || 'Failed to create room' }); return; }

    const { data: player, error: playerErr } = await supabase
      .from('players')
      .insert({ room_id: room.id, client_id: clientId, name, is_moderator: true })
      .select()
      .single();

    if (playerErr || !player) { set({ error: playerErr?.message || 'Failed to join room' }); return; }

    set({ room, myPlayer: player, players: [player], screen: 'lobby', error: null });
  },

  joinRoom: async (code, name) => {
    const clientId = get().clientId;

    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select()
      .eq('code', code.toUpperCase())
      .single();

    if (roomErr || !room) { set({ error: 'Room not found' }); return; }
    if (room.status !== 'waiting') { set({ error: 'Game already in progress' }); return; }

    // Check player count
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if ((count || 0) >= 15) { set({ error: 'Room is full' }); return; }

    // Check if already in room
    const { data: existing } = await supabase
      .from('players')
      .select()
      .eq('room_id', room.id)
      .eq('client_id', clientId)
      .maybeSingle();

    if (existing) {
      set({ room, myPlayer: existing, screen: 'lobby', error: null });
      return;
    }

    const { data: player, error: playerErr } = await supabase
      .from('players')
      .insert({ room_id: room.id, client_id: clientId, name })
      .select()
      .single();

    if (playerErr || !player) { set({ error: playerErr?.message || 'Failed to join' }); return; }

    set({ room, myPlayer: player, screen: 'lobby', error: null });
  },

  leaveRoom: async () => {
    const { myPlayer } = get();
    if (myPlayer) {
      await supabase.from('players').delete().eq('id', myPlayer.id);
    }
    set({ room: null, myPlayer: null, players: [], messages: [], actions: [], votes: [], screen: 'home', error: null });
  },

  returnToLobby: async () => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer || !myPlayer.is_moderator) return;

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
  },

  toggleReady: async () => {
    const { myPlayer } = get();
    if (!myPlayer) return;
    await supabase
      .from('players')
      .update({ is_ready: !myPlayer.is_ready })
      .eq('id', myPlayer.id);
  },

  startGame: async () => {
    const { room, players } = get();
    if (!room || players.length < 4) return;

    const roles = assignRoles(players.length);

    // Assign roles to all players
    for (let i = 0; i < players.length; i++) {
      await supabase
        .from('players')
        .update({ role: roles[i] })
        .eq('id', players[i].id);
    }

    const phaseEnd = new Date(Date.now() + PHASE_DURATION * 1000).toISOString();

    await supabase
      .from('rooms')
      .update({ status: 'playing', phase: 'night', round: 1, phase_end_at: phaseEnd })
      .eq('id', room.id);

    await supabase
      .from('messages')
      .insert({ room_id: room.id, content: '🌙 Night falls... The werewolves awaken.', channel: 'system' });
  },

  sendMessage: async (content, channel = 'public') => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;
    await supabase
      .from('messages')
      .insert({ room_id: room.id, player_id: myPlayer.id, content, channel });
  },

  submitNightAction: async (actionType, targetId) => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;

    // Check if already acted this round
    const existing = get().actions.find(
      a => a.round === room.round && a.player_id === myPlayer.id && a.action_type === actionType
    );
    if (existing) return;

    await supabase
      .from('game_actions')
      .insert({
        room_id: room.id,
        round: room.round,
        player_id: myPlayer.id,
        action_type: actionType,
        target_id: targetId,
      });
  },

  submitVote: async (targetId) => {
    const { room, myPlayer } = get();
    if (!room || !myPlayer) return;

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
  },

  advancePhase: async () => {
    const { room, players, actions } = get();
    if (!room) return;

    const phaseEnd = new Date(Date.now() + PHASE_DURATION * 1000).toISOString();

    if (room.phase === 'night') {
      // Resolve night actions
      const round = room.round;
      const roundActions = actions.filter(a => a.round === round);

      // Find werewolf target (majority vote among werewolves)
      const wolfKills = roundActions.filter(a => a.action_type === 'werewolf_kill' && a.target_id);
      const killTargets: Record<string, number> = {};
      wolfKills.forEach(a => { if (a.target_id) killTargets[a.target_id] = (killTargets[a.target_id] || 0) + 1; });
      const killTarget = Object.entries(killTargets).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Check doctor save
      const doctorSave = roundActions.find(a => a.action_type === 'doctor_save')?.target_id;

      // Check witch heal
      const witchHeal = roundActions.find(a => a.action_type === 'witch_heal')?.target_id;

      // Check witch poison
      const witchPoison = roundActions.find(a => a.action_type === 'witch_poison')?.target_id;

      const killed: string[] = [];

      if (killTarget && killTarget !== doctorSave && killTarget !== witchHeal) {
        killed.push(killTarget);
        await supabase.from('players').update({ alive: false }).eq('id', killTarget);
      }

      if (witchPoison) {
        killed.push(witchPoison);
        await supabase.from('players').update({ alive: false }).eq('id', witchPoison);
      }

      // System messages
      if (killed.length === 0) {
        await supabase.from('messages').insert({
          room_id: room.id, content: '☀️ Dawn breaks. No one was killed last night!', channel: 'system'
        });
      } else {
        const killedNames = killed.map(id => players.find(p => p.id === id)?.name || 'Unknown');
        await supabase.from('messages').insert({
          room_id: room.id, content: `☀️ Dawn breaks. ${killedNames.join(' and ')} did not survive the night...`, channel: 'system'
        });
      }

      // Check for hunter death
      const hunterKilled = killed.find(id => {
        const p = players.find(pl => pl.id === id);
        return p?.role === 'hunter';
      });

      // Check win condition
      const updatedPlayers = players.map(p => killed.includes(p.id) ? { ...p, alive: false } : p);
      const winner = checkWinCondition(updatedPlayers);

      if (winner) {
        await supabase.from('rooms').update({ phase: 'game_over', winner, status: 'finished' }).eq('id', room.id);
        return;
      }

      // Move to day
      await supabase.from('rooms').update({ phase: 'day', phase_end_at: phaseEnd }).eq('id', room.id);

    } else if (room.phase === 'day') {
      // Resolve day votes
      const { data: roundVotes } = await supabase
        .from('votes')
        .select()
        .eq('room_id', room.id)
        .eq('round', room.round);

      if (roundVotes && roundVotes.length > 0) {
        const voteCounts: Record<string, number> = {};
        roundVotes.forEach(v => { if (v.target_id) voteCounts[v.target_id] = (voteCounts[v.target_id] || 0) + 1; });

        const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0 && (sorted.length === 1 || sorted[0][1] > sorted[1][1])) {
          const lynchTarget = sorted[0][0];
          await supabase.from('players').update({ alive: false }).eq('id', lynchTarget);

          const lynched = players.find(p => p.id === lynchTarget);
          await supabase.from('messages').insert({
            room_id: room.id,
            content: `⚖️ The village has spoken. ${lynched?.name || 'Unknown'} was lynched. They were a ${lynched?.role || 'unknown'}.`,
            channel: 'system'
          });

          // Check win
          const updatedPlayers = players.map(p => p.id === lynchTarget ? { ...p, alive: false } : p);
          const winner = checkWinCondition(updatedPlayers);

          if (winner) {
            await supabase.from('rooms').update({ phase: 'game_over', winner, status: 'finished' }).eq('id', room.id);
            return;
          }
        } else {
          await supabase.from('messages').insert({
            room_id: room.id, content: '⚖️ No majority reached. No one was lynched.', channel: 'system'
          });
        }
      }

      // Move to next night
      await supabase.from('rooms').update({
        phase: 'night',
        round: room.round + 1,
        phase_end_at: phaseEnd
      }).eq('id', room.id);

      await supabase.from('messages').insert({
        room_id: room.id, content: '🌙 Night falls again... The werewolves stir.', channel: 'system'
      });
    }
  },

  subscribeToRoom: (roomId) => {
    const clientId = get().clientId;

    // Fetch initial data
    const fetchAll = async () => {
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
        if (phase === 'lobby') set({ screen: 'lobby' });
        else if (phase === 'night') set({ screen: myPlayer?.role ? 'night' : 'role_reveal' });
        else if (phase === 'day') set({ screen: 'day' });
        else if (phase === 'game_over') set({ screen: 'game_over' });
      }
    };

    fetchAll();

    // Subscribe to changes
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.new && 'id' in payload.new) {
          const newRoom = payload.new as Room;
          set({ room: newRoom });

          const { myPlayer } = get();
          if (newRoom.phase === 'night') set({ screen: 'night' });
          else if (newRoom.phase === 'day') set({ screen: 'day' });
          else if (newRoom.phase === 'game_over') set({ screen: 'game_over' });
          else if (newRoom.phase === 'lobby') set({ screen: 'lobby' });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select().eq('room_id', roomId).order('created_at').then(({ data }) => {
          if (data) {
            const myPlayer = data.find(p => p.client_id === clientId) || null;
            set({ players: data, myPlayer });
          }
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.new && 'id' in payload.new) {
          set(state => ({ messages: [...state.messages, payload.new as Message] }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_actions', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('game_actions').select().eq('room_id', roomId).then(({ data }) => {
          if (data) set({ actions: data });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('votes').select().eq('room_id', roomId).then(({ data }) => {
          if (data) set({ votes: data });
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
