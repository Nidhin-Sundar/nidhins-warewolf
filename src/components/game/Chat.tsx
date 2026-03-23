import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface ChatProps {
  channel?: 'public' | 'werewolf' | 'system';
  maxHeight?: string;
}

export function Chat({ channel = 'public', maxHeight = '300px' }: ChatProps) {
  const { messages, players, myPlayer, sendMessage } = useGameStore();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(m => {
    if (channel === 'public') return m.channel === 'public' || m.channel === 'system';
    return m.channel === channel;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim(), channel);
    setText('');
  };

  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'System';
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  return (
    <div className="flex flex-col noir-card rounded-lg overflow-hidden">
      <ScrollArea style={{ height: maxHeight }} className="p-3">
        <div className="space-y-2">
          {filteredMessages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 font-body italic">No messages yet</p>
          )}
          {filteredMessages.map((msg) => {
            const isSystem = msg.channel === 'system';
            const isMe = msg.player_id === myPlayer?.id;
            return (
              <div key={msg.id} className={`animate-slide-in ${isSystem ? 'text-center' : ''}`} style={{ animationDelay: '0ms' }}>
                {isSystem ? (
                  <p className="text-xs text-accent py-1.5 px-3 rounded bg-accent/5 inline-block font-body italic border border-accent/10">
                    {msg.content}
                  </p>
                ) : (
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted-foreground mb-0.5 font-display tracking-wider uppercase">{getPlayerName(msg.player_id)}</span>
                    <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[80%] font-body ${
                      isMe
                        ? 'bg-primary/15 text-foreground border border-primary/10'
                        : msg.channel === 'werewolf'
                          ? 'bg-primary/10 text-foreground border border-primary/20'
                          : 'bg-secondary text-foreground border border-border/50'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      
      {!myPlayer?.alive ? null : (
        <div className="flex gap-2 p-2 border-t border-border/50">
          <Input
            placeholder={channel === 'werewolf' ? 'Werewolf chat...' : 'Type a message...'}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="h-9 text-sm bg-background/50 border-border font-body placeholder:text-muted-foreground/50"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="h-9 w-9 shrink-0 rounded-md bg-primary/80 hover:bg-primary text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-[0.95]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
