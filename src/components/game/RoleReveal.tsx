import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getRoleEmoji, getRoleColor, getRoleDescription } from '@/lib/gameLogic';

export function RoleReveal() {
  const { myPlayer, setScreen, room } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  if (!myPlayer) return null;

  return (
    <div className="min-h-screen noir-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      <div className="w-full max-w-sm animate-fade-up text-center relative z-10">
        {!revealed ? (
          <>
            <div className="text-7xl mb-8 animate-breathe">🃏</div>
            <h2 className="text-3xl font-display font-bold tracking-wider uppercase mb-3 noir-text-glow">Your Role</h2>
            <div className="noir-divider mx-auto w-32 mb-4" />
            <p className="text-muted-foreground mb-8 font-body italic text-lg">Tap to reveal your secret identity</p>
            <button
              onClick={() => setRevealed(true)}
              className="w-full h-14 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98]"
            >
              Reveal Role
            </button>
          </>
        ) : (
          <div className="noir-card rounded-lg p-8 animate-fade-up">
            <div className="text-7xl mb-5">{getRoleEmoji(myPlayer.role)}</div>
            <h2 className={`text-3xl font-display font-bold mb-3 capitalize tracking-wider ${getRoleColor(myPlayer.role)}`}>
              {myPlayer.role}
            </h2>
            <div className="noir-divider mx-auto w-24 mb-4" />
            <p className="text-muted-foreground font-body text-base mb-8 leading-relaxed italic">
              {getRoleDescription(myPlayer.role)}
            </p>
            <button
              onClick={() => setScreen(room?.phase === 'night' ? 'night' : 'day')}
              className="w-full h-12 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground font-display text-sm tracking-[0.15em] uppercase transition-all active:scale-[0.98]"
            >
              Continue to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
