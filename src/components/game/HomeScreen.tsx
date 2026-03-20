import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Moon, Users, ArrowRight, Plus } from 'lucide-react';

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
    <div className="min-h-screen night-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        {/* Moon icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-moon to-yellow-200 animate-moon-float shadow-[0_0_40px_8px_hsl(45_80%_85%/0.2)]" />
            <Moon className="absolute inset-0 m-auto w-10 h-10 text-background/60" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 text-balance leading-[1.1] tracking-tight">
          Werewolf
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          A game of deception & deduction
        </p>

        {error && (
          <Card className="p-3 mb-4 border-destructive bg-destructive/10 text-destructive text-sm text-center">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
          </Card>
        )}

        {mode === 'menu' && (
          <div className="space-y-3">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-14 text-lg gap-3 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-transform"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="secondary"
              className="w-full h-14 text-lg gap-3 active:scale-[0.98] transition-transform"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Join Room
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Create a new room</h2>
            <Input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="h-12"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setMode('menu')} className="active:scale-[0.97]">Back</Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="flex-1 gap-2 active:scale-[0.98] transition-transform"
              >
                {loading ? 'Creating...' : 'Create'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Join a room</h2>
            <Input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="h-12"
            />
            <Input
              placeholder="Room code (e.g. ABC123)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-12 font-mono tracking-widest text-center text-lg"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setMode('menu')} className="active:scale-[0.97]">Back</Button>
              <Button
                onClick={handleJoin}
                disabled={!name.trim() || code.length < 6 || loading}
                className="flex-1 gap-2 active:scale-[0.98] transition-transform"
              >
                {loading ? 'Joining...' : 'Join'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          5–15 players • No account needed
        </p>
      </div>
    </div>
  );
}
