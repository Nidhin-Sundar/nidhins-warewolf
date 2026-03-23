import { useGameStore } from '@/stores/gameStore';
import { PlayerList } from './PlayerList';
import { Trophy, RotateCcw } from 'lucide-react';

export function GameOver() {
  const { room, leaveRoom } = useGameStore();

  if (!room) return null;

  const isWolvesWin = room.winner === 'werewolves';

  return (
    <div className="min-h-screen noir-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${
          isWolvesWin ? 'bg-primary/[0.06]' : 'bg-accent/[0.06]'
        }`} />
      </div>

      <div className="w-full max-w-md animate-fade-up text-center relative z-10">
        <div className="text-7xl mb-6">
          {isWolvesWin ? '🐺' : '🏘️'}
        </div>
        <h1 className={`text-4xl font-display font-bold mb-3 tracking-wider uppercase noir-text-glow ${isWolvesWin ? 'text-primary' : 'text-accent'}`}>
          {isWolvesWin ? 'Werewolves Win' : 'Villagers Win'}
        </h1>
        <div className="noir-divider mx-auto w-32 mb-4" />
        <p className="text-muted-foreground mb-8 font-body italic text-lg">
          {isWolvesWin
            ? 'The pack has overtaken the village. Darkness reigns.'
            : 'The village rooted out every werewolf. Peace is restored.'}
        </p>

        <div className="noir-card rounded-lg p-5 mb-6 text-left">
          <h3 className="text-xs font-display tracking-[0.12em] uppercase mb-4 flex items-center gap-2 text-accent">
            <Trophy className="w-4 h-4" /> Final Roles
          </h3>
          <PlayerList showRoles />
        </div>

        <button
          onClick={leaveRoom}
          className="w-full h-12 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </div>
  );
}
