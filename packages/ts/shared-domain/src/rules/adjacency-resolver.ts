import type { BattlefieldEntity, BattlefieldSlotEntity } from '../entities/battlefield.entity';
import type { AoeEffect } from '../entities/troop-card.entity';
import { TroopCardEntity } from '../entities/troop-card.entity';
import { MercenaryCardEntity } from '../entities/mercenary-card.entity';

export interface AoeContribution {
  sourceInstanceId: string;
  targetInstanceId: string;
  effect: AoeEffect;
}

/**
 * Resolves all AoE contributions across a battlefield.
 * Returns a list of every AoE bonus being applied, including its source and target.
 */
export function resolveAllAoeContributions(
  battlefield: BattlefieldEntity,
  aoeUnlockLevel: number,
): AoeContribution[] {
  const contributions: AoeContribution[] = [];

  for (const slot of battlefield.allOccupiedSlots) {
    const card = slot.card!;
    let aoe: AoeEffect | null = null;

    if (card instanceof TroopCardEntity) {
      aoe = card.getAoeEffect(aoeUnlockLevel);
    } else if (card instanceof MercenaryCardEntity) {
      aoe = card.getAoeEffect();
    }

    if (!aoe) continue;

    const adjacentSlots = battlefield.getAdjacentSlots(slot.slotId);
    for (const adjSlot of adjacentSlots) {
      const adjCard = adjSlot.card;
      if (!adjCard) continue;

      if (adjCard.cardClass === aoe.targetClass) {
        contributions.push({
          sourceInstanceId: card.instanceId.value,
          targetInstanceId: adjCard.instanceId.value,
          effect: aoe,
        });
      }
    }
  }

  return contributions;
}
