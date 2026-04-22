import { Faction, CardClass, CardType } from '@game-forge/shared-schema';
import { MercenaryCardEntity } from '../entities/mercenary-card.entity';

describe('MercenaryCardEntity', () => {
  function createMercenary(overrides?: { deploymentsRemaining?: number }) {
    return new MercenaryCardEntity(
      'mercenary-commander-01',
      'Iron Commander',
      Faction.HUMAN,
      CardClass.INFANTRY,
      25,
      3,
      { targetClass: CardClass.INFANTRY, bonusPower: 5 },
      overrides,
    );
  }

  it('creates with correct defaults', () => {
    const mercenary = createMercenary();
    expect(mercenary.cardType).toBe(CardType.MERCENARY);
    expect(mercenary.deploymentsRemaining).toBe(3);
    expect(mercenary.isExhausted).toBe(false);
    expect(mercenary.effectivePower).toBe(25);
  });

  it('creates with custom deployments remaining', () => {
    const mercenary = createMercenary({ deploymentsRemaining: 1 });
    expect(mercenary.deploymentsRemaining).toBe(1);
  });

  describe('deploy', () => {
    it('decrements deployments remaining', () => {
      const mercenary = createMercenary();
      mercenary.deploy();
      expect(mercenary.deploymentsRemaining).toBe(2);
      expect(mercenary.isExhausted).toBe(false);
    });

    it('becomes exhausted after all deployments used', () => {
      const mercenary = createMercenary();
      mercenary.deploy();
      mercenary.deploy();
      mercenary.deploy();
      expect(mercenary.deploymentsRemaining).toBe(0);
      expect(mercenary.isExhausted).toBe(true);
    });

    it('throws when deploying an exhausted mercenary', () => {
      const mercenary = createMercenary({ deploymentsRemaining: 0 });
      expect(() => mercenary.deploy()).toThrow('no deployments remaining');
    });
  });

  describe('getAoeEffect', () => {
    it('returns AoE effect when defined', () => {
      const mercenary = createMercenary();
      const aoe = mercenary.getAoeEffect();
      expect(aoe).toEqual({ targetClass: CardClass.INFANTRY, bonusPower: 5 });
    });

    it('returns null when no AoE defined', () => {
      const mercenary = new MercenaryCardEntity(
        'mercenary-scout-01', 'Scout', Faction.ELF, CardClass.ARCHER, 15, 2, null,
      );
      expect(mercenary.getAoeEffect()).toBeNull();
    });
  });
});
