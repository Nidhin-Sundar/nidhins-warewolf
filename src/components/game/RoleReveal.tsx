import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getRoleEmoji, getRoleColor, getRoleDescription } from '@/lib/gameLogic';

export function RoleReveal() {
  const { myPlayer, setScreen, room } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  if (!myPlayer) return null;

  return (
    <div className="min-h-screen night-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up text-center">
        {!revealed ? (
          <>
            <div className="text-6xl mb-6">🃏</div>
            <h2 className="text-2xl font-bold mb-2">Your Role</h2>
            <p className="text-muted-foreground mb-6">Tap to reveal your secret identity</p>
            <Button
              onClick={() => setRevealed(true)}
              className="w-full h-14 text-lg active:scale-[0.98] transition-transform"
              size="lg"
            >
              Reveal Role
            </Button>
          </>
        ) : (
          <Card className="p-8 animate-fade-up">
            <div className="text-6xl mb-4">{getRoleEmoji(myPlayer.role)}</div>
            <h2 className={`text-3xl font-bold mb-2 capitalize ${getRoleColor(myPlayer.role)}`}>
              {myPlayer.role}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {getRoleDescription(myPlayer.role)}
            </p>
            <Button
              onClick={() => setScreen(room?.phase === 'night' ? 'night' : 'day')}
              className="w-full active:scale-[0.98] transition-transform"
            >
              Continue to Game
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
