import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col bg-card/50 rounded-lg border border-border overflow-hidden">
      <ScrollArea style={{ height: maxHeight }} className="p-3">
        <div className="space-y-2">
          {filteredMessages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
          )}
          {filteredMessages.map((msg, i) => {
            const isSystem = msg.channel === 'system';
            const isMe = msg.player_id === myPlayer?.id;
            return (
              <div key={msg.id} className={`animate-slide-in ${isSystem ? 'text-center' : ''}`} style={{ animationDelay: '0ms' }}>
                {isSystem ? (
                  <p className="text-xs text-village py-1 px-2 rounded bg-village/10 inline-block">
                    {msg.content}
                  </p>
                ) : (
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-muted-foreground mb-0.5">{getPlayerName(msg.player_id)}</span>
                    <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[80%] ${
                      isMe
                        ? 'bg-primary/20 text-foreground'
                        : msg.channel === 'werewolf'
                          ? 'bg-wolf/15 text-foreground border border-wolf/20'
                          : 'bg-secondary text-foreground'
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
        <div className="flex gap-2 p-2 border-t border-border">
          <Input
            placeholder={channel === 'werewolf' ? 'Werewolf chat...' : 'Type a message...'}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="h-9 text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim()} className="h-9 w-9 shrink-0 active:scale-[0.95]">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
