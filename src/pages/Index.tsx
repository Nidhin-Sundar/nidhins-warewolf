import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { HomeScreen } from '@/components/game/HomeScreen';
import { Lobby } from '@/components/game/Lobby';
import { RoleReveal } from '@/components/game/RoleReveal';
import { NightPhase } from '@/components/game/NightPhase';
import { DayPhase } from '@/components/game/DayPhase';
import { GameOver } from '@/components/game/GameOver';

const Index = () => {
  const { screen, room, subscribeToRoom } = useGameStore();

  useEffect(() => {
    if (room && screen !== 'home') {
      const unsub = subscribeToRoom(room.id);
      return unsub;
    }
  }, [room?.id]);

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

export default Index;
