export type Role = 'werewolf' | 'villager' | 'seer' | 'doctor' | 'witch' | 'hunter';

export function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];

  // Werewolves: 2 for 5-8, 3 for 9-12, 4 for 13-15
  const wolfCount = playerCount <= 8 ? 2 : playerCount <= 12 ? 3 : 4;
  for (let i = 0; i < wolfCount; i++) roles.push('werewolf');

  // Special roles
  roles.push('seer');
  if (playerCount >= 6) roles.push('doctor');
  if (playerCount >= 8) roles.push('witch');
  if (playerCount >= 10) roles.push('hunter');

  // Fill remaining with villagers
  while (roles.length < playerCount) roles.push('villager');

  // Shuffle (Fisher-Yates)
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

export function checkWinCondition(
  players: { role: string | null; alive: boolean }[]
): 'villagers' | 'werewolves' | null {
  const alive = players.filter(p => p.alive);
  const wolves = alive.filter(p => p.role === 'werewolf').length;
  const others = alive.length - wolves;

  if (wolves === 0) return 'villagers';
  if (wolves >= others) return 'werewolves';
  return null;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getRoleEmoji(role: string | null): string {
  switch (role) {
    case 'werewolf': return '🐺';
    case 'villager': return '🏘️';
    case 'seer': return '🔮';
    case 'doctor': return '💊';
    case 'witch': return '🧪';
    case 'hunter': return '🏹';
    default: return '❓';
  }
}

export function getRoleColor(role: string | null): string {
  switch (role) {
    case 'werewolf': return 'text-wolf';
    case 'seer': return 'text-seer';
    case 'doctor': return 'text-doctor';
    case 'witch': return 'text-witch';
    case 'hunter': return 'text-hunter';
    default: return 'text-village';
  }
}

export function getRoleDescription(role: string | null): string {
  switch (role) {
    case 'werewolf': return 'Each night, vote with your pack to eliminate a villager. Stay hidden during the day.';
    case 'villager': return 'Find the werewolves through discussion and vote them out during the day.';
    case 'seer': return 'Each night, choose one player to learn if they are a werewolf or not.';
    case 'doctor': return 'Each night, choose one player to protect from the werewolves.';
    case 'witch': return 'You have one heal potion and one poison potion, each usable once.';
    case 'hunter': return 'When you die, you may take one player down with you.';
    default: return '';
  }
}

export const PHASE_DURATION = 60; // seconds
