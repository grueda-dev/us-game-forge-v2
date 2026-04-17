// Value Objects
export { CardInstanceId } from './value-objects/card-instance-id';

// Entities
export { TroopCardEntity } from './entities/troop-card.entity';
export type { AoeEffect } from './entities/troop-card.entity';
export { HeroCardEntity } from './entities/hero-card.entity';
export {
  BattlefieldSlotEntity,
  BattlefieldEntity,
} from './entities/battlefield.entity';
export type { PlaceableCard } from './entities/battlefield.entity';

// Rules
export { calculateArmyPower } from './rules/power-calculator';
export type {
  CardPowerBreakdown,
  GlobalBonusEffect,
  ArmyPowerResult,
} from './rules/power-calculator';
export { awardBattleXp } from './rules/xp-calculator';
export type { XpGainResult } from './rules/xp-calculator';
export { resolveAllAoeContributions } from './rules/adjacency-resolver';
export type { AoeContribution } from './rules/adjacency-resolver';
