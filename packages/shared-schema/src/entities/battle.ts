export type BattleEndConditionType = 'ALL_SLOTS_FILLED' | 'TURN_LIMIT';

export interface BattleEndCondition {
  type: BattleEndConditionType;
  turnLimit?: number;
}

export interface BattleDefinition {
  id: string;
  formatVersion: string;
  name: string;
  battlefieldConfigId: string;
  playerDeckConfigId: string;
  opponentDeckConfigId: string;
  rulesConfigId: string;
  endCondition: BattleEndCondition;
}
