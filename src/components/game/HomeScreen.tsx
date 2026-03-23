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
    <div className="min-h-screen noir-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center animate-pulse-glow">
              <Skull className="w-12 h-12 text-primary/80" />
            </div>
            <div className="absolute -inset-4 rounded-full border border-primary/10 animate-breathe" />
          </div>
        </div>

        <h1 className="text-5xl font-display font-bold text-center mb-3 tracking-wider uppercase noir-text-glow">
          The Noir Séance
        </h1>
        <div className="noir-divider mx-auto w-48 mb-3" />
        <p className="text-center text-muted-foreground text-lg mb-10 font-body italic">
          A game of deception & deduction
        </p>

        {error && (
          <div className="noir-card rounded-lg p-3 mb-4 border-destructive/40 text-destructive text-sm text-center font-body">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline text-xs opacity-70 hover:opacity-100">dismiss</button>
          </div>
        )}

        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full h-16 noir-card rounded-lg flex items-center justify-center gap-3 text-lg font-display tracking-[0.15em] uppercase text-primary-foreground bg-primary/90 hover:bg-primary transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full h-16 noir-card rounded-lg flex items-center justify-center gap-3 text-lg font-display tracking-[0.15em] uppercase text-foreground hover:border-primary/30 transition-all active:scale-[0.98]"
            >
              <Users className="w-5 h-5" />
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="noir-card rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-display tracking-wider uppercase">Create a New Room</h2>
            <div className="noir-divider" />
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="h-12 bg-background/50 border-border font-body text-base placeholder:text-muted-foreground/50"
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setMode('menu')} className="font-display tracking-wider text-xs uppercase active:scale-[0.97]">Back</Button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-1 h-11 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display tracking-[0.15em] uppercase text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
              >
                {loading ? 'Creating...' : 'Create'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="noir-card rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-display tracking-wider uppercase">Join a Room</h2>
            <div className="noir-divider" />
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="h-12 bg-background/50 border-border font-body text-base placeholder:text-muted-foreground/50"
            />
            <Input
              placeholder="Room Code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-12 bg-background/50 border-border font-mono tracking-[0.4em] text-center text-lg placeholder:tracking-normal placeholder:text-muted-foreground/50"
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setMode('menu')} className="font-display tracking-wider text-xs uppercase active:scale-[0.97]">Back</Button>
              <button
                onClick={handleJoin}
                disabled={!name.trim() || code.length < 6 || loading}
                className="flex-1 h-11 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display tracking-[0.15em] uppercase text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
              >
                {loading ? 'Joining...' : 'Join'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-10 font-body tracking-wide">
          5–15 players • No account needed
        </p>
      </div>
    </div>
  );
}
