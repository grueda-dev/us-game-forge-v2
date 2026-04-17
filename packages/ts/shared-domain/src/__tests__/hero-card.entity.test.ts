import { Faction, CardClass, CardType } from '@game-forge/shared-schema';
import { HeroCardEntity } from '../entities/hero-card.entity';

describe('HeroCardEntity', () => {
  function createHero(overrides?: { deploymentsRemaining?: number }) {
    return new HeroCardEntity(
      'hero-commander-01',
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
    const hero = createHero();
    expect(hero.cardType).toBe(CardType.HERO);
    expect(hero.deploymentsRemaining).toBe(3);
    expect(hero.isExhausted).toBe(false);
    expect(hero.effectivePower).toBe(25);
  });

  it('creates with custom deployments remaining', () => {
    const hero = createHero({ deploymentsRemaining: 1 });
    expect(hero.deploymentsRemaining).toBe(1);
  });

  describe('deploy', () => {
    it('decrements deployments remaining', () => {
      const hero = createHero();
      hero.deploy();
      expect(hero.deploymentsRemaining).toBe(2);
      expect(hero.isExhausted).toBe(false);
    });

    it('becomes exhausted after all deployments used', () => {
      const hero = createHero();
      hero.deploy();
      hero.deploy();
      hero.deploy();
      expect(hero.deploymentsRemaining).toBe(0);
      expect(hero.isExhausted).toBe(true);
    });

    it('throws when deploying an exhausted hero', () => {
      const hero = createHero({ deploymentsRemaining: 0 });
      expect(() => hero.deploy()).toThrow('no deployments remaining');
    });
  });

  describe('getAoeEffect', () => {
    it('returns AoE effect when defined', () => {
      const hero = createHero();
      const aoe = hero.getAoeEffect();
      expect(aoe).toEqual({ targetClass: CardClass.INFANTRY, bonusPower: 5 });
    });

    it('returns null when no AoE defined', () => {
      const hero = new HeroCardEntity(
        'hero-scout-01', 'Scout', Faction.ELF, CardClass.ARCHER, 15, 2, null,
      );
      expect(hero.getAoeEffect()).toBeNull();
    });
  });
});
