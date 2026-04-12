import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, LogOut, Play, Users, Skull, Eye, Shield, BookOpen, Settings, Clock, AlertCircle, HelpCircle, Moon, Sun } from 'lucide-react';
import { assignRoles, getRoleDescription } from '@/lib/gameLogic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Lobby() {
  const { room, players, myPlayer, toggleReady, startGame, leaveRoom } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);

  if (!room || !myPlayer) return null;

  const allReady = players.length >= 4 && players.every(p => p.is_ready);
  const canStart = myPlayer.is_moderator && allReady;
  const neededPlayers = Math.max(0, 4 - players.length);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate role distribution
  const wolfCount = players.length <= 8 ? 2 : players.length <= 12 ? 3 : 4;
  const hasDoctor = players.length >= 6;
  const hasWitch = players.length >= 8;
  const hasHunter = players.length >= 10;

  const roleInfo = [
    { name: 'Werewolf', count: wolfCount, icon: <Skull className="w-4 h-4" />, color: 'text-primary', desc: 'Eliminate the villagers by night without being detected.' },
    { name: 'Seer', count: 1, icon: <Eye className="w-4 h-4" />, color: 'text-accent', desc: 'Peer into the souls of others to reveal their true nature.' },
    { name: 'Doctor', count: hasDoctor ? 1 : 0, icon: <Shield className="w-4 h-4" />, color: 'text-doctor', desc: 'Protect one player each night from attack.', inactive: !hasDoctor },
    ...(hasWitch ? [{ name: 'Witch', count: 1, icon: <AlertCircle className="w-4 h-4" />, color: 'text-witch', desc: 'Wield potions of life and death.' }] : []),
    ...(hasHunter ? [{ name: 'Hunter', count: 1, icon: <AlertCircle className="w-4 h-4" />, color: 'text-hunter', desc: 'Take vengeance upon death.' }] : []),
  ];

  return (
    <div className="min-h-screen mystic-gradient flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[140px] animate-flicker" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5 border-b border-white/10 relative z-20 backdrop-blur-md bg-background/40">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5 shadow-[0_0_15px_-3px_rgba(255,0,0,0.3)]">
            <Skull className="w-4 h-4 lg:w-5 lg:h-5 text-primary animate-pulse" />
          </div>
          <h1 className="font-display text-lg lg:text-2xl tracking-[0.2em] uppercase text-primary-foreground noir-text-glow">The Werewolf</h1>
        </div>
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Mobile Quick Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setShowRules(true)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground transition-all"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-doctor animate-pulse" />
            <span className="font-display text-[9px] lg:text-xs tracking-widest uppercase text-muted-foreground">Server Live</span>
          </div>
          <button onClick={leaveRoom} className="group flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-display text-[10px] tracking-[0.2em] uppercase hidden sm:inline">Leave Game</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 p-6 bg-background/20 backdrop-blur-sm">
          <div className="noir-glass rounded-xl p-4 mb-8 border-white/5 group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary-foreground shadow-inner">
                {myPlayer.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm tracking-widest uppercase truncate">{myPlayer.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-body italic">Status:</span>
                  <span className="text-[10px] text-accent font-display tracking-widest uppercase">Waiting</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-primary/10 border border-primary/30 text-xs font-display tracking-[0.2em] uppercase text-primary-foreground shadow-lg shadow-primary/5">
              <Users className="w-4 h-4" /> Lobby
            </div>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] text-muted-foreground font-display tracking-[0.2em] uppercase hover:bg-white/5 hover:text-foreground transition-all">
              <Skull className="w-4 h-4" /> Dead Players
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] text-muted-foreground font-display tracking-[0.2em] uppercase hover:bg-white/5 hover:text-foreground transition-all">
              <Eye className="w-4 h-4" /> Role Info
            </button>
            <button
              onClick={() => setShowRules(true)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] text-muted-foreground font-display tracking-[0.2em] uppercase hover:bg-white/5 hover:text-foreground transition-all"
            >
              <BookOpen className="w-4 h-4" /> Rules
            </button>
          </nav>

          <div className="mt-auto pt-6">
            <div className="noir-glass rounded-xl p-4 border-white/5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-display">Moderator</p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-display tracking-widest text-foreground uppercase truncate">
                  {players.find(p => p.is_moderator)?.name || 'Initializing...'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dialogs */}
        <Dialog open={showRules} onOpenChange={setShowRules}>
          <DialogContent showClose={false} className="noir-glass border-white/10 bg-black/90 text-foreground max-w-2xl max-h-[85vh] p-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />

            <DialogHeader className="p-8 pb-4 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-display tracking-[0.4em] uppercase text-primary/60">Game Rules</span>
              </div>
              <DialogTitle className="text-3xl font-display tracking-tight uppercase text-primary-foreground noir-text-glow">Rules of the Game</DialogTitle>
              <DialogDescription className="text-muted-foreground font-body italic text-sm">
                Understand the cycle of life and shadow that governs this settlement.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="p-8 h-[50vh]">
              <div className="space-y-10">
                <section className="animate-fade-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h4 className="font-display text-xs tracking-[0.2em] uppercase text-foreground">The Objective</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="noir-glass p-5 rounded-2xl border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] font-display tracking-[0.2em] uppercase text-accent mb-2 block">Villagers</span>
                      <p className="text-[13px] text-muted-foreground font-body leading-relaxed">Identify and eliminate all <span className="text-primary font-bold italic tracking-wider">Werewolves</span> through careful observation and the daily vote. Restore peace to the settlement.</p>
                    </div>
                    <div className="noir-glass p-5 rounded-2xl border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary mb-2 block">Werewolves</span>
                      <p className="text-[13px] text-muted-foreground font-body leading-relaxed">Thin the herd each night. Survive until your collective numbers match or exceed the remaining villagers to claim the settlement.</p>
                    </div>
                  </div>
                </section>

                <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    <h4 className="font-display text-xs tracking-[0.2em] uppercase text-foreground">The Cycle</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-black/40 group hover:border-primary/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Moon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">Night: The Shadow Falls</p>
                        <p className="text-[12px] text-muted-foreground font-body leading-relaxed">The village sleeps. Werewolves choose their victim. Special roles like the <span className="text-accent italic">Seer</span> or <span className="text-doctor italic">Doctor</span> perform their secret duties under the veil of darkness.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-black/40 group hover:border-accent/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                        <Sun className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-display text-[11px] tracking-[0.15em] uppercase text-foreground mb-1">Day: The Judgment</p>
                        <p className="text-[12px] text-muted-foreground font-body leading-relaxed">Dawn reveals the night's dark deeds. The community discusses, accuses, and finally votes to lynch one among them who they suspect of carrying the wolf's blood.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <h4 className="font-display text-xs tracking-[0.2em] uppercase text-foreground">Sacred Roles</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Seer', desc: 'Peers into one soul each night to reveal their true nature.', color: 'text-accent' },
                      { name: 'Doctor', desc: 'Protects one player each night from a werewolf attack.', color: 'text-doctor' },
                      { name: 'Witch', desc: 'Wields two potions: one to save a life, one to take it.', color: 'text-witch' },
                      { name: 'Hunter', desc: 'If slain, they take one final shot at those they suspect.', color: 'text-hunter' }
                    ].map((role) => (
                      <div key={role.name} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <p className={`font-display text-[10px] tracking-[0.2em] uppercase mb-1 ${role.color}`}>{role.name}</p>
                        <p className="text-[11px] text-muted-foreground font-body italic opacity-60 leading-snug">{role.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>

            <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end">
              <button
                onClick={() => setShowRules(false)}
                className="px-8 py-3 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground font-display text-[10px] tracking-[0.3em] uppercase transition-all shadow-lg active:scale-[0.95]"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Waiting Room header */}
            <div className="mb-12 animate-fade-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-primary/50" />
                <span className="text-[10px] font-display tracking-[0.4em] uppercase text-primary/80">Active Game</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h2 className="text-5xl lg:text-7xl font-display font-bold tracking-tight uppercase noir-text-glow leading-none">
                    Lobby
                  </h2>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <span className="text-[11px] text-muted-foreground font-display tracking-[0.2em] uppercase mr-2 opacity-60">Summon Code</span>
                  <button
                    onClick={copyCode}
                    className="group relative flex items-center gap-4 px-6 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all hover:bg-white/[0.05]"
                  >
                    <span className="font-mono text-2xl tracking-[0.4em] text-accent font-bold group-hover:scale-110 transition-transform">
                      {room.code}
                    </span>
                    <div className="h-4 w-px bg-white/10" />
                    {copied ? (
                      <Check className="w-4 h-4 text-doctor animate-bounce" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Players Area */}
            <div className="mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-sm tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Joined Players</span>
                  <span className="text-xs text-primary/60">({players.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {players.map((p, i) => (
                  <div
                    key={p.id}
                    className={`group relative noir-glass rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 ${p.id === myPlayer.id ? 'border-primary/60 bg-primary/10 shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.2)]' : 'border-white/5 hover:border-mystic-teal/30 hover:shadow-[0_0_30px_-5px_hsl(var(--mystic-teal)/0.15)]'
                      }`}
                    style={{ animationDelay: `${i * 50}ms`, animationName: 'fade-up', animationFillMode: 'both' }}
                  >
                    {p.is_moderator && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-display tracking-[0.2em] uppercase px-2 py-0">
                          Host
                        </Badge>
                      </div>
                    )}

                    <div className="relative mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold transition-all duration-500 ${p.is_ready
                        ? 'bg-primary/20 border-2 border-primary text-primary-foreground shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.6)] scale-110'
                        : 'bg-white/5 border border-white/10 text-muted-foreground/60'
                        }`}>
                        {p.name[0].toUpperCase()}
                      </div>
                      {p.is_ready && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center animate-fade-up">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <p className={`font-display text-[11px] tracking-[0.15em] uppercase mb-1.5 truncate w-full ${p.id === myPlayer.id ? 'text-primary-foreground' : 'text-foreground/80'
                      }`}>
                      {p.name}
                      {p.id === myPlayer.id && <span className="opacity-40 ml-1 text-[9px] lowercase italic">(you)</span>}
                    </p>

                    <div className="flex items-center gap-1.5 mt-auto">
                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${p.is_ready ? 'bg-primary shadow-[0_0_8px_hsl(var(--wolf-red))]' : 'bg-white/20'}`} />
                      <span className={`text-[9px] font-display tracking-[0.2em] uppercase transition-all duration-500 ${p.is_ready ? 'text-primary' : 'text-muted-foreground/60'
                        }`}>
                        {p.is_ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Transitions */}
            <div className="noir-glass rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-md mx-auto">
                <div className="mb-8">
                  {neededPlayers > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < players.length ? 'bg-primary' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <h4 className="font-display text-xl tracking-[0.2em] uppercase text-foreground">Waiting for Players</h4>
                      <p className="text-xs text-muted-foreground font-body italic tracking-wide">
                        The game requires {neededPlayers} more player{neededPlayers > 1 ? 's' : ''} to join.
                      </p>
                    </div>
                  ) : !allReady ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full border border-primary/20 mx-auto flex items-center justify-center bg-primary/5 animate-pulse">
                        <Clock className="w-5 h-5 text-primary/60" />
                      </div>
                      <h4 className="font-display text-xl tracking-[0.2em] uppercase text-foreground">Waiting for Ready</h4>
                      <p className="text-xs text-muted-foreground font-body italic tracking-wide">
                        All present must indicate their readiness.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full border-2 border-primary mx-auto flex items-center justify-center bg-primary/10 shadow-[0_0_40px_-10px_rgba(255,0,0,0.4)] animate-breathe">
                        <Skull className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="font-display text-3xl tracking-[0.3em] uppercase text-primary-foreground noir-text-glow">All Players Ready</h4>
                      <p className="text-xs text-primary/80 font-display tracking-[0.2em] uppercase opacity-80">
                        {myPlayer.is_moderator ? 'Initiate the sequence whenever you are prepared.' : 'Awaiting the Host\'s signal...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={toggleReady}
                    className={`relative overflow-hidden w-full sm:w-auto h-14 px-10 rounded-xl font-display text-xs tracking-[0.3em] uppercase transition-all active:scale-[0.98] border shadow-2xl ${myPlayer.is_ready
                      ? 'bg-transparent border-white/20 text-muted-foreground hover:border-white/40'
                      : 'bg-primary/90 hover:bg-primary text-primary-foreground border-transparent shadow-[0_0_40px_-5px_hsl(var(--wolf-red)/0.5)]'
                      }`}
                  >
                    {!myPlayer.is_ready && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 hover:opacity-100" />}
                    <span className="relative z-10">{myPlayer.is_ready ? 'Not Ready' : 'Ready'}</span>
                  </button>

                  {myPlayer.is_moderator && (
                    <button
                      onClick={startGame}
                      disabled={!canStart}
                      className="relative overflow-hidden w-full sm:w-auto h-14 px-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-display text-xs tracking-[0.3em] uppercase transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 shadow-[0_0_40px_-5px_hsl(var(--village-amber)/0.4)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 hover:opacity-100" />
                      <Play className="w-4 h-4 fill-current relative z-10" /> <span className="relative z-10">Start Game</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Ritual Parameters (Hidden on Desktop) */}
            <div className="xl:hidden mb-12 animate-fade-up" style={{ animationDelay: '150ms' }}>
              <div className="noir-glass rounded-3xl p-6 border-accent/20 bg-accent/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-xs tracking-[0.3em] uppercase text-accent">Game Settings</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {roleInfo.filter(r => !r.inactive).map(r => (
                    <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 ${r.color}`}>
                        {r.icon}
                      </div>
                      <div>
                        <p className="font-display text-[9px] tracking-wider uppercase text-foreground/80 leading-none mb-1">{r.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">x{r.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="lg:hidden mt-8 text-center pb-8 border-t border-white/5 pt-8">
              <button
                onClick={leaveRoom}
                className="text-destructive/60 hover:text-destructive text-[10px] font-display tracking-[0.3em] uppercase transition-colors"
              >
                <LogOut className="w-3 h-3 inline mr-2 -translate-y-0.5" /> Leave Game
              </button>
            </div>
          </div>
        </main>

        {/* Right sidebar - Game Setup */}
        <aside className="hidden xl:flex w-80 flex-col border-l border-white/10 p-8 bg-background/20 backdrop-blur-sm overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-4 h-4 text-accent" />
            <h3 className="font-display text-sm tracking-[0.3em] uppercase text-accent">Game Settings</h3>
          </div>

          <div className="space-y-10">
            <section>
              <h4 className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" /> Active Roles
              </h4>
              <div className="space-y-6">
                {roleInfo.map(r => (
                  <div key={r.name} className={`group flex items-start gap-4 transition-opacity ${r.inactive ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-all group-hover:border-primary/40 group-hover:bg-primary/5 ${r.color}`}>
                      {r.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-[11px] tracking-[0.15em] uppercase text-foreground/90 leading-none">
                          {r.name}
                        </p>
                        <Badge className="bg-white/5 text-muted-foreground border-white/10 text-[8px] font-mono px-1.5 py-0">
                          x{r.count}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-body italic leading-tight mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="noir-divider opacity-30" />

            <section>
              <h4 className="font-display text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent" /> Village Rules
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Phase Flow', val: 'Synchronous' },
                  { label: 'Role Reveal', val: 'Immediate' },
                  { label: 'Judgment', val: 'Collective' },
                  { label: 'Whispers', val: 'Forbidden' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">{rule.label}</span>
                    <span className="text-[10px] font-mono text-accent/80 tracking-widest">{rule.val}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4">
              <div className="noir-glass rounded-2xl p-5 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-display text-[11px] tracking-[0.2em] uppercase text-primary-foreground">Ancient Guidance</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-body italic leading-relaxed">
                  "Maintain the balance of three members to one wolf to preserve the natural order of the game."
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
