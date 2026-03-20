import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  // Check if already acted
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

  // Seer check result
  const seerResult = actions.find(
    a => a.round === round && a.player_id === myPlayer.id && a.action_type === 'seer_check'
  );
  const seerTarget = seerResult ? players.find(p => p.id === seerResult.target_id) : null;

  const renderRoleAction = () => {
    if (isDead) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">You are dead. Watch the game unfold...</p>
        </Card>
      );
    }

    if (alreadyActed) {
      return (
        <Card className="p-6 text-center animate-fade-up">
          <p className="text-doctor text-lg">✓ Action submitted</p>
          <p className="text-muted-foreground text-sm mt-1">Waiting for others...</p>
          {myRole === 'seer' && seerTarget && (
            <div className="mt-4 p-3 rounded-lg bg-seer/10 border border-seer/20">
              <p className="text-sm">
                <strong>{seerTarget.name}</strong> is {seerTarget.role === 'werewolf' ? (
                  <span className="text-wolf font-bold">a Werewolf! 🐺</span>
                ) : (
                  <span className="text-doctor font-bold">not a Werewolf ✓</span>
                )}
              </p>
            </div>
          )}
        </Card>
      );
    }

    switch (myRole) {
      case 'werewolf':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-wolf/20 text-wolf">🐺 Werewolf</Badge>
              <span className="text-sm text-muted-foreground">Choose a victim</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <Button onClick={handleAction} disabled={!selectedTarget} className="w-full bg-wolf hover:bg-wolf/90 active:scale-[0.98]">
              Confirm Kill
            </Button>
          </div>
        );
      
      case 'seer':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-seer/20 text-seer"><Eye className="w-3 h-3 mr-1" /> Seer</Badge>
              <span className="text-sm text-muted-foreground">Choose someone to investigate</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
            <Button onClick={handleAction} disabled={!selectedTarget} className="w-full bg-seer hover:bg-seer/90 active:scale-[0.98]">
              Investigate
            </Button>
          </div>
        );
      
      case 'doctor':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-doctor/20 text-doctor"><Shield className="w-3 h-3 mr-1" /> Doctor</Badge>
              <span className="text-sm text-muted-foreground">Choose someone to protect</span>
            </div>
            <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} aliveOnly />
            <Button onClick={handleAction} disabled={!selectedTarget} className="w-full bg-doctor hover:bg-doctor/90 active:scale-[0.98]">
              Protect
            </Button>
          </div>
        );

      case 'witch':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-witch/20 text-witch"><FlaskConical className="w-3 h-3 mr-1" /> Witch</Badge>
            </div>
            {(myPlayer.has_heal_potion || myPlayer.has_poison_potion) ? (
              <>
                <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
                <div className="flex gap-2">
                  {myPlayer.has_heal_potion && (
                    <Button
                      onClick={async () => {
                        await submitNightAction('witch_heal', selectedTarget);
                        setActionSubmitted(true);
                      }}
                      disabled={!selectedTarget}
                      className="flex-1 bg-doctor hover:bg-doctor/90 active:scale-[0.98]"
                    >
                      Heal 💚
                    </Button>
                  )}
                  {myPlayer.has_poison_potion && (
                    <Button
                      onClick={async () => {
                        await submitNightAction('witch_poison', selectedTarget);
                        setActionSubmitted(true);
                      }}
                      disabled={!selectedTarget}
                      className="flex-1 bg-wolf hover:bg-wolf/90 active:scale-[0.98]"
                    >
                      Poison ☠️
                    </Button>
                  )}
                </div>
                <Button variant="ghost" onClick={() => { setActionSubmitted(true); }} className="w-full">
                  Skip (do nothing)
                </Button>
              </>
            ) : (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground text-sm">No potions remaining</p>
                <Button variant="ghost" onClick={() => setActionSubmitted(true)} className="mt-2">Skip</Button>
              </Card>
            )}
          </div>
        );

      case 'villager':
      case 'hunter':
      default:
        return (
          <Card className="p-6 text-center">
            <p className="text-lg mb-1">{getRoleEmoji(myRole)}</p>
            <p className="text-muted-foreground text-sm">You sleep peacefully through the night...</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen night-bg flex flex-col p-4">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-moon animate-moon-float" />
            <h2 className="text-xl font-bold">Night {room.round}</h2>
          </div>
          <PhaseTimer />
        </div>

        {/* Role action */}
        <div className="flex-1 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {renderRoleAction()}
        </div>

        {/* Werewolf chat */}
        {myRole === 'werewolf' && myPlayer.alive && (
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-xs text-wolf mb-1 font-medium">🐺 Pack Chat</p>
            <Chat channel="werewolf" maxHeight="150px" />
          </div>
        )}

        {/* Moderator advance button */}
        {myPlayer.is_moderator && (
          <Button variant="outline" onClick={advancePhase} className="w-full active:scale-[0.98]">
            End Night Phase →
          </Button>
        )}
      </div>
    </div>
  );
}
