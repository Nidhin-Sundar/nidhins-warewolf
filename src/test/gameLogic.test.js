import { describe, it, expect } from 'vitest';
import {
  assignRoles,
  checkWinCondition,
  generateRoomCode,
  getRoleTeam,
  getRoleGoal,
  getRoleDescription,
} from '../lib/gameLogic';

describe('Game Logic', () => {
  describe('assignRoles', () => {
    it('assigns 1 werewolf and 1 seer for 4 players', () => {
      const roles = assignRoles(4);
      expect(roles).toHaveLength(4);
      expect(roles.filter(r => r === 'werewolf')).toHaveLength(1);
      expect(roles.filter(r => r === 'seer')).toHaveLength(1);
      expect(roles.filter(r => r === 'villager')).toHaveLength(2);
    });

    it('adds doctor at 5 players', () => {
      const roles = assignRoles(5);
      expect(roles).toHaveLength(5);
      expect(roles.filter(r => r === 'werewolf')).toHaveLength(1);
      expect(roles.filter(r => r === 'doctor')).toHaveLength(1);
    });

    it('assigns 2 werewolves and adds witch at 7 players', () => {
      const roles = assignRoles(7);
      expect(roles).toHaveLength(7);
      expect(roles.filter(r => r === 'werewolf')).toHaveLength(2);
      expect(roles.filter(r => r === 'witch')).toHaveLength(1);
    });

    it('adds hunter at 9 players', () => {
      const roles = assignRoles(9);
      expect(roles).toHaveLength(9);
      expect(roles.filter(r => r === 'werewolf')).toHaveLength(2);
      expect(roles.filter(r => r === 'hunter')).toHaveLength(1);
    });
  });

  describe('checkWinCondition', () => {
    it('returns villagers when all wolves are dead', () => {
      const players = [
        { role: 'werewolf', alive: false },
        { role: 'villager', alive: true },
        { role: 'seer', alive: true },
      ];
      expect(checkWinCondition(players)).toBe('villagers');
    });

    it('returns werewolves when wolves equal or outnumber alive villagers', () => {
      const players = [
        { role: 'werewolf', alive: true },
        { role: 'villager', alive: true },
      ];
      expect(checkWinCondition(players)).toBe('werewolves');
    });

    it('returns null when game is still in balance', () => {
      const players = [
        { role: 'werewolf', alive: true },
        { role: 'villager', alive: true },
        { role: 'seer', alive: true },
      ];
      expect(checkWinCondition(players)).toBeNull();
    });
  });

  describe('role descriptions and teams', () => {
    it('returns correct team for werewolf and villagers', () => {
      expect(getRoleTeam('werewolf')).toBe('Werewolf Pack');
      expect(getRoleTeam('villager')).toBe('Village Alliance');
      expect(getRoleTeam('seer')).toBe('Village Alliance');
    });

    it('returns clear goals', () => {
      expect(getRoleGoal('werewolf')).toContain('Eliminate villagers');
      expect(getRoleGoal('villager')).toContain('Identify and vote out');
    });
  });
});

