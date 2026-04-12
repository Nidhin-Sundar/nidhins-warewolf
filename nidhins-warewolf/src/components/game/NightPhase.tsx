import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Badge } from '@/components/ui/badge';
import { PlayerList } from './PlayerList';
import { Chat } from './Chat';
import { PhaseTimer } from './PhaseTimer';
import { getRoleEmoji } from '@/lib/gameLogic';
import { Moon, Eye, Shield, FlaskConical, Skull } from 'lucide-react';

export function NightPhase() {
  const { myPlayer, room, actions, submitNightAction, players } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  if (!myPlayer || !room) return null;

  const myRole = myPlayer.role;
  const round = room.round;
  const isDead = !myPlayer.alive;

  const alreadyActed = actions.some(
    a => a.round === round && a.player_id === myPlayer.id
  ) || actionSubmitted;

  const handleAction = async () => {
    if (!myRole || alreadyActed) return;
    let actionType = '';
    switch (myRole) {
      case 'werewolf': actionType = 'werewolf_kill'; break;
      case 'seer': actionType = 'seer_check'; break;
      case 'doctor': actionType = 'doctor_save'; break;
      case 'witch': actionType = selectedTarget ? 'witch_heal' : 'witch_poison'; break;
      default: return;
    }
    await submitNightAction(actionType, selectedTarget);
    setActionSubmitted(true);
  };

  const seerResult = actions.find(
    a => a.round === round && a.player_id === myPlayer.id && a.action_type === 'seer_check'
  );
  const seerTarget = seerResult ? players.find(p => p.id === seerResult.target_id) : null;

  const renderRoleAction = () => {
    if (isDead) {
      return (
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-6 bg-white/5 opacity-40">
            <Skull className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl tracking-[0.2em] uppercase text-muted-foreground mb-2">You are Dead</h3>
          <p className="text-sm text-muted-foreground/60 font-body italic leading-relaxed">
            You are dead. You can continue to spectate the game.
          </p>
        </div>
      );
    }

    if (alreadyActed) {
      return (
        <div className="text-center py-10 px-6 animate-fade-up">
          <div className="w-16 h-16 rounded-full border-2 border-primary mx-auto flex items-center justify-center mb-6 bg-primary/10 shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.3)]">
            <div className="text-2xl">✓</div>
          </div>
          <h3 className="font-display text-2xl tracking-[0.2em] uppercase text-primary mb-2 noir-text-glow">Action Confirmed</h3>
          <p className="text-sm text-muted-foreground/80 font-body italic">Waiting for other players...</p>

          {myRole === 'seer' && seerTarget && (
            <div className="mt-10 noir-glass p-6 rounded-2xl border-primary/20 bg-primary/5 animate-fade-up">
              <p className="text-[10px] font-display tracking-[0.3em] uppercase text-primary/60 mb-3">Investigation Result</p>
              <p className="text-lg font-body leading-tight">
                <span className="font-display tracking-widest uppercase text-foreground">{seerTarget.name}</span>
                <span className="text-muted-foreground mx-2">is</span>
                {seerTarget.role === 'werewolf' ? (
                  <span className="text-primary font-display tracking-widest uppercase noir-text-glow">a Werewolf</span>
                ) : (
                  <span className="text-doctor font-display tracking-widest uppercase">Not a Werewolf</span>
                )}
              </p>
            </div>
          )}
        </div>
      );
    }

    const ActionButton = ({ onClick, disabled, label, color, icon }: { onClick: () => void; disabled: boolean; label: string; color: string; icon?: any }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-14 rounded-xl font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 ${color}`}
      >
        {icon} {label}
      </button>
    );

    switch (myRole) {
      case 'werewolf':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h4 className="font-display text-sm tracking-[0.2em] uppercase text-primary noir-text-glow">Choose a Target</h4>
              <p className="text-[11px] text-muted-foreground font-body italic opacity-60">Select a player to kill tonight.</p>
            </div>
            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Confirm Kill" color="bg-primary/90 hover:bg-primary text-primary-foreground shadow-primary/20" icon={<Skull className="w-4 h-4" />} />
          </div>
        );
      case 'seer':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h4 className="font-display text-sm tracking-[0.2em] uppercase text-accent">Investigate Player</h4>
              <p className="text-[11px] text-muted-foreground font-body italic opacity-60">Find out a player's true role.</p>
            </div>
            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Investigate" color="bg-accent/90 hover:bg-accent text-accent-foreground shadow-accent/20" icon={<Eye className="w-4 h-4" />} />
          </div>
        );
      case 'doctor':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h4 className="font-display text-sm tracking-[0.2em] uppercase text-doctor">Protect Player</h4>
              <p className="text-[11px] text-muted-foreground font-body italic opacity-60">Guard a target from the werewolves.</p>
            </div>
            <div className="noir-divider opacity-10" />
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Grant Protection" color="bg-doctor/90 hover:bg-doctor text-primary-foreground shadow-doctor/20" icon={<Shield className="w-4 h-4" />} />
          </div>
        );
      case 'witch':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h4 className="font-display text-sm tracking-[0.2em] uppercase text-witch">Use Potions</h4>
              <p className="text-[11px] text-muted-foreground font-body italic opacity-60">Use a potion to heal or kill.</p>
            </div>
            <div className="noir-divider opacity-10" />
            {(myPlayer.has_heal_potion || myPlayer.has_poison_potion) ? (
              <>
                <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
                <div className="grid grid-cols-2 gap-3">
                  {myPlayer.has_heal_potion && (
                    <button
                      onClick={async () => { await submitNightAction('witch_heal', selectedTarget); setActionSubmitted(true); }}
                      disabled={!selectedTarget}
                      className="relative overflow-hidden flex-1 h-14 rounded-xl bg-doctor/90 hover:bg-doctor text-primary-foreground font-display text-[10px] tracking-[0.2em] uppercase transition-all shadow-[0_0_30px_-5px_hsl(var(--doctor-green)/0.4)] active:scale-[0.95] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-2 group border border-doctor/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
                      <span className="relative z-10">Restore 💚</span>
                    </button>
                  )}
                  {myPlayer.has_poison_potion && (
                    <button
                      onClick={async () => { await submitNightAction('witch_poison', selectedTarget); setActionSubmitted(true); }}
                      disabled={!selectedTarget}
                      className="relative overflow-hidden flex-1 h-14 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground font-display text-[10px] tracking-[0.2em] uppercase transition-all shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.4)] active:scale-[0.95] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-2 group border border-primary/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
                      <span className="relative z-10">Poison ☠️</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setActionSubmitted(true)}
                  className="w-full py-4 text-[10px] text-muted-foreground font-display tracking-[0.3em] uppercase hover:text-foreground transition-colors group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">Skip Action</span>
                </button>
              </>
            ) : (
              <div className="noir-glass p-8 rounded-2xl text-center border-white/5 bg-white/5 shadow-inner">
                <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xs text-muted-foreground font-body italic">Your elixirs are spent.</p>
                <button
                  onClick={() => setActionSubmitted(true)}
                  className="mt-6 font-display text-[10px] tracking-[0.3em] uppercase text-primary hover:underline"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-6 bg-white/5 grayscale opacity-60">
              <div className="text-4xl animate-breathe">{getRoleEmoji(myRole)}</div>
            </div>
            <h3 className="font-display text-xl tracking-[0.2em] uppercase text-muted-foreground mb-2 whitespace-nowrap">Sleeping</h3>
            <p className="text-sm text-muted-foreground/60 font-body italic leading-relaxed">
              You find no part in the night's dark dealings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen night-bg flex flex-col relative overflow-hidden">
      {/* Dynamic Moonlight Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none animate-flicker" />

      <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background/40 backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="font-display text-xs tracking-[0.4em] uppercase text-muted-foreground/60 leading-tight">The Game</h1>
          <div className="flex items-center gap-3">
            <span className="font-display text-xl tracking-[0.2em] uppercase text-foreground">Night {room.round}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Moon className="w-4 h-4 text-primary animate-moon-float" />
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-primary">Night Phase</span>
        </div>
      </header>

      <main className="flex-1 relative z-10 p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-12">
          {/* Timer Section */}
          <div className="animate-fade-up">
            <div className="noir-glass p-1 rounded-2xl border-white/5">
              <PhaseTimer />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Primary Action Area */}
            <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="noir-glass rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  {renderRoleAction()}
                </div>
              </div>
            </div>

            {/* Tactical Communications (Werewolf Only) */}
            {myRole === 'werewolf' && myPlayer.alive && (
              <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="noir-glass rounded-3xl p-6 border-primary/20 bg-primary/[0.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] text-primary font-display tracking-[0.3em] uppercase">The Pack's Whisper</p>
                  </div>
                  <Chat channel="werewolf" maxHeight="200px" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Atmospheric Fog Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
