import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Badge } from '@/components/ui/badge';
import { PlayerList } from './PlayerList';
import { Chat } from './Chat';
import { PhaseTimer } from './PhaseTimer';
import { Skull, Sun, Vote } from 'lucide-react';

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
    <div className="min-h-screen day-bg text-foreground flex flex-col relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-mystic-dawn rounded-full blur-[100px] animate-pulse" />
      </div>
      {/* Daylight Glow */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none animate-breathe" />

      <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-black/5 bg-background/20 backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="font-display text-xs tracking-[0.4em] uppercase text-muted-foreground/60 leading-tight">The Village</h1>
          <div className="flex items-center gap-3">
            <span className="font-display text-xl tracking-[0.2em] uppercase text-foreground">Day {room.round}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Sun className="w-4 h-4 text-accent animate-pulse" />
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-accent">Day Phase</span>
        </div>
      </header>

      <main className="flex-1 relative z-10 p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-12">

          {/* Left Column - Discussion */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
            <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="noir-glass rounded-3xl p-6 lg:p-8 flex flex-col h-[400px] lg:h-[600px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <h3 className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Public Chat</h3>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Chat channel="public" maxHeight="100%" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
            {/* Timer Section */}
            <div className="animate-fade-up">
              <div className="noir-glass p-1 rounded-2xl border-white/5">
                <PhaseTimer />
              </div>
            </div>

            {/* Voting Section */}
            <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="noir-glass rounded-3xl p-6 lg:p-8 relative overflow-hidden bg-background/40">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-display text-sm tracking-[0.2em] uppercase text-foreground">Vote</h4>
                      <p className="text-[10px] text-muted-foreground font-body italic opacity-60">Decide who must face the final verdict.</p>
                    </div>
                    {voted && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-doctor/20 border border-doctor/30 animate-fade-up">
                        <div className="w-1 h-1 rounded-full bg-doctor animate-pulse" />
                        <span className="text-[9px] font-display tracking-widest uppercase text-doctor">Voted</span>
                      </div>
                    )}
                  </div>

                  <div className="noir-divider opacity-10 mb-6" />

                  {!myPlayer.alive ? (
                    <div className="text-center py-12 px-6">
                      <div className="w-12 h-12 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-4 bg-white/5 opacity-40">
                        <Skull className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-body italic">The dead have no voice in the square.</p>
                    </div>
                  ) : voted ? (
                    <div className="text-center py-12 px-6 animate-fade-up">
                      <div className="w-14 h-14 rounded-xl border border-primary/20 mx-auto flex items-center justify-center mb-6 bg-primary/5 text-primary shadow-[0_0_20px_-5px_rgba(255,0,0,0.2)]">
                        <Vote className="w-6 h-6" />
                      </div>
                      <h5 className="font-display text-lg tracking-[0.2em] uppercase text-foreground mb-2">Vote Confirmed</h5>
                      <p className="text-xs text-muted-foreground/60 font-body italic">The village awaits the final count.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <PlayerList selectable onSelect={setSelectedTarget} selectedId={selectedTarget} excludeSelf aliveOnly />

                      <div className="space-y-3">
                        <button
                          onClick={handleVote}
                          disabled={!selectedTarget}
                          className="relative overflow-hidden w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xs tracking-[0.3em] uppercase transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
                          <Skull className="w-4 h-4 relative z-10" /> <span className="relative z-10">Confirm Vote</span>
                        </button>

                        <button
                          onClick={() => { submitVote(null); setHasVoted(true); }}
                          className="w-full py-3 text-[10px] text-muted-foreground font-display tracking-[0.3em] uppercase hover:text-foreground transition-colors group"
                        >
                          <span className="opacity-40 group-hover:opacity-100 transition-opacity">Skip Vote</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Moderator Control */}
            {myPlayer.is_moderator && (
              <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={advancePhase}
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-display text-[10px] tracking-[0.4em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  End Day Phase <span className="opacity-40">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Atmospheric Horizon Effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none" />
    </div>
  );
}
