import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
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
    <div className="min-h-screen noir-gradient flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <h1 className="font-display text-lg tracking-[0.15em] uppercase text-accent">The Noir Séance</h1>
        <div className="flex items-center gap-3">
          <Sun className="w-4 h-4 text-accent" />
          <span className="font-display text-sm tracking-wider uppercase">Day {room.round}</span>
        </div>
      </header>

      <div className="flex-1 p-4 lg:p-6">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
          <div className="animate-fade-up">
            <PhaseTimer />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <Chat channel="public" maxHeight="220px" />
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Vote className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-display tracking-wider uppercase">Vote to Lynch</span>
              {voted && <Badge className="bg-doctor/20 text-doctor border-doctor/30 text-[10px] font-display tracking-wider ml-auto">Voted ✓</Badge>}
            </div>

            {!myPlayer.alive ? (
              <p className="text-sm text-muted-foreground text-center py-6 font-body italic">Dead players cannot vote.</p>
            ) : voted ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground font-body italic">Your vote is in. Waiting for others...</p>
              </div>
            ) : (
              <>
                <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />
                <button
                  onClick={handleVote}
                  disabled={!selectedTarget}
                  className="w-full h-11 mt-3 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                >
                  Vote to Lynch
                </button>
                <button
                  onClick={() => { submitVote(null); setHasVoted(true); }}
                  className="w-full mt-1 text-xs text-muted-foreground font-display tracking-wider uppercase hover:text-foreground transition-colors py-2"
                >
                  Skip vote
                </button>
              </>
            )}
          </div>

          {myPlayer.is_moderator && (
            <button onClick={advancePhase} className="w-full h-10 rounded-lg border border-border text-foreground font-display text-xs tracking-[0.12em] uppercase hover:border-primary/30 transition-colors active:scale-[0.98]">
              End Day Phase →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
