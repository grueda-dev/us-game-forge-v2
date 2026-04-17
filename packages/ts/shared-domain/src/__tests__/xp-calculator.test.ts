import { Faction, CardClass } from '@game-forge/shared-schema';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { awardBattleXp } from '../rules/xp-calculator';

function createTroop(level = 1, experience = 0): TroopCardEntity {
  return new TroopCardEntity(
    'troop-01', 'Test Troop', Faction.HUMAN, CardClass.ARCHER, 10,
    { level, experience },
  );
}

const XP_CONFIG = {
  baseXpPerBattle: 10,
  bonusXpForWin: 5,
  levelThresholds: [0, 100, 250, 500],
};

describe('awardBattleXp', () => {
  it('awards base XP on loss', () => {
    const troops = [createTroop()];
    const results = awardBattleXp(troops, false, XP_CONFIG);

    expect(results).toHaveLength(1);
    expect(results[0].xpGained).toBe(10);
    expect(results[0].leveledUp).toBe(false);
  });

  it('awards base + bonus XP on win', () => {
    const troops = [createTroop()];
    const results = awardBattleXp(troops, true, XP_CONFIG);

    expect(results).toHaveLength(1);
    expect(results[0].xpGained).toBe(15);
  });

  it('awards XP to all participating troops', () => {
    const troops = [createTroop(), createTroop(), createTroop()];
    const results = awardBattleXp(troops, true, XP_CONFIG);

    expect(results).toHaveLength(3);
    results.forEach((r) => expect(r.xpGained).toBe(15));
  });

  it('reports level up when threshold is crossed', () => {
    const troop = createTroop(1, 90);
    const results = awardBattleXp([troop], true, XP_CONFIG);

    expect(results[0].leveledUp).toBe(true);
    expect(results[0].newLevel).toBe(2);
  });

  it('does not level up when threshold is not reached', () => {
    const troop = createTroop(1, 80);
    const results = awardBattleXp([troop], false, XP_CONFIG);

    expect(results[0].leveledUp).toBe(false);
    expect(results[0].newLevel).toBe(1);
  });
});
