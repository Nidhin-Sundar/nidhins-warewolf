import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, LogOut, Play, Users, Skull, Eye, Shield, BookOpen, Settings, Clock, AlertCircle } from 'lucide-react';
import { assignRoles, getRoleDescription } from '@/lib/gameLogic';

export function Lobby() {
  const { room, players, myPlayer, toggleReady, startGame, leaveRoom } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!room || !myPlayer) return null;

  const allReady = players.length >= 5 && players.every(p => p.is_ready);
  const canStart = myPlayer.is_moderator && allReady;
  const neededPlayers = Math.max(0, 5 - players.length);

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
    <div className="min-h-screen noir-gradient flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <h1 className="font-display text-lg tracking-[0.15em] uppercase text-accent">The Noir Séance</h1>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm tracking-wider uppercase text-foreground">Lobby</span>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="hidden lg:flex w-56 flex-col border-r border-border/50 p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
              {myPlayer.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display text-sm tracking-wider uppercase">{myPlayer.name}</p>
              <p className="text-xs text-muted-foreground">Role: Unknown</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-primary/10 border-l-2 border-primary text-sm font-display tracking-wider uppercase text-foreground">
              <Users className="w-4 h-4" /> Lobby
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground font-display tracking-wider uppercase hover:text-foreground/70 transition-colors">
              <Skull className="w-4 h-4" /> Graveyard
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground font-display tracking-wider uppercase hover:text-foreground/70 transition-colors">
              <Eye className="w-4 h-4" /> Roles
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground font-display tracking-wider uppercase hover:text-foreground/70 transition-colors">
              <BookOpen className="w-4 h-4" /> Rules
            </div>
          </nav>

          <button
            onClick={leaveRoom}
            className="mt-auto w-full h-10 rounded-lg border border-destructive/40 text-destructive text-sm font-display tracking-[0.15em] uppercase hover:bg-destructive/10 transition-colors active:scale-[0.97]"
          >
            Leave Game
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Waiting Room header */}
            <div className="mb-8 animate-fade-up">
              <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-wider uppercase mb-3">Waiting Room</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-display tracking-wider uppercase">Room Code:</span>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-secondary border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="font-mono text-lg tracking-[0.3em] text-accent font-bold">#{room.code}</span>
                  {copied ? <Check className="w-4 h-4 text-doctor" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            {/* Player grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className={`noir-card rounded-lg p-4 flex flex-col items-center text-center relative animate-slide-in ${
                    p.id === myPlayer.id ? 'noir-card-selected' : ''
                  }`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {p.is_moderator && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-display tracking-wider uppercase px-2 py-0.5">
                        Host
                      </Badge>
                    </div>
                  )}
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-sm bg-secondary/80 mb-3 flex items-center justify-center overflow-hidden border border-border/50">
                    <div className="text-2xl lg:text-3xl font-display text-muted-foreground/60 font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                  </div>
                  <p className="font-display text-xs tracking-[0.12em] uppercase mb-1.5 truncate w-full">
                    {p.name}
                    {p.id === myPlayer.id && <span className="text-muted-foreground ml-1">(you)</span>}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className={`status-dot ${p.is_ready ? 'status-ready' : 'status-waiting'}`} />
                    <span className={`text-[10px] font-display tracking-wider uppercase ${p.is_ready ? 'text-primary' : 'text-muted-foreground'}`}>
                      {p.is_ready ? 'Ready' : 'Waiting...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status & Actions */}
            <div className="text-center mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
              {neededPlayers > 0 ? (
                <>
                  <p className="font-display text-sm tracking-wider uppercase text-foreground mb-1">Waiting for others to join...</p>
                  <p className="text-xs text-muted-foreground font-display tracking-wider uppercase">
                    Minimum {neededPlayers} more player{neededPlayers > 1 ? 's' : ''} required to initiate the séance
                  </p>
                </>
              ) : !allReady ? (
                <p className="font-display text-sm tracking-wider uppercase text-muted-foreground">
                  All players must be ready to begin
                </p>
              ) : (
                <p className="font-display text-sm tracking-wider uppercase text-primary animate-breathe">
                  The séance may begin...
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '250ms' }}>
              <button
                onClick={toggleReady}
                className={`h-12 px-8 rounded-lg font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] ${
                  myPlayer.is_ready
                    ? 'bg-secondary border border-border text-muted-foreground hover:border-primary/30'
                    : 'bg-primary/90 hover:bg-primary text-primary-foreground'
                }`}
              >
                {myPlayer.is_ready ? 'Not Ready' : 'Ready Up'}
              </button>

              {myPlayer.is_moderator && (
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className="h-12 px-8 rounded-lg bg-accent/90 hover:bg-accent text-accent-foreground font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start Game
                </button>
              )}

              <button
                onClick={copyCode}
                className="h-12 px-6 rounded-lg border border-border text-foreground font-display text-sm tracking-[0.15em] uppercase hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                Invite
              </button>
            </div>

            {/* Mobile leave button */}
            <div className="lg:hidden mt-6 text-center">
              <button
                onClick={leaveRoom}
                className="text-destructive text-xs font-display tracking-wider uppercase hover:underline"
              >
                <LogOut className="w-3 h-3 inline mr-1" /> Leave Game
              </button>
            </div>
          </div>
        </main>

        {/* Right sidebar - Game Setup */}
        <aside className="hidden xl:flex w-72 flex-col border-l border-border/50 p-5 overflow-y-auto">
          <h3 className="font-display text-sm tracking-[0.15em] uppercase text-accent mb-5">Game Setup</h3>

          <div className="mb-5">
            <h4 className="font-display text-xs tracking-[0.12em] uppercase text-muted-foreground mb-3">Active Roles</h4>
            <div className="space-y-3">
              {roleInfo.map(r => (
                <div key={r.name} className={`flex items-start gap-3 ${r.inactive ? 'opacity-40' : ''}`}>
                  <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 ${r.color}`}>
                    {r.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-xs tracking-wider uppercase">
                      {r.name} {r.count > 1 ? `(${r.count})` : ''}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body leading-tight mt-0.5">{r.desc}</p>
                    {r.inactive && <p className="text-[10px] text-muted-foreground font-display tracking-wider uppercase">(Not Active)</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="noir-divider mb-5" />

          <div className="mb-5">
            <h4 className="font-display text-xs tracking-[0.12em] uppercase text-muted-foreground mb-3">Current Rules</h4>
            <div className="space-y-2.5">
              {[
                'Phase Duration: Day (60s) / Night (60s)',
                'Death Reveal: Enabled (Role shown on death)',
                'Voting: Public & Final',
                'Chat: Dead cannot speak to the living.',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground font-body">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="noir-divider mb-5" />

          <div className="noir-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-primary" />
              <span className="font-display text-[10px] tracking-wider uppercase font-bold">Host Tip</span>
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Balance the game by ensuring at least 3 villagers for every 1 werewolf.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
