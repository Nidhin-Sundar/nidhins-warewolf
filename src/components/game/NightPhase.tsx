import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Badge } from '@/components/ui/badge';
import { PlayerList } from './PlayerList';
import { Chat } from './Chat';
import { PhaseTimer } from './PhaseTimer';
import { getRoleEmoji } from '@/lib/gameLogic';
import { Moon, Eye, Shield, FlaskConical } from 'lucide-react';

export function NightPhase() {
  const { myPlayer, room, actions, submitNightAction, advancePhase, players } = useGameStore();
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
        <div className="noir-card rounded-lg p-8 text-center">
          <p className="text-muted-foreground font-body italic">You are dead. Watch the game unfold...</p>
        </div>
      );
    }

    if (alreadyActed) {
      return (
        <div className="noir-card rounded-lg p-8 text-center animate-fade-up">
          <p className="text-primary text-lg font-display tracking-wider">✓ Action submitted</p>
          <p className="text-muted-foreground text-sm mt-1 font-body">Waiting for others...</p>
          {myRole === 'seer' && seerTarget && (
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-body">
                <strong className="font-display">{seerTarget.name}</strong> is{' '}
                {seerTarget.role === 'werewolf' ? (
                  <span className="text-primary font-bold">a Werewolf! 🐺</span>
                ) : (
                  <span className="text-doctor font-bold">not a Werewolf ✓</span>
                )}
              </p>
            </div>
          )}
        </div>
      );
    }

    const ActionButton = ({ onClick, disabled, label, color }: { onClick: () => void; disabled: boolean; label: string; color: string }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-11 rounded-lg font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none text-primary-foreground ${color}`}
      >
        {label}
      </button>
    );

    switch (myRole) {
      case 'werewolf':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 font-display tracking-wider text-xs uppercase">🐺 Werewolf</Badge>
              <span className="text-sm text-muted-foreground font-body">Choose a victim</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Confirm Kill" color="bg-primary/90 hover:bg-primary" />
          </div>
        );
      case 'seer':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-accent/20 text-accent border-accent/30 font-display tracking-wider text-xs uppercase"><Eye className="w-3 h-3 mr-1" /> Seer</Badge>
              <span className="text-sm text-muted-foreground font-body">Choose someone to investigate</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Investigate" color="bg-accent/90 hover:bg-accent" />
          </div>
        );
      case 'doctor':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-doctor/20 text-doctor border-doctor/30 font-display tracking-wider text-xs uppercase"><Shield className="w-3 h-3 mr-1" /> Doctor</Badge>
              <span className="text-sm text-muted-foreground font-body">Choose someone to protect</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} aliveOnly />
            <ActionButton onClick={handleAction} disabled={!selectedTarget} label="Protect" color="bg-doctor/90 hover:bg-doctor" />
          </div>
        );
      case 'witch':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-witch/20 text-witch border-witch/30 font-display tracking-wider text-xs uppercase"><FlaskConical className="w-3 h-3 mr-1" /> Witch</Badge>
            </div>
            {(myPlayer.has_heal_potion || myPlayer.has_poison_potion) ? (
              <>
                <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
                <div className="flex gap-2">
                  {myPlayer.has_heal_potion && (
                    <button onClick={async () => { await submitNightAction('witch_heal', selectedTarget); setActionSubmitted(true); }} disabled={!selectedTarget}
                      className="flex-1 h-11 rounded-lg bg-doctor/90 hover:bg-doctor text-primary-foreground font-display text-xs tracking-[0.12em] uppercase transition-all active:scale-[0.98] disabled:opacity-30">
                      Heal 💚
                    </button>
                  )}
                  {myPlayer.has_poison_potion && (
                    <button onClick={async () => { await submitNightAction('witch_poison', selectedTarget); setActionSubmitted(true); }} disabled={!selectedTarget}
                      className="flex-1 h-11 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display text-xs tracking-[0.12em] uppercase transition-all active:scale-[0.98] disabled:opacity-30">
                      Poison ☠️
                    </button>
                  )}
                </div>
                <button onClick={() => setActionSubmitted(true)}
                  className="w-full h-9 rounded-lg text-muted-foreground font-display text-xs tracking-wider uppercase hover:text-foreground transition-colors">
                  Skip (do nothing)
                </button>
              </>
            ) : (
              <div className="noir-card rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm font-body italic">No potions remaining</p>
                <button onClick={() => setActionSubmitted(true)} className="mt-3 text-xs text-muted-foreground font-display tracking-wider uppercase hover:text-foreground">Skip</button>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="noir-card rounded-lg p-8 text-center">
            <p className="text-2xl mb-2">{getRoleEmoji(myRole)}</p>
            <p className="text-muted-foreground font-body italic">You sleep peacefully through the night...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen night-bg flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <h1 className="font-display text-lg tracking-[0.15em] uppercase text-accent">The Noir Séance</h1>
        <div className="flex items-center gap-3">
          <Moon className="w-4 h-4 text-moon animate-moon-float" />
          <span className="font-display text-sm tracking-wider uppercase">Night {room.round}</span>
        </div>
      </header>

      <div className="flex-1 p-4 lg:p-6">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
          <div className="animate-fade-up">
            <PhaseTimer />
          </div>
          <div className="flex-1 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {renderRoleAction()}
          </div>
          {myRole === 'werewolf' && myPlayer.alive && (
            <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              <p className="text-xs text-primary mb-1 font-display tracking-wider uppercase">🐺 Pack Chat</p>
              <Chat channel="werewolf" maxHeight="150px" />
            </div>
          )}
          {myPlayer.is_moderator && (
            <button onClick={advancePhase} className="w-full h-10 rounded-lg border border-border text-foreground font-display text-xs tracking-[0.12em] uppercase hover:border-primary/30 transition-colors active:scale-[0.98]">
              End Night Phase →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
