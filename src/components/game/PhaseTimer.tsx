import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Progress } from '@/components/ui/progress';
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
    <div className="flex items-center gap-3">
      <Progress value={percent} className={`h-2 flex-1 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`} />
      <span className={`font-mono text-sm tabular-nums font-bold min-w-[3ch] text-right ${isLow ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
        {remaining}s
      </span>
    </div>
  );
}
