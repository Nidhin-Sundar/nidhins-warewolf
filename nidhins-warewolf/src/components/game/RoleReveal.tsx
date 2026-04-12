import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getRoleEmoji, getRoleColor, getRoleDescription } from '@/lib/gameLogic';

export function RoleReveal() {
  const { myPlayer, setScreen, room } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  if (!myPlayer) return null;

  return (
    <div className="min-h-screen mystic-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[140px] animate-flicker" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="w-full max-w-sm animate-fade-up text-center relative z-10">
        {!revealed ? (
          <div className="space-y-10">
            <div className="relative inline-block group animate-float-slow">
              <div className="text-8xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-700 select-none">🃏</div>
              <div className="absolute -inset-8 rounded-full border border-primary/20 animate-breathe" />
              <div className="absolute -inset-12 rounded-full border border-primary/10 animate-pulse duration-[4s]" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-display font-bold tracking-[0.2em] uppercase noir-text-glow">Your Role</h2>
              <div className="noir-divider mx-auto w-40" />
              <p className="text-muted-foreground font-body italic text-lg opacity-60">Peer into the shadows to reveal your true nature</p>
            </div>

            <button
              onClick={() => setRevealed(true)}
              className="group relative w-full h-16 rounded-xl overflow-hidden active:scale-[0.98] transition-all shadow-[0_0_40px_-10px_hsl(var(--wolf-red)/0.5)] border border-primary/20"
            >
              <div className="absolute inset-0 bg-primary/90 group-hover:bg-primary transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <span className="relative z-10 font-display text-sm tracking-[0.3em] uppercase text-primary-foreground">Reveal Role</span>
            </button>
          </div>
        ) : (
          <div className="noir-glass rounded-3xl p-10 animate-fade-up border-primary/30 shadow-[0_0_50px_-10px_rgba(255,0,0,0.2)] relative overflow-hidden">
            {/* Reveal Burst Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[60px] animate-pulse" />

            <div className="relative z-10">
              <div className="text-8xl mb-6 animate-fade-up select-none filter drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                {getRoleEmoji(myPlayer.role)}
              </div>

              <div className="space-y-2 mb-8">
                <span className="text-[10px] font-display tracking-[0.4em] uppercase text-muted-foreground opacity-50">You are a</span>
                <h2 className={`text-3xl sm:text-5xl font-display font-bold capitalize tracking-[0.1em] noir-text-glow ${getRoleColor(myPlayer.role)}`}>
                  {myPlayer.role}
                </h2>
              </div>

              <div className="noir-divider mx-auto w-24 mb-8" />

              <div className="noir-card bg-black/40 border-white/5 p-6 rounded-2xl mb-10">
                <p className="text-foreground/80 font-body text-lg leading-relaxed italic">
                  "{getRoleDescription(myPlayer.role)}"
                </p>
              </div>

              <button
                onClick={() => setScreen(room?.phase === 'night' ? 'night' : 'day')}
                className="relative overflow-hidden w-full h-14 rounded-xl bg-white/10 hover:bg-white/15 text-foreground font-display text-xs tracking-[0.25em] uppercase border border-white/10 transition-all active:scale-[0.98] group shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
                <span className="relative z-10">Continue to Game</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
