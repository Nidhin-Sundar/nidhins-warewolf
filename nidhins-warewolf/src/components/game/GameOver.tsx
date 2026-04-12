import { useGameStore } from '@/stores/gameStore';
import { PlayerList } from './PlayerList';
import { Trophy, RotateCcw, Landmark } from 'lucide-react';

export function GameOver() {
  const { room, leaveRoom, returnToLobby, myPlayer } = useGameStore();

  if (!room) return null;

  const isWolvesWin = room.winner === 'werewolves';

  return (
    <div className="min-h-screen mystic-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[140px] animate-pulse ${isWolvesWin ? 'bg-primary/10' : 'bg-accent/10'
          }`} />
      </div>

      <div className="w-full max-w-lg animate-fade-up text-center relative z-10 px-4">
        <div className="mb-12 flex justify-center">
          <div className="relative group">
            {/* Pulsing Aura */}
            <div className={`absolute -inset-10 rounded-full blur-[60px] transition-all duration-1000 opacity-40 group-hover:opacity-60 ${isWolvesWin ? 'bg-primary' : 'bg-accent'
              }`} />

            <div className="relative z-10">
              <img
                src={isWolvesWin ? "/werewolves-win.png" : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"}
                alt={isWolvesWin ? "Werewolves Victory" : "Villagers Victory"}
                className={`w-48 h-48 lg:w-56 lg:h-56 object-cover rounded-[2.5rem] border-2 shadow-2xl transform transition-transform duration-700 group-hover:scale-105 ${isWolvesWin ? 'border-primary/40' : 'border-accent/40'
                  }`}
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 rounded-[2.5rem] bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <span className={`text-[10px] font-display tracking-[0.5em] uppercase opacity-60 ${isWolvesWin ? 'text-primary' : 'text-accent'}`}>
            Game Over
          </span>
          <h1 className={`text-4xl lg:text-6xl font-display font-bold tracking-[0.1em] uppercase noir-text-glow ${isWolvesWin ? 'text-primary' : 'text-accent'}`}>
            {isWolvesWin ? 'Werewolves Win' : 'Villagers Win'}
          </h1>
          <div className={`noir-divider mx-auto w-40 opacity-30 ${isWolvesWin ? 'bg-primary' : 'bg-accent'}`} />
          <p className="text-muted-foreground font-body italic text-lg lg:text-xl max-w-sm mx-auto leading-relaxed">
            {isWolvesWin
              ? 'The pack has extinguished the last spark of hope. Darkness reigns supreme.'
              : 'The village has rooted out the ancient evil. A blood-stained peace returns.'}
          </p>
        </div>

        <div className="noir-glass rounded-3xl p-6 lg:p-8 mb-8 text-left border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/60 flex items-center gap-3">
              <Trophy className={`w-4 h-4 ${isWolvesWin ? 'text-primary' : 'text-accent'}`} /> Player Roles
            </h3>
            <div className="w-12 h-px bg-white/10" />
          </div>
          <PlayerList showRoles />
        </div>

        {myPlayer?.is_moderator ? (
          <div className="space-y-4">
            <button
              onClick={returnToLobby}
              className="relative overflow-hidden w-full h-16 rounded-2xl bg-primary/90 hover:bg-primary text-primary-foreground font-display text-xs tracking-[0.3em] uppercase transition-all shadow-lg active:scale-[0.95] flex items-center justify-center gap-4 group border border-primary/20 shadow-[0_0_30px_-5px_hsl(var(--wolf-red)/0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
              <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-700 relative z-10" />
              <span className="relative z-10">Return to Lobby</span>
            </button>
            <button
              onClick={leaveRoom}
              className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-display text-[10px] tracking-[0.3em] uppercase border border-white/10 transition-all active:scale-[0.98]"
            >
              Leave Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-4">
              <div className="w-4 h-4 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
              <span className="font-display text-xs tracking-[0.2em] lg:tracking-[0.3em] uppercase text-muted-foreground">Waiting for Host...</span>
            </div>
            <button
              onClick={leaveRoom}
              className="w-full h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-display text-[10px] tracking-[0.3em] uppercase border border-white/10 transition-all active:scale-[0.98]"
            >
              Leave Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
