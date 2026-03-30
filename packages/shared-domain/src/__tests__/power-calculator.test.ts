import {
  Faction, CardClass, TerrainType, PowerCalculationStep,
  type PowerCalculationConfig,
} from '@game-forge/shared-schema';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { HeroCardEntity } from '../entities/hero-card.entity';
import { BattlefieldSlotEntity, BattlefieldEntity } from '../entities/battlefield.entity';
import { calculateArmyPower, type GlobalBonusEffect } from '../rules/power-calculator';

function createSlot(
  row: number, col: number,
  terrainType: TerrainType | null = null,
  modifiers: { targetClass: CardClass; multiplier: number }[] = [],
): BattlefieldSlotEntity {
  return new BattlefieldSlotEntity(
    `slot-${row}-${col}`, { row, col }, terrainType, modifiers,
  );
}

function createTroop(
  cardClass: CardClass, basePower: number, level = 1,
): TroopCardEntity {
  return new TroopCardEntity(
    `troop-${cardClass}`, `Test ${cardClass}`, Faction.HUMAN, cardClass, basePower,
    { level },
  );
}

const DEFAULT_CONFIG: PowerCalculationConfig = {
  stepOrder: [
    PowerCalculationStep.BASE_POWER,
    PowerCalculationStep.AOE_BONUS,
    PowerCalculationStep.SLOT_MODIFIER,
    PowerCalculationStep.GENERAL_BONUS,
  ],
  stepMultipliers: {},
};

const AOE_UNLOCK_LEVEL = 5;

describe('calculateArmyPower', () => {
  it('calculates base power for a single card', () => {
    const slot = createSlot(0, 0);
    slot.place(createTroop(CardClass.ARCHER, 10));
    const bf = new BattlefieldEntity(1, 1, [slot]);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    expect(result.totalPower).toBe(10);
    expect(result.cardBreakdowns).toHaveLength(1);
    expect(result.cardBreakdowns[0].basePower).toBe(10);
  });

  it('sums power across multiple cards', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    slots[0].place(createTroop(CardClass.ARCHER, 10));
    slots[1].place(createTroop(CardClass.CAVALRY, 15));
    const bf = new BattlefieldEntity(1, 2, slots);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    expect(result.totalPower).toBe(25);
  });

  it('applies terrain slot modifier', () => {
    const slot = createSlot(0, 0, TerrainType.HILL, [
      { targetClass: CardClass.ARCHER, multiplier: 2 },
    ]);
    slot.place(createTroop(CardClass.ARCHER, 10));
    const bf = new BattlefieldEntity(1, 1, [slot]);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    // base 10, then slot modifier doubles: 10 + 10 = 20
    expect(result.totalPower).toBe(20);
    expect(result.cardBreakdowns[0].slotModifier).toBe(10);
  });

  it('does not apply terrain modifier to non-matching class', () => {
    const slot = createSlot(0, 0, TerrainType.HILL, [
      { targetClass: CardClass.ARCHER, multiplier: 2 },
    ]);
    slot.place(createTroop(CardClass.CAVALRY, 10));
    const bf = new BattlefieldEntity(1, 1, [slot]);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    expect(result.totalPower).toBe(10);
    expect(result.cardBreakdowns[0].slotModifier).toBe(0);
  });

  it('applies general bonus', () => {
    const slot = createSlot(0, 0);
    slot.place(createTroop(CardClass.INFANTRY, 10));
    const bf = new BattlefieldEntity(1, 1, [slot]);
    const general: GlobalBonusEffect = {
      targetClass: CardClass.INFANTRY,
      targetFaction: null,
      multiplier: 2,
    };

    const result = calculateArmyPower(bf, general, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    // base 10, general doubles: 10 + 10 = 20
    expect(result.totalPower).toBe(20);
  });

  it('does not apply general bonus to non-matching class', () => {
    const slot = createSlot(0, 0);
    slot.place(createTroop(CardClass.ARCHER, 10));
    const bf = new BattlefieldEntity(1, 1, [slot]);
    const general: GlobalBonusEffect = {
      targetClass: CardClass.INFANTRY,
      targetFaction: null,
      multiplier: 2,
    };

    const result = calculateArmyPower(bf, general, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    expect(result.totalPower).toBe(10);
  });

  it('applies AoE bonus from adjacent high-level troop', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    // High-level archer provides AoE to adjacent archers
    slots[0].place(createTroop(CardClass.ARCHER, 10, 5));
    // Adjacent archer receives the bonus
    slots[1].place(createTroop(CardClass.ARCHER, 10, 1));
    const bf = new BattlefieldEntity(1, 2, slots);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    // Card at slot[1] should have AoE bonus from slot[0]
    const card1Breakdown = result.cardBreakdowns.find(
      (b) => b.instanceId === slots[1].card!.instanceId.value,
    )!;
    expect(card1Breakdown.aoeBonusReceived).toBeGreaterThan(0);
  });

  it('applies AoE bonus from adjacent hero', () => {
    const slots = [createSlot(0, 0), createSlot(0, 1)];
    const hero = new HeroCardEntity(
      'hero-01', 'Hero', Faction.HUMAN, CardClass.INFANTRY, 25, 3,
      { targetClass: CardClass.INFANTRY, bonusPower: 5 },
    );
    slots[0].place(hero);
    slots[1].place(createTroop(CardClass.INFANTRY, 10));
    const bf = new BattlefieldEntity(1, 2, slots);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    const troopBreakdown = result.cardBreakdowns.find(
      (b) => b.instanceId === slots[1].card!.instanceId.value,
    )!;
    expect(troopBreakdown.aoeBonusReceived).toBe(5);
  });

  describe('configurable step order', () => {
    it('produces different results with different step orders', () => {
      // Use AoE (additive) between multipliers to break commutativity.
      // Setup: two adjacent archers, one at level 5 (provides AoE), one at level 1.
      // Slot has 2x for archers. General gives 2x to all.
      const slots1 = [
        createSlot(0, 0, TerrainType.HILL, [{ targetClass: CardClass.ARCHER, multiplier: 2 }]),
        createSlot(0, 1),
      ];
      slots1[0].place(createTroop(CardClass.ARCHER, 10, 1));
      slots1[1].place(createTroop(CardClass.ARCHER, 10, 5));

      const general: GlobalBonusEffect = {
        targetClass: null,
        targetFaction: null,
        multiplier: 2,
      };

      // Order 1: base -> AoE -> slot -> general
      const config1: PowerCalculationConfig = {
        stepOrder: [
          PowerCalculationStep.BASE_POWER,
          PowerCalculationStep.AOE_BONUS,
          PowerCalculationStep.SLOT_MODIFIER,
          PowerCalculationStep.GENERAL_BONUS,
        ],
        stepMultipliers: {},
      };

      // Order 2: base -> slot -> AoE -> general
      const config2: PowerCalculationConfig = {
        stepOrder: [
          PowerCalculationStep.BASE_POWER,
          PowerCalculationStep.SLOT_MODIFIER,
          PowerCalculationStep.AOE_BONUS,
          PowerCalculationStep.GENERAL_BONUS,
        ],
        stepMultipliers: {},
      };

      const bf1 = new BattlefieldEntity(1, 2, slots1);
      const result1 = calculateArmyPower(bf1, general, config1, 5);

      // Fresh battlefield for second config
      const slots2 = [
        createSlot(0, 0, TerrainType.HILL, [{ targetClass: CardClass.ARCHER, multiplier: 2 }]),
        createSlot(0, 1),
      ];
      slots2[0].place(createTroop(CardClass.ARCHER, 10, 1));
      slots2[1].place(createTroop(CardClass.ARCHER, 10, 5));
      const bf2 = new BattlefieldEntity(1, 2, slots2);
      const result2 = calculateArmyPower(bf2, general, config2, 5);

      // Additive AoE placed before vs after a multiplier yields different totals
      expect(result1.totalPower).not.toBe(result2.totalPower);
    });
  });

  it('handles empty battlefield', () => {
    const bf = new BattlefieldEntity(2, 2, [
      createSlot(0, 0), createSlot(0, 1),
      createSlot(1, 0), createSlot(1, 1),
    ]);

    const result = calculateArmyPower(bf, null, DEFAULT_CONFIG, AOE_UNLOCK_LEVEL);

    expect(result.totalPower).toBe(0);
    expect(result.cardBreakdowns).toHaveLength(0);
  });
});
