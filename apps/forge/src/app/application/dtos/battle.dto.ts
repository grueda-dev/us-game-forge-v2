import type {
  BattleEndCondition,
  PowerCalculationConfig,
  XpConfig,
} from '@game-forge/shared-schema';
import type { CardPowerBreakdown, GlobalBonusEffect } from '@game-forge/shared-domain';
import type { PlaceableCard } from '@game-forge/shared-domain';

export interface ConfigureBattleInput {
  battlefieldConfigId: string;
  playerDeckConfigId: string;
  opponentDeckConfigId: string;
  rulesConfigId: string;
}

export interface BattleStateDto {
  battleId: string;
  currentTurn: number;
  activePlayer: 'player' | 'opponent';
  playerHandOptions: CardSummaryDto[];
  playerPower: number;
  opponentPower: number;
  battleComplete: boolean;
}

export interface CardSummaryDto {
  instanceId: string;
  definitionId: string;
  name: string;
  faction: string;
  cardClass: string;
  effectivePower: number;
  cardType: string;
}

export interface PlayTurnInput {
  battleId: string;
  cardInstanceId: string;
  targetSlotId: string;
}

export interface PlayTurnOutput {
  updatedPower: number;
  cardBreakdown: CardPowerBreakdown;
  turnComplete: boolean;
  battleComplete: boolean;
  nextState: BattleStateDto;
}

export interface BattleResultDto {
  battleId: string;
  playerTotalPower: number;
  opponentTotalPower: number;
  winner: 'player' | 'opponent' | 'draw';
  playerBreakdowns: CardPowerBreakdown[];
  opponentBreakdowns: CardPowerBreakdown[];
}
