export function assignRoles(playerCount) {
  const roles = [];

  // Werewolves:
  // 4-6 players: 1 werewolf
  // 7-9 players: 2 werewolves
  // 10-12 players: 3 werewolves
  // 13-15 players: 4 werewolves
  const wolfCount = playerCount <= 6 ? 1 : playerCount <= 9 ? 2 : playerCount <= 12 ? 3 : 4;
  for (let i = 0; i < wolfCount; i++) roles.push('werewolf');

  // Core requested special roles:
  roles.push('seer'); // Seer is always in the game
  if (playerCount >= 4) roles.push('bodyguard'); // Bodyguard is active from 4+ players

  // Fill remaining spots with villagers
  while (roles.length < playerCount) roles.push('villager');

  // Shuffle (Fisher-Yates)
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

export function checkWinCondition(players) {
  const alive = players.filter(p => p.alive);
  const wolves = alive.filter(p => p.role === 'werewolf').length;
  const others = alive.length - wolves;

  if (alive.length === 0) return 'draw';
  if (wolves === 0) return 'villagers';
  if (wolves >= others && wolves > 0) return 'werewolves';
  return null;
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getRoleEmoji(role) {
  switch (role) {
    case 'werewolf': return '🐺';
    case 'villager': return '🏘️';
    case 'seer': return '🔮';
    case 'bodyguard': return '🛡️';
    case 'doctor': return '💊';
    default: return '❓';
  }
}

export function getRoleColor(role) {
  switch (role) {
    case 'werewolf': return 'text-wolf';
    case 'seer': return 'text-seer';
    case 'bodyguard': return 'text-doctor';
    case 'doctor': return 'text-doctor';
    default: return 'text-village';
  }
}

export function getRoleTeam(role) {
  if (role === 'werewolf') return 'Werewolf Pack';
  return 'Village Alliance';
}

export function getRoleGoal(role) {
  if (role === 'werewolf') {
    return 'Eliminate villagers until your pack equals or outnumbers them.';
  }
  return 'Identify and vote out all werewolves during the day to save the village.';
}

export function getRoleDescription(role) {
  switch (role) {
    case 'werewolf':
      return 'Each night, agree with your pack on a villager to eliminate. During the day, pretend to be an innocent villager and steer suspicion away from yourself.';
    case 'villager':
      return 'You have no special night powers, but your voice and vote are vital. Pay close attention to chat, deduce who is lying, and vote out the werewolves.';
    case 'seer':
      return 'Each night, select one player to investigate. You will secretly discover whether that player is a Werewolf or a Villager.';
    case 'bodyguard':
    case 'doctor':
      return 'Each night, choose one player to protect with your shield. If the werewolves attack that player during the night, they will survive!';
    default:
      return '';
  }
}

export const PHASE_DURATION = 60; // seconds
