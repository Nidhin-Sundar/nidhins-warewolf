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
    <div className="flex flex-col noir-glass rounded-2xl overflow-hidden border-white/5 bg-black/20">
      <ScrollArea style={{ height: maxHeight }} className="p-4">
        <div className="space-y-4">
          {filteredMessages.length === 0 && (
            <div className="text-center py-10 opacity-30">
              <p className="text-[10px] font-display tracking-[0.3em] uppercase italic">Silence in the Square...</p>
            </div>
          )}
          {filteredMessages.map((msg) => {
            const isSystem = msg.channel === 'system';
            const isMe = msg.player_id === myPlayer?.id;
            return (
              <div key={msg.id} className={`animate-fade-up ${isSystem ? 'text-center' : ''}`}>
                {isSystem ? (
                  <div className="py-2 px-4 rounded-full bg-accent/5 border border-accent/10 inline-block">
                    <p className="text-[10px] text-accent font-display tracking-[0.2em] uppercase italic opacity-80">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[9px] mb-1 font-display tracking-widest uppercase opacity-40 ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {getPlayerName(msg.player_id)}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] max-w-[85%] font-body leading-relaxed group transition-all duration-300 ${isMe
                        ? 'bg-primary/20 text-foreground border border-primary/20 rounded-tr-none shadow-[0_0_15px_-5px_rgba(255,0,0,0.1)]'
                        : msg.channel === 'werewolf'
                          ? 'bg-primary/10 text-primary-foreground border border-primary/30 rounded-tl-none italic'
                          : 'bg-white/5 text-foreground/90 border border-white/10 rounded-tl-none'
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

      {!myPlayer?.alive ? (
        <div className="p-3 bg-black/40 text-center border-t border-white/5">
          <p className="text-[9px] font-display tracking-[0.2em] uppercase text-muted-foreground/40 italic">Observer Mode Only</p>
        </div>
      ) : (
        <div className="flex gap-2 p-3 bg-white/[0.02] border-t border-white/5 backdrop-blur-sm">
          <Input
            placeholder={channel === 'werewolf' ? 'Whisper to the pack...' : 'Contribute to the ritual...'}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="h-11 text-xs bg-black/20 border-white/10 rounded-xl font-display tracking-wider placeholder:text-muted-foreground/30 focus-visible:ring-primary/40"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-all shadow-lg active:scale-[0.9] disabled:opacity-20 disabled:grayscale"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
