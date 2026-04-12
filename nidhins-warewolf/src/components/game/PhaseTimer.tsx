import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { PHASE_DURATION } from '@/lib/gameLogic';

export function PhaseTimer() {
  const { room, myPlayer, advancePhase } = useGameStore();
  const [remaining, setRemaining] = useState(PHASE_DURATION);
  const [hasAdvanced, setHasAdvanced] = useState(false);

  useEffect(() => {
    setHasAdvanced(false);
  }, [room?.phase, room?.round]);

  useEffect(() => {
    if (!room?.phase_end_at) return;
    const update = () => {
      const end = new Date(room.phase_end_at!).getTime();
      const now = Date.now();
      const left = Math.max(0, Math.ceil((end - now) / 1000));
      setRemaining(left);
      if (left <= 0 && myPlayer?.is_moderator && !hasAdvanced) {
        setHasAdvanced(true);
        advancePhase();
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [room?.phase_end_at, myPlayer?.is_moderator, hasAdvanced]);

  const percent = (remaining / PHASE_DURATION) * 100;
  const isLow = remaining <= 10;

  return (
    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/5 shadow-inner">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.1)] ${isLow ? 'bg-primary animate-pulse' : 'bg-primary/60'
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center gap-2 min-w-[3.5rem] justify-end">
        <span className={`font-display text-xs tracking-[0.2em] tabular-nums font-bold ${isLow ? 'text-primary animate-pulse noir-text-glow' : 'text-muted-foreground/60'
          }`}>
          {remaining}s
        </span>
      </div>
    </div>
  );
}
