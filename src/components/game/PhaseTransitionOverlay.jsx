import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { sound } from '@/lib/sound';

export function PhaseTransitionOverlay({ phase, round }) {
  const [active, setActive] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState(null);

  useEffect(() => {
    if (!phase) return;
    setTransitionPhase(phase);
    setActive(true);

    if (phase === 'night') {
      sound.playNightfall();
      setTimeout(() => sound.playWolfHowl(), 600);
      sound.startAmbient('night');
    } else if (phase === 'day') {
      sound.playDawnBell();
      sound.startAmbient('day');
    }

    const timer = setTimeout(() => {
      setActive(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, [phase, round]);

  if (!active || !transitionPhase) return null;

  const isNight = transitionPhase === 'night';

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Dynamic Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isNight
            ? 'bg-gradient-to-b from-indigo-950/90 via-black/95 to-red-950/90'
            : 'bg-gradient-to-b from-amber-950/90 via-orange-950/80 to-stone-950/90'
        } backdrop-blur-md animate-fade-in`}
      />

      {/* Atmospheric Fog / Vignette */}
      <div className="absolute inset-0 noir-vignette opacity-80" />

      {/* Orb / Celestial Body Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 animate-scale-up">
        {isNight ? (
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-red-600/20 blur-2xl absolute -inset-4 animate-pulse" />
            <div className="w-28 h-28 rounded-full border-2 border-red-500/50 bg-gradient-to-tr from-red-900 via-rose-950 to-neutral-900 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
              <Moon className="w-14 h-14 text-rose-300 animate-float-slow" />
            </div>
            {/* Blood particles aura */}
            <div className="absolute -top-3 -right-3 text-2xl animate-bounce">🐺</div>
          </div>
        ) : (
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-amber-500/20 blur-2xl absolute -inset-4 animate-pulse" />
            <div className="w-28 h-28 rounded-full border-2 border-amber-400/50 bg-gradient-to-tr from-amber-600 via-yellow-700 to-stone-900 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.5)]">
              <Sun className="w-14 h-14 text-amber-200 animate-spin duration-[20s]" />
            </div>
            <div className="absolute -top-3 -right-3 text-2xl animate-bounce">☀️</div>
          </div>
        )}

        <span className="text-xs font-display tracking-[0.5em] uppercase text-white/60 mb-2">
          {isNight ? 'Darkness Descends' : 'A New Day Awakens'}
        </span>
        <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-[0.2em] text-white noir-text-glow">
          {isNight ? 'Night Falls' : 'Dawn Arrives'}
        </h2>
        {round && (
          <p className="mt-2 text-sm font-display tracking-widest text-white/50 uppercase">
            — Round {round} —
          </p>
        )}
      </div>
    </div>
  );
}

