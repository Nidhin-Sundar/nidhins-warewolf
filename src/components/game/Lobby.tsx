import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, LogOut, Play, Users } from 'lucide-react';
import { useState } from 'react';

export function Lobby() {
  const { room, players, myPlayer, toggleReady, startGame, leaveRoom, subscribeToRoom } = useGameStore();
  const [copied, setCopied] = useState(false);

  // Subscription handled by parent Index component

  if (!room || !myPlayer) return null;

  const allReady = players.length >= 5 && players.every(p => p.is_ready);
  const canStart = myPlayer.is_moderator && allReady;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen night-bg flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg animate-fade-up">
        {/* Room code */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Room Code</p>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors active:scale-[0.98]"
          >
            <span className="text-3xl font-mono font-bold tracking-[0.3em]">{room.code}</span>
            {copied ? <Check className="w-5 h-5 text-doctor" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
          </button>
          <p className="text-xs text-muted-foreground mt-2">Share this code with friends</p>
        </div>

        {/* Player list */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{players.length} / 15 players</span>
            {players.length < 5 && (
              <Badge variant="outline" className="text-xs ml-auto">Need {5 - players.length} more</Badge>
            )}
          </div>
          <div className="space-y-2">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary/50 animate-slide-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="flex-1 font-medium">
                  {p.name}
                  {p.id === myPlayer.id && <span className="text-muted-foreground text-xs ml-1">(you)</span>}
                </span>
                {p.is_moderator && (
                  <Badge variant="outline" className="text-xs text-village border-village/30">Host</Badge>
                )}
                {p.is_ready ? (
                  <Badge className="bg-doctor/20 text-doctor text-xs">Ready</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Waiting</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={leaveRoom} className="gap-2 active:scale-[0.97]">
            <LogOut className="w-4 h-4" /> Leave
          </Button>
          <Button
            onClick={toggleReady}
            variant={myPlayer.is_ready ? 'secondary' : 'default'}
            className="flex-1 active:scale-[0.98] transition-transform"
          >
            {myPlayer.is_ready ? 'Not Ready' : 'Ready Up'}
          </Button>
          {myPlayer.is_moderator && (
            <Button
              onClick={startGame}
              disabled={!canStart}
              className="gap-2 bg-village text-accent-foreground hover:bg-village/90 active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              <Play className="w-4 h-4" /> Start
            </Button>
          )}
        </div>

        {myPlayer.is_moderator && !canStart && players.length >= 5 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            All players must be ready to start
          </p>
        )}
      </div>
    </div>
  );
}
