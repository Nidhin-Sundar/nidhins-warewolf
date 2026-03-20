import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlayerList } from './PlayerList';
import { Trophy, RotateCcw } from 'lucide-react';

export function GameOver() {
  const { room, leaveRoom } = useGameStore();

  if (!room) return null;

  const isWolvesWin = room.winner === 'werewolves';

  return (
    <div className="min-h-screen night-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up text-center">
        <div className="text-6xl mb-4">
          {isWolvesWin ? '🐺' : '🏘️'}
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isWolvesWin ? 'text-wolf' : 'text-village'}`}>
          {isWolvesWin ? 'Werewolves Win!' : 'Villagers Win!'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isWolvesWin
            ? 'The pack has overtaken the village. Darkness reigns.'
            : 'The village rooted out every werewolf. Peace is restored.'}
        </p>

        <Card className="p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-village" /> Final Roles
          </h3>
          <PlayerList showRoles />
        </Card>

        <Button onClick={leaveRoom} className="w-full gap-2 active:scale-[0.98] transition-transform" size="lg">
          <RotateCcw className="w-4 h-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
}
