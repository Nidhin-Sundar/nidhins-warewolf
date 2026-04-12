import { useGameStore } from '@/stores/gameStore';
import { Badge } from '@/components/ui/badge';
import { getRoleEmoji, getRoleColor } from '@/lib/gameLogic';
import { Skull } from 'lucide-react';

interface PlayerListProps {
  onSelect?: (playerId: string) => void;
  selectedId?: string | null;
  selectable?: boolean;
  showRoles?: boolean;
  excludeSelf?: boolean;
  aliveOnly?: boolean;
}

export function PlayerList({ onSelect, selectedId, selectable = false, showRoles = false, excludeSelf = false, aliveOnly = false }: PlayerListProps) {
  const { players, myPlayer, votes, room } = useGameStore();

  let filtered = players;
  if (excludeSelf && myPlayer) filtered = filtered.filter(p => p.id !== myPlayer.id);
  if (aliveOnly) filtered = filtered.filter(p => p.alive);

  const currentVotes = votes.filter(v => v.round === room?.round);
  const voteCounts: Record<string, number> = {};
  currentVotes.forEach(v => { if (v.target_id) voteCounts[v.target_id] = (voteCounts[v.target_id] || 0) + 1; });

  return (
    <div className="space-y-3">
      {filtered.map(p => {
        const isMe = p.id === myPlayer?.id;
        const isSelected = p.id === selectedId;
        const isDead = !p.alive;
        const voteCount = voteCounts[p.id] || 0;

        return (
          <button
            key={p.id}
            disabled={!selectable || isDead || isMe}
            onClick={() => onSelect?.(p.id)}
            className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all overflow-hidden ${isSelected
              ? 'noir-glass border-primary/50 bg-primary/10 shadow-[0_0_20px_-5px_hsl(var(--wolf-red)/0.25)]'
              : 'noir-glass border-white/5 hover:border-white/20'
              } ${isDead ? 'opacity-30' : ''} ${selectable && !isDead && !isMe ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
              } ${isMe && !isDead ? 'animate-pulse-slow ring-1 ring-primary/20' : ''}`}
          >
            {/* Background Highlight for Active Selection */}
            {isSelected && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold shrink-0 transition-transform duration-300 group-hover:scale-110 ${isDead
              ? 'bg-muted/20 border border-white/10 text-muted-foreground'
              : isMe ? 'bg-primary/20 border border-primary/40 text-primary-foreground shadow-[0_0_15px_-3px_rgba(255,0,0,0.3)]' : 'bg-white/5 border border-white/10 text-foreground/70'
              }`}>
              {showRoles ? getRoleEmoji(p.role) : p.name[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-display text-xs tracking-[0.15em] uppercase truncate ${isDead ? 'text-muted-foreground line-through' : 'text-foreground/90'}`}>
                  {p.name}
                </span>
                {isMe && (
                  <Badge variant="outline" className="text-[8px] bg-primary/10 border-primary/20 text-primary px-1 py-0 font-display tracking-widest uppercase h-3.5">
                    Self
                  </Badge>
                )}
              </div>
              {showRoles && (
                <span className={`block text-[10px] uppercase font-display tracking-widest mt-0.5 ${getRoleColor(p.role)}`}>
                  {p.role}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isDead && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <Skull className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[9px] font-display tracking-widest uppercase text-muted-foreground/60">Released</span>
                </div>
              )}
              {voteCount > 0 && !isDead && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/20 border border-primary/30 animate-fade-up">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-display tracking-widest uppercase text-primary-foreground">
                    {voteCount} Under Watch
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
