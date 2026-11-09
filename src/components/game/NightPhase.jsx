import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { sound } from '@/lib/sound';
import { PlayerList } from './PlayerList';
import { Chat } from './Chat';
import { PhaseTimer } from './PhaseTimer';
import {
  getRoleEmoji,
  getRoleColor,
  getRoleDescription,
  getRoleTeam,
  getRoleGoal,
} from '@/lib/gameLogic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Moon, Eye, Shield, FlaskConical, Skull, Info, Crosshair, CheckCircle2 } from 'lucide-react';

export function NightPhase() {
  const { myPlayer, room, actions, submitNightAction, players, advancePhase } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  if (!myPlayer || !room) return null;

  const myRole = myPlayer.role || 'villager';
  const round = room.round;
  const isDead = !myPlayer.alive;

  const roundActions = actions.filter(a => a.round === round);
  const alreadyActed = roundActions.some(a => a.player_id === myPlayer.id) || actionSubmitted;

  const handleAction = async (overrideActionType) => {
    if (!myRole || alreadyActed) return;
    let actionType = overrideActionType;
    if (!actionType) {
      switch (myRole) {
        case 'werewolf': actionType = 'werewolf_kill'; break;
        case 'seer': actionType = 'seer_check'; break;
        case 'bodyguard':
        case 'doctor': actionType = 'doctor_save'; break;
        default: return;
      }
    }
    sound.playClick();
    await submitNightAction(actionType, selectedTarget);
    setActionSubmitted(true);
  };

  // Seer investigation target
  const seerAction = roundActions.find(
    a => a.player_id === myPlayer.id && a.action_type === 'seer_check'
  );
  const seerTargetId = seerAction?.target_id || (actionSubmitted && myRole === 'seer' ? selectedTarget : null);
  const seerTarget = seerTargetId ? players.find(p => p.id === seerTargetId) : null;

  // Werewolf pack targets
  const wolfActions = roundActions.filter(a => a.action_type === 'werewolf_kill');

  const selectedTargetPlayer = players.find(p => p.id === selectedTarget);

  const renderRoleAction = () => {
    if (isDead) {
      return (
        <div className="text-center py-10 px-6">
          <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-4 bg-white/5 opacity-50">
            <Skull className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl tracking-[0.2em] uppercase text-muted-foreground mb-2">You Have Been Eliminated</h3>
          <p className="text-sm text-muted-foreground/70 font-body leading-relaxed max-w-sm mx-auto">
            You are spectating the night phase as a spirit. You cannot take actions, but you may watch the story unfold.
          </p>
        </div>
      );
    }

    if (alreadyActed) {
      return (
        <div className="text-center py-8 px-6 animate-fade-up">
          <div className="w-16 h-16 rounded-full border-2 border-primary mx-auto flex items-center justify-center mb-4 bg-primary/10 shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.4)]">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-2xl tracking-[0.2em] uppercase text-primary mb-2 noir-text-glow">Action Confirmed</h3>
          <p className="text-sm text-muted-foreground font-body">Waiting for remaining players and timer to conclude...</p>

          {myRole === 'seer' && seerTarget && (
            <div className="mt-6 noir-glass p-6 rounded-2xl border-accent/30 bg-accent/5 animate-fade-up text-center">
              <span className="text-[10px] font-display tracking-[0.3em] uppercase text-accent mb-2 block">Seer Vision Revealed</span>
              <p className="text-xl font-display uppercase tracking-widest text-foreground">
                {seerTarget.name}
              </p>
              <div className="mt-3">
                {seerTarget.role === 'werewolf' ? (
                  <Badge className="bg-primary/20 text-primary border-primary/40 px-3 py-1 font-display tracking-widest uppercase text-sm">
                    🐺 Confirmed Werewolf!
                  </Badge>
                ) : (
                  <Badge className="bg-doctor/20 text-doctor border-doctor/40 px-3 py-1 font-display tracking-widest uppercase text-sm">
                    🛡️ Allied Villager
                  </Badge>
                )}
              </div>
            </div>
          )}

          {myRole === 'werewolf' && (
            <p className="text-xs text-primary/70 font-display uppercase tracking-wider mt-4">
              Discuss with your pack in the secret chat below until dawn.
            </p>
          )}
        </div>
      );
    }

    switch (myRole) {
      case 'werewolf':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm tracking-[0.2em] uppercase text-primary noir-text-glow">Choose a Victim</h4>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-display tracking-widest uppercase">
                  Werewolf Pack
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Coordinate in secret pack chat and agree on a victim. If votes tie, the pack is divided and no kill will happen tonight!
              </p>
            </div>

            {wolfActions.length > 0 && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                <span className="font-display tracking-wider uppercase text-primary block mb-1">Pack Votes:</span>
                {wolfActions.map((wa, idx) => {
                  const voter = players.find(p => p.id === wa.player_id);
                  const target = players.find(p => p.id === wa.target_id);
                  return (
                    <div key={idx} className="text-muted-foreground font-body text-xs">
                      • <span className="text-foreground">{voter?.name || 'A wolf'}</span> voted for <span className="text-primary font-bold">{target?.name || 'Nobody'}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />

            <button
              onClick={() => handleAction('werewolf_kill')}
              disabled={!selectedTarget}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-3"
            >
              <Skull className="w-4 h-4" />
              <span>Confirm Attack on {selectedTargetPlayer ? selectedTargetPlayer.name : 'Target'}</span>
            </button>
          </div>
        );

      case 'seer':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm tracking-[0.2em] uppercase text-accent">Investigate Player</h4>
                <Badge className="bg-accent/20 text-accent border-accent/30 text-[9px] font-display tracking-widest uppercase">
                  Seer Vision
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Select one player to uncover their true role. You will immediately discover whether they are a Werewolf or a Villager.
              </p>
            </div>

            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />

            <button
              onClick={() => handleAction('seer_check')}
              disabled={!selectedTarget}
              className="w-full h-14 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-3"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal True Role of {selectedTargetPlayer ? selectedTargetPlayer.name : 'Target'}</span>
            </button>
          </div>
        );

      case 'bodyguard':
      case 'doctor':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm tracking-[0.2em] uppercase text-doctor">Protect a Player</h4>
                <Badge className="bg-doctor/20 text-doctor border-doctor/30 text-[9px] font-display tracking-widest uppercase">
                  Bodyguard Shield
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Choose one player to protect tonight (you may protect yourself). If the werewolves attack this player, they will survive!
              </p>
            </div>

            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} aliveOnly />

            <button
              onClick={() => handleAction('doctor_save')}
              disabled={!selectedTarget}
              className="w-full h-14 rounded-xl bg-doctor/90 hover:bg-doctor text-primary-foreground font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-3"
            >
              <Shield className="w-4 h-4" />
              <span>Protect {selectedTargetPlayer ? selectedTargetPlayer.name : 'Target'}</span>
            </button>
          </div>
        );

      case 'witch':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm tracking-[0.2em] uppercase text-witch">Witch's Potions</h4>
                <Badge className="bg-witch/20 text-witch border-witch/30 text-[9px] font-display tracking-widest uppercase">
                  Potions
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                You possess one Heal Potion (to save a player) and one Poison Potion (to eliminate a suspect). Each can only be used once per game!
              </p>
            </div>

            <div className="noir-divider opacity-10" />
            {myPlayer.has_heal_potion || myPlayer.has_poison_potion ? (
              <>
                <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myPlayer.has_heal_potion && (
                    <button
                      onClick={() => handleAction('witch_heal')}
                      disabled={!selectedTarget}
                      className="h-14 rounded-xl bg-doctor/90 hover:bg-doctor text-primary-foreground font-display text-[10px] tracking-[0.2em] uppercase transition-all active:scale-[0.95] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-2 border border-doctor/30 shadow-lg"
                    >
                      <span>Save with Heal Potion 💚</span>
                    </button>
                  )}
                  {myPlayer.has_poison_potion && (
                    <button
                      onClick={() => handleAction('witch_poison')}
                      disabled={!selectedTarget}
                      className="h-14 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground font-display text-[10px] tracking-[0.2em] uppercase transition-all active:scale-[0.95] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-2 border border-primary/30 shadow-lg"
                    >
                      <span>Kill with Poison ☠️</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setActionSubmitted(true)}
                  className="w-full py-3 text-[10px] text-muted-foreground font-display tracking-[0.3em] uppercase hover:text-foreground transition-colors"
                >
                  Skip Tonight (Save Potions for Later)
                </button>
              </>
            ) : (
              <div className="noir-glass p-8 rounded-2xl text-center border-white/5 bg-white/5">
                <FlaskConical className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Both of your potions have been consumed.</p>
                <button
                  onClick={() => setActionSubmitted(true)}
                  className="mt-4 font-display text-[10px] tracking-[0.3em] uppercase text-primary hover:underline"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );

      case 'hunter':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm tracking-[0.2em] uppercase text-hunter">Retribution Target</h4>
                <Badge className="bg-hunter/20 text-hunter border-hunter/30 text-[9px] font-display tracking-widest uppercase">
                  Hunter
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body">
                If the werewolves kill you tonight, who do you want to take down with you? Select your target below.
              </p>
            </div>

            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />

            <button
              onClick={() => handleAction('hunter_shoot')}
              disabled={!selectedTarget}
              className="w-full h-14 rounded-xl bg-hunter/90 hover:bg-hunter text-primary-foreground font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-3"
            >
              <Crosshair className="w-4 h-4" />
              <span>Aim at {selectedTargetPlayer ? selectedTargetPlayer.name : 'Target'}</span>
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-10 px-6">
            <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-4 bg-white/5">
              <div className="text-4xl animate-breathe">{getRoleEmoji(myRole)}</div>
            </div>
            <h3 className="font-display text-xl tracking-[0.2em] uppercase text-muted-foreground mb-2">Asleep in Bed</h3>
            <p className="text-sm text-muted-foreground/70 font-body leading-relaxed max-w-sm mx-auto">
              You are an ordinary Villager. You sleep through the night. Stay alert for the morning discussion to find the werewolves!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen night-bg flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none animate-flicker" />

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/5 bg-background/40 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 leading-tight">Werewolf Game</span>
          <span className="font-display text-lg lg:text-xl tracking-[0.2em] uppercase text-foreground">Night {room.round}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoleInfo(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-all hover:bg-white/10"
          >
            <Info className="w-3.5 h-3.5 text-accent" />
            <span className="font-display text-[9px] lg:text-[10px] tracking-widest uppercase">My Role: {myRole}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Moon className="w-3.5 h-3.5 text-primary animate-moon-float" />
            <span className="font-display text-[9px] lg:text-[10px] tracking-widest uppercase text-primary">Night Phase</span>
          </div>
        </div>
      </header>

      {/* Role Guide Modal */}
      <Dialog open={showRoleInfo} onOpenChange={setShowRoleInfo}>
        <DialogContent className="noir-glass border-white/10 bg-black/95 text-foreground max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase tracking-wider flex items-center gap-3">
              <span>{getRoleEmoji(myRole)}</span>
              <span className={getRoleColor(myRole)}>{myRole}</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-body">
              {getRoleTeam(myRole)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-sm font-body">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-display text-[10px] tracking-widest uppercase text-primary block mb-1">Your Objective</span>
              <p className="text-xs text-foreground/90">{getRoleGoal(myRole)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-display text-[10px] tracking-widest uppercase text-accent block mb-1">Role Description</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{getRoleDescription(myRole)}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowRoleInfo(false)}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-display text-[10px] tracking-widest uppercase"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 relative z-10 p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-12">
          {/* Phase Timer */}
          <div className="animate-fade-up">
            <PhaseTimer />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Primary Action Area */}
            <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="noir-glass rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                <div className="relative z-10">
                  {renderRoleAction()}
                </div>
              </div>
            </div>

            {/* Werewolf Pack Secret Chat */}
            {myRole === 'werewolf' && myPlayer.alive && (
              <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="noir-glass rounded-3xl p-6 border-primary/20 bg-primary/[0.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <p className="text-[10px] text-primary font-display tracking-[0.3em] uppercase">Pack Secret Chat</p>
                      <p className="text-[10px] text-muted-foreground font-body">Only your fellow werewolves can see this chat.</p>
                    </div>
                  </div>
                  <Chat channel="werewolf" maxHeight="200px" />
                </div>
              </div>
            )}

            {/* Moderator End Phase Early */}
            {myPlayer.is_moderator && (
              <div className="text-center pt-2">
                <button
                  onClick={advancePhase}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-display text-[10px] tracking-[0.25em] uppercase transition-all"
                >
                  End Night Early & Wake Village →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
