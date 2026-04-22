import {
  PowerCalculationStep,
  type PowerCalculationConfig,
} from '@game-forge/shared-schema';
import type { BattlefieldEntity, BattlefieldSlotEntity } from '../entities/battlefield.entity';
import type { PlaceableCard } from '../entities/battlefield.entity';
import type { AoeEffect } from '../entities/troop-card.entity';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { MercenaryCardEntity } from '../entities/mercenary-card.entity';

export interface CardPowerBreakdown {
  instanceId: string;
  basePower: number;
  aoeBonusReceived: number;
  slotModifier: number;
  generalBonus: number;
  totalPower: number;
}

export interface GlobalBonusEffect {
  targetClass: string | null;
  targetFaction: string | null;
  multiplier: number;
}

export interface ArmyPowerResult {
  totalPower: number;
  cardBreakdowns: CardPowerBreakdown[];
}

/**
 * Calculates the total army power for a battlefield.
 *
 * The order of operations is configurable via PowerCalculationConfig.stepOrder,
 * allowing designers to test different calculation strategies.
 */
export function calculateArmyPower(
  battlefield: BattlefieldEntity,
  generalBonus: GlobalBonusEffect | null,
  config: PowerCalculationConfig,
  aoeUnlockLevel: number,
): ArmyPowerResult {
  const occupiedSlots = battlefield.allOccupiedSlots;
  const cardBreakdowns: CardPowerBreakdown[] = [];

  for (const slot of occupiedSlots) {
    const card = slot.card!;
    const breakdown = calculateCardPower(
      card,
      slot,
      battlefield,
      generalBonus,
      config,
      aoeUnlockLevel,
    );
    cardBreakdowns.push(breakdown);
  }

  const totalPower = cardBreakdowns.reduce((sum, b) => sum + b.totalPower, 0);

  return { totalPower, cardBreakdowns };
}

function calculateCardPower(
  card: PlaceableCard,
  slot: BattlefieldSlotEntity,
  battlefield: BattlefieldEntity,
  generalBonus: GlobalBonusEffect | null,
  config: PowerCalculationConfig,
  aoeUnlockLevel: number,
): CardPowerBreakdown {
  let power = 0;
  const breakdown: CardPowerBreakdown = {
    instanceId: card.instanceId.value,
    basePower: 0,
    aoeBonusReceived: 0,
    slotModifier: 0,
    generalBonus: 0,
    totalPower: 0,
  };

  for (const step of config.stepOrder) {
    const multiplier = config.stepMultipliers?.[step] ?? 1;

    switch (step) {
      case PowerCalculationStep.BASE_POWER: {
        const base = card.effectivePower;
        breakdown.basePower = base * multiplier;
        power += breakdown.basePower;
        break;
      }
      case PowerCalculationStep.AOE_BONUS: {
        const aoe = calculateAoeBonus(card, slot, battlefield, aoeUnlockLevel);
        breakdown.aoeBonusReceived = aoe * multiplier;
        power += breakdown.aoeBonusReceived;
        break;
      }
      case PowerCalculationStep.SLOT_MODIFIER: {
        const terrain = slot.getTerrainModifierFor(card.cardClass);
        // Slot modifier is a multiplier applied to current accumulated power
        const bonus = power * (terrain - 1);
        breakdown.slotModifier = bonus * multiplier;
        power += breakdown.slotModifier;
        break;
      }
      case PowerCalculationStep.GENERAL_BONUS: {
        const gen = calculateGeneralBonus(card, generalBonus);
        // General bonus is a multiplier applied to current accumulated power
        const bonus = power * (gen - 1);
        breakdown.generalBonus = bonus * multiplier;
        power += breakdown.generalBonus;
        break;
      }
    }
  }

  breakdown.totalPower = power;
  return breakdown;
}

function calculateAoeBonus(
  card: PlaceableCard,
  slot: BattlefieldSlotEntity,
  battlefield: BattlefieldEntity,
  aoeUnlockLevel: number,
): number {
  const adjacentSlots = battlefield.getAdjacentSlots(slot.slotId);
  let totalBonus = 0;

  for (const adjSlot of adjacentSlots) {
    const adjCard = adjSlot.card;
    if (!adjCard) continue;

    let aoe: AoeEffect | null = null;
    if (adjCard instanceof TroopCardEntity) {
      aoe = adjCard.getAoeEffect(aoeUnlockLevel);
    } else if (adjCard instanceof MercenaryCardEntity) {
      aoe = adjCard.getAoeEffect();
    }

    if (aoe && aoe.targetClass === card.cardClass) {
      totalBonus += aoe.bonusPower;
    }
  }

  return totalBonus;
}

function calculateGeneralBonus(
  card: PlaceableCard,
  generalBonus: GlobalBonusEffect | null,
): number {
  if (!generalBonus) return 1;

  const classMatch =
    generalBonus.targetClass === null ||
    generalBonus.targetClass === card.cardClass;
  const factionMatch =
    generalBonus.targetFaction === null ||
    generalBonus.targetFaction === card.faction;

  if (classMatch && factionMatch) {
    return generalBonus.multiplier;
  }

  return 1;
}
