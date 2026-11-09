import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/sound';

export function SoundControl() {
  const [muted, setMuted] = useState(sound.isMuted());

  useEffect(() => {
    setMuted(sound.isMuted());
  }, []);

  const toggle = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playClick();
    }
  };

  return (
    <button
      onClick={toggle}
      title={muted ? 'Unmute Sound' : 'Mute Sound'}
      className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center group"
      aria-label="Sound Toggle"
    >
      {muted ? (
        <VolumeX className="w-5 h-5 text-red-400 group-hover:text-red-300" />
      ) : (
        <Volume2 className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
      )}
    </button>
  );
}

