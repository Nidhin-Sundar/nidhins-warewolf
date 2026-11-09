import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { HomeScreen } from '@/components/game/HomeScreen';
import { Lobby } from '@/components/game/Lobby';
import { RoleReveal } from '@/components/game/RoleReveal';
import { NightPhase } from '@/components/game/NightPhase';
import { DayPhase } from '@/components/game/DayPhase';
import { GameOver } from '@/components/game/GameOver';
import { PhaseTransitionOverlay } from '@/components/game/PhaseTransitionOverlay';
import { SoundControl } from '@/components/game/SoundControl';

const Index = () => {
  const { screen, room, subscribeToRoom, restoreSession, isRestoring } = useGameStore();

  // Automatically attempt session recovery on refresh / page mount
  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (room && screen !== 'home') {
      const unsub = subscribeToRoom(room.id);
      return unsub;
    }
  }, [room?.id]);

  const renderScreen = () => {
    if (isRestoring) {
      return (
        <div className="min-h-screen mystic-gradient flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p className="font-display text-xs tracking-[0.3em] uppercase text-muted-foreground animate-pulse">
            Reconnecting to village session...
          </p>
        </div>
      );
    }

    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'lobby': return <Lobby />;
      case 'role_reveal': return <RoleReveal />;
      case 'night': return <NightPhase />;
      case 'day': return <DayPhase />;
      case 'game_over': return <GameOver />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="noir-vignette" />
      <PhaseTransitionOverlay phase={room?.phase} round={room?.round} />
      <SoundControl />
      {renderScreen()}
    </div>
  );
};

export default Index;
