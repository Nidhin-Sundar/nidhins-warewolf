import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Users, ArrowRight, Plus, Skull } from 'lucide-react';

export function HomeScreen() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const { createRoom, joinRoom, error, setError } = useGameStore();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await createRoom(name.trim());
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    await joinRoom(code.trim(), name.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-screen mystic-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[140px] animate-flicker" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        {/* Animated Hero Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative group animate-float-slow">
            <div className="w-28 h-28 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background/50 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(255,0,0,0.4)] z-10 relative">
              <Skull className="w-14 h-14 text-primary/95 animate-pulse-glow" />
            </div>
            <div className="absolute -inset-6 rounded-full border border-primary/30 animate-breathe opacity-60 mix-blend-screen" />
            <div className="absolute -inset-12 rounded-full border border-mystic-teal/20 animate-spin opacity-40 duration-[10s]" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-6xl font-display font-bold mb-3 tracking-[0.15em] uppercase noir-text-glow relative inline-block text-white">
            The Werewolf
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          </h1>
          <p className="text-mystic-teal/80 text-xl font-body italic tracking-wide mt-4">
            A game of truth and lies
          </p>
        </div>

        {error && (
          <div className="noir-glass rounded-xl p-4 mb-6 border-destructive/30 text-destructive text-sm text-center font-body animate-fade-up">
            <p className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </p>
            <button onClick={() => setError(null)} className="mt-2 text-xs opacity-60 hover:opacity-100 underline underline-offset-4 uppercase tracking-widest transition-opacity">dismiss</button>
          </div>
        )}

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="relative overflow-hidden group w-full h-20 noir-glass rounded-xl flex items-center px-8 justify-between text-xl font-display tracking-[0.2em] uppercase text-primary transition-all hover:bg-primary/10 active:scale-[0.98] border border-primary/30 hover:border-primary/60 shadow-[0_0_30px_-10px_rgba(255,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
              <div className="flex items-center gap-4 relative z-10">
                <Plus className="w-6 h-6 animate-pulse" />
                <span>Create Game</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all relative z-10" />
            </button>
            <button
              onClick={() => setMode('join')}
              className="relative overflow-hidden group w-full h-20 noir-glass rounded-xl flex items-center px-8 justify-between text-xl font-display tracking-[0.2em] uppercase text-mystic-teal transition-all hover:bg-mystic-teal/10 active:scale-[0.98] border border-mystic-teal/30 hover:border-mystic-teal/60 shadow-[0_0_30px_-10px_rgba(0,200,200,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
              <div className="flex items-center gap-4 relative z-10">
                <Users className="w-6 h-6 animate-pulse" />
                <span>Join Game</span>
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all relative z-10" />
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="noir-glass rounded-2xl p-8 space-y-6 border-primary/20 animate-fade-up">
            <div className="space-y-1">
              <h2 className="text-xl font-display tracking-[0.1em] uppercase text-primary/90">Create Game</h2>
              <p className="text-xs text-muted-foreground font-body italic">Start a new game</p>
            </div>
            <div className="noir-divider" />
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground ml-1">Your Name</label>
              <Input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                autoFocus
                className="h-14 bg-white/[0.03] border-white/10 focus:border-primary/50 font-body text-lg placeholder:opacity-30 transition-all"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <Button variant="ghost" onClick={() => setMode('menu')} className="h-12 flex-1 font-display tracking-widest text-xs uppercase hover:bg-white/5 active:scale-[0.97]">Back</Button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-[2] h-12 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground font-display tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20 shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.4)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>Create <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="noir-glass rounded-2xl p-8 space-y-6 border-white/10 animate-fade-up">
            <div className="space-y-1">
              <h2 className="text-xl font-display tracking-[0.15em] uppercase">Join Game</h2>
              <p className="text-xs text-muted-foreground font-body italic">Enter the room code</p>
            </div>
            <div className="noir-divider" />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground ml-1">Your Name</label>
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="h-14 bg-white/[0.03] border-white/10 focus:border-white/30 font-body text-lg transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground ml-1">Room Code</label>
                <Input
                  placeholder="CODE"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="h-14 bg-white/[0.03] border-white/10 focus:border-white/30 font-mono tracking-[0.5em] text-center text-xl transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button variant="ghost" onClick={() => setMode('menu')} className="h-12 flex-1 font-display tracking-widest text-xs uppercase hover:bg-white/5 active:scale-[0.97]">Back</Button>
              <button
                onClick={handleJoin}
                disabled={!name.trim() || code.length < 6 || loading}
                className="flex-[2] h-12 rounded-xl bg-foreground/90 hover:bg-foreground text-background font-display tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>Join <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-12 space-y-2">
          <p className="text-[10px] text-muted-foreground font-display tracking-[0.3em] uppercase opacity-40">
            5–15 players • No account needed
          </p>
          <div className="w-1 h-1 rounded-full bg-primary/30 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
