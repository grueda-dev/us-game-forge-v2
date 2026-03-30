import type { XpConfig } from '@game-forge/shared-schema';
import type { TroopCardEntity } from '../entities/troop-card.entity';

export interface XpGainResult {
  instanceId: string;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * Awards XP to all participating troop cards after a battle.
 * Heroes do not gain XP.
 */
export function awardBattleXp(
  participatingTroops: TroopCardEntity[],
  won: boolean,
  xpConfig: XpConfig,
): XpGainResult[] {
  const xpAmount =
    xpConfig.baseXpPerBattle + (won ? xpConfig.bonusXpForWin : 0);

  return participatingTroops.map((troop) => {
    const leveledUp = troop.gainExperience(xpAmount, xpConfig.levelThresholds);
    return {
      instanceId: troop.instanceId.value,
      xpGained: xpAmount,
      leveledUp,
      newLevel: troop.level,
    };
  });
}
