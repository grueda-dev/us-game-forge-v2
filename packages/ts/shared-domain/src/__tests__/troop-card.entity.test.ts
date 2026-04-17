import { Faction, CardClass, CardType } from '@game-forge/shared-schema';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { CardInstanceId } from '../value-objects/card-instance-id';

describe('TroopCardEntity', () => {
  const defaults = {
    definitionId: 'troop-archer-01',
    name: 'Human Archers',
    faction: Faction.HUMAN,
    cardClass: CardClass.ARCHER,
    basePower: 10,
  };

  it('creates with default level 1 and 0 experience', () => {
    const card = new TroopCardEntity(
      defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
    );
    expect(card.cardType).toBe(CardType.TROOP);
    expect(card.level).toBe(1);
    expect(card.experience).toBe(0);
    expect(card.effectivePower).toBe(10);
    expect(card.instanceId).toBeInstanceOf(CardInstanceId);
  });

  it('creates with custom level and experience', () => {
    const card = new TroopCardEntity(
      defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
      { level: 3, experience: 200 },
    );
    expect(card.level).toBe(3);
    expect(card.experience).toBe(200);
  });

  it('computes effective power based on level', () => {
    const card = new TroopCardEntity(
      defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
      { level: 5 },
    );
    // basePower + (level - 1) * 2 = 10 + 4*2 = 18
    expect(card.effectivePower).toBe(18);
  });

  describe('gainExperience', () => {
    const thresholds = [0, 100, 250, 500, 800];

    it('gains experience without leveling up', () => {
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
      );
      const leveledUp = card.gainExperience(50, thresholds);
      expect(leveledUp).toBe(false);
      expect(card.experience).toBe(50);
      expect(card.level).toBe(1);
    });

    it('levels up when reaching threshold', () => {
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
      );
      const leveledUp = card.gainExperience(100, thresholds);
      expect(leveledUp).toBe(true);
      expect(card.level).toBe(2);
    });

    it('accumulates XP across multiple gains', () => {
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
      );
      card.gainExperience(60, thresholds);
      expect(card.level).toBe(1);

      card.gainExperience(60, thresholds);
      expect(card.level).toBe(2);
      expect(card.experience).toBe(120);
    });

    it('does not level up when no next threshold exists', () => {
      // Level 5 with thresholds [0,100,250,500,800] — no index 5, so can't level further
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
        { level: 5, experience: 900 },
      );
      const leveledUp = card.gainExperience(200, thresholds);
      expect(leveledUp).toBe(false);
      expect(card.level).toBe(5);
    });
  });

  describe('getAoeEffect', () => {
    it('returns null below unlock level', () => {
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
        { level: 2 },
      );
      expect(card.getAoeEffect(5)).toBeNull();
    });

    it('returns AoE effect at unlock level', () => {
      const card = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
        { level: 5 },
      );
      const aoe = card.getAoeEffect(5);
      expect(aoe).not.toBeNull();
      expect(aoe!.targetClass).toBe(CardClass.ARCHER);
      expect(aoe!.bonusPower).toBeGreaterThan(0);
    });

    it('increases AoE bonus at higher levels', () => {
      const cardLv5 = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
        { level: 5 },
      );
      const cardLv7 = new TroopCardEntity(
        defaults.definitionId, defaults.name, defaults.faction, defaults.cardClass, defaults.basePower,
        { level: 7 },
      );
      const aoe5 = cardLv5.getAoeEffect(5)!;
      const aoe7 = cardLv7.getAoeEffect(5)!;
      expect(aoe7.bonusPower).toBeGreaterThan(aoe5.bonusPower);
    });
  });
});
