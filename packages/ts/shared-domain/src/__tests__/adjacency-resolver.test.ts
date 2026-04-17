import { Faction, CardClass, TerrainType } from '@game-forge/shared-schema';
import { BattlefieldSlotEntity, BattlefieldEntity } from '../entities/battlefield.entity';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { HeroCardEntity } from '../entities/hero-card.entity';
import { resolveAllAoeContributions } from '../rules/adjacency-resolver';

function createSlot(row: number, col: number): BattlefieldSlotEntity {
  return new BattlefieldSlotEntity(`slot-${row}-${col}`, { row, col }, null, []);
}

function createTroop(
  cardClass: CardClass, level: number,
): TroopCardEntity {
  return new TroopCardEntity(
    `troop-${cardClass}`, `Test ${cardClass}`, Faction.HUMAN, cardClass, 10,
    { level },
  );
}

const AOE_UNLOCK_LEVEL = 5;

describe('resolveAllAoeContributions', () => {
  it('returns empty for battlefield with no AoE sources', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    slots[0].place(createTroop(CardClass.ARCHER, 1));
    slots[1].place(createTroop(CardClass.ARCHER, 1));
    const bf = new BattlefieldEntity(1, 2, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    expect(contributions).toHaveLength(0);
  });

  it('finds AoE from high-level troop to matching adjacent', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    const source = createTroop(CardClass.ARCHER, 5);
    const target = createTroop(CardClass.ARCHER, 1);
    slots[0].place(source);
    slots[1].place(target);
    const bf = new BattlefieldEntity(1, 2, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    expect(contributions).toHaveLength(1);
    expect(contributions[0].sourceInstanceId).toBe(source.instanceId.value);
    expect(contributions[0].targetInstanceId).toBe(target.instanceId.value);
  });

  it('does not apply AoE to non-matching class', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    slots[0].place(createTroop(CardClass.ARCHER, 5));
    slots[1].place(createTroop(CardClass.CAVALRY, 1));
    const bf = new BattlefieldEntity(1, 2, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    expect(contributions).toHaveLength(0);
  });

  it('does not apply AoE to non-adjacent slots', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1), createSlot(0, 2)];
    slots[0].place(createTroop(CardClass.ARCHER, 5));
    // slot[1] empty
    slots[2].place(createTroop(CardClass.ARCHER, 1));
    const bf = new BattlefieldEntity(1, 3, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    // Archer at (0,0) can only reach (0,1) which is empty; (0,2) is not adjacent
    expect(contributions).toHaveLength(0);
  });

  it('finds AoE from hero to matching adjacent', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    const hero = new HeroCardEntity(
      'hero-01', 'Hero', Faction.HUMAN, CardClass.INFANTRY, 25, 3,
      { targetClass: CardClass.INFANTRY, bonusPower: 5 },
    );
    const target = createTroop(CardClass.INFANTRY, 1);
    slots[0].place(hero);
    slots[1].place(target);
    const bf = new BattlefieldEntity(1, 2, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    expect(contributions).toHaveLength(1);
    expect(contributions[0].sourceInstanceId).toBe(hero.instanceId.value);
    expect(contributions[0].effect.bonusPower).toBe(5);
  });

  it('handles mutual AoE between two high-level troops', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    slots[0].place(createTroop(CardClass.ARCHER, 5));
    slots[1].place(createTroop(CardClass.ARCHER, 5));
    const bf = new BattlefieldEntity(1, 2, slots);

    const contributions = resolveAllAoeContributions(bf, AOE_UNLOCK_LEVEL);

    // Each high-level archer provides AoE to the other
    expect(contributions).toHaveLength(2);
  });
});
