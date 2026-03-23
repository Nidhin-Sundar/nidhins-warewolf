import { useGameStore } from '@/stores/gameStore';
import { Badge } from '@/components/ui/badge';
import { getRoleEmoji, getRoleColor } from '@/lib/gameLogic';

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
    <div className="space-y-1.5">
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              isSelected
                ? 'noir-card-selected bg-primary/10 border border-primary/40'
                : 'noir-card'
            } ${isDead ? 'opacity-40 line-through' : ''} ${
              selectable && !isDead && !isMe ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
            }`}
          >
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-display font-bold shrink-0 ${
              isDead ? 'bg-muted' : 'bg-secondary'
            }`}>
              {showRoles ? getRoleEmoji(p.role) : p.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`font-display text-xs tracking-wider uppercase ${isDead ? 'text-muted-foreground' : ''}`}>
                {p.name}
                {isMe && <span className="text-muted-foreground ml-1 normal-case tracking-normal font-body">(you)</span>}
              </span>
              {showRoles && (
                <span className={`block text-[11px] capitalize font-body ${getRoleColor(p.role)}`}>{p.role}</span>
              )}
            </div>
            {isDead && <Badge variant="outline" className="text-[10px] shrink-0 font-display tracking-wider">☠️ Dead</Badge>}
            {voteCount > 0 && !isDead && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] shrink-0 font-display tracking-wider">{voteCount} vote{voteCount > 1 ? 's' : ''}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
