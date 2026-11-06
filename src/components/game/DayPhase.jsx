import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
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
import { Skull, Sun, Vote, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DayPhase() {
  const { myPlayer, room, submitVote, advancePhase, votes, players, messages } = useGameStore();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  if (!myPlayer || !room) return null;

  const myRole = myPlayer.role || 'villager';
  const myVote = votes.find(v => v.round === room.round && v.voter_id === myPlayer.id);
  const votedTargetId = myVote?.target_id;
  const votedTargetPlayer = votedTargetId ? players.find(p => p.id === votedTargetId) : null;
  const isDead = !myPlayer.alive;

  // Find recent dawn / night system message
  const morningMessage = [...messages]
    .reverse()
    .find(m => m.channel === 'system' && (m.content.includes('Dawn') || m.content.includes('did not survive')));

  const handleVote = async () => {
    if (!selectedTarget) return;
    await submitVote(selectedTarget);
  };

  const handleSkipVote = async () => {
    await submitVote(null);
    setSelectedTarget(null);
  };

  const selectedTargetPlayer = selectedTarget ? players.find(p => p.id === selectedTarget) : null;

  return (
    <div className="min-h-screen day-bg text-foreground flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none animate-breathe" />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-8 py-4 border-b border-black/5 bg-background/20 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 leading-tight">Werewolf Game</span>
          <span className="font-display text-lg lg:text-xl tracking-[0.2em] uppercase text-foreground">Day {room.round}</span>
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
            <Sun className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span className="font-display text-[9px] lg:text-[10px] tracking-widest uppercase text-accent">Day Phase</span>
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
              <span className="font-display text-[10px] tracking-widest uppercase text-accent block mb-1">Daytime Strategy</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {myRole === 'werewolf'
                  ? 'Blend in with villagers! Act innocent, participate in discussion, and subtly guide suspicion away from yourself and your pack.'
                  : 'Compare night casualties with who spoke up yesterday. Ask suspects questions and vote together with other villagers.'}
              </p>
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
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-12">
          {/* Morning Report Banner */}
          {morningMessage && (
            <div className="noir-glass p-4 rounded-2xl border-accent/20 bg-accent/[0.03] flex items-center gap-3 animate-fade-up">
              <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-accent" />
              </div>
              <div className="text-xs">
                <span className="font-display tracking-widest uppercase text-accent block text-[10px] mb-0.5">Morning Report</span>
                <span className="text-foreground/90 font-body text-xs">{morningMessage.content}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Discussion */}
            <div className="lg:col-span-7 flex flex-col gap-4 order-2 lg:order-1">
              <div className="noir-glass rounded-3xl p-6 flex flex-col h-[450px] lg:h-[550px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <h3 className="font-display text-xs tracking-[0.2em] uppercase text-foreground">Village Discussion</h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-body italic">Discuss & deduce</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Chat channel="public" maxHeight="100%" />
                </div>
              </div>
            </div>

            {/* Right Column - Voting & Timer */}
            <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-2">
              {/* Timer */}
              <PhaseTimer />

              {/* Voting Box */}
              <div className="noir-glass rounded-3xl p-6 relative overflow-hidden bg-background/40">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-sm tracking-[0.2em] uppercase text-foreground">Town Vote</h4>
                      <p className="text-[10px] text-muted-foreground font-body">Vote to eliminate a suspected werewolf.</p>
                    </div>

                    {votedTargetPlayer ? (
                      <Badge className="bg-doctor/20 text-doctor border-doctor/40 text-[9px] font-display tracking-widest uppercase">
                        Voted: {votedTargetPlayer.name}
                      </Badge>
                    ) : myVote ? (
                      <Badge className="bg-white/10 text-muted-foreground border-white/20 text-[9px] font-display tracking-widest uppercase">
                        Vote Skipped
                      </Badge>
                    ) : null}
                  </div>

                  <div className="noir-divider opacity-10" />

                  {isDead ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 rounded-full border border-white/10 mx-auto flex items-center justify-center mb-3 bg-white/5 opacity-50">
                        <Skull className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">
                        You have been eliminated. You cannot vote or participate in discussion.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <PlayerList
                        selectable
                        onSelect={setSelectedTarget}
                        selectedId={selectedTarget || votedTargetId}
                        excludeSelf
                        aliveOnly
                      />

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={handleVote}
                          disabled={!selectedTarget || selectedTarget === votedTargetId}
                          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xs tracking-[0.25em] uppercase transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-25 disabled:grayscale flex items-center justify-center gap-2"
                        >
                          <Vote className="w-4 h-4" />
                          <span>
                            {votedTargetId && selectedTarget && selectedTarget !== votedTargetId
                              ? `Change Vote to ${selectedTargetPlayer?.name}`
                              : selectedTarget
                              ? `Vote to Eliminate ${selectedTargetPlayer?.name}`
                              : 'Select a Player Above to Vote'}
                          </span>
                        </button>

                        <button
                          onClick={handleSkipVote}
                          className="w-full py-2.5 text-[10px] text-muted-foreground font-display tracking-[0.2em] uppercase hover:text-foreground transition-colors"
                        >
                          Abstain / Skip Vote
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Moderator End Day Button */}
              {myPlayer.is_moderator && (
                <button
                  onClick={advancePhase}
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-display text-[10px] tracking-[0.3em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  End Day Early & Tally Votes →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
