import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerList } from './PlayerList';
import { Chat } from './Chat';
import { PhaseTimer } from './PhaseTimer';
import { Sun, Vote } from 'lucide-react';

export function DayPhase() {
  const { myPlayer, room, submitVote, advancePhase, votes } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  if (!myPlayer || !room) return null;

  const myVote = votes.find(v => v.round === room.round && v.voter_id === myPlayer.id);
  const voted = hasVoted || !!myVote;

  const handleVote = async () => {
    await submitVote(selectedTarget);
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(228_20%_12%)] to-background flex flex-col p-4">
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-village" />
            <h2 className="text-xl font-bold">Day {room.round}</h2>
          </div>
          <PhaseTimer />
        </div>

        {/* Chat */}
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <Chat channel="public" maxHeight="200px" />
        </div>

        {/* Voting */}
        <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Vote className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Vote to Lynch</span>
            {voted && <Badge className="bg-doctor/20 text-doctor text-xs ml-auto">Voted ✓</Badge>}
          </div>

          {!myPlayer.alive ? (
            <p className="text-sm text-muted-foreground text-center py-4">Dead players cannot vote.</p>
          ) : voted ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Your vote is in. Waiting for others...</p>
            </div>
          ) : (
            <>
              <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
              <Button
                onClick={handleVote}
                disabled={!selectedTarget}
                className="w-full mt-3 bg-wolf hover:bg-wolf/90 active:scale-[0.98]"
              >
                Vote to Lynch
              </Button>
              <Button variant="ghost" onClick={() => { submitVote(null); setHasVoted(true); }} className="w-full mt-1 text-xs">
                Skip vote
              </Button>
            </>
          )}
        </div>

        {/* Moderator advance */}
        {myPlayer.is_moderator && (
          <Button variant="outline" onClick={advancePhase} className="w-full active:scale-[0.98]">
            End Day Phase →
          </Button>
        )}
      </div>
    </div>
  );
}
