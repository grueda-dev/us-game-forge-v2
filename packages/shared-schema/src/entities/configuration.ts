import { PowerCalculationStep } from '../enums/power-calculation-step';

export interface DeckConfig {
  id: string;
  formatVersion: string;
  name: string;
  generalDefinitionId: string;
  troopEntries: DeckTroopEntry[];
  heroEntries: DeckHeroEntry[];
  relicDefinitionIds: string[];
}

export interface DeckTroopEntry {
  definitionId: string;
  quantity: number;
}

export interface DeckHeroEntry {
  definitionId: string;
}

export interface RulesConfig {
  id: string;
  formatVersion: string;
  name: string;
  powerCalculation: PowerCalculationConfig;
  xpConfig: XpConfig;
  turnConfig: TurnConfig;
}

export interface PowerCalculationConfig {
  stepOrder: PowerCalculationStep[];
  stepMultipliers: Partial<Record<PowerCalculationStep, number>>;
}

export interface XpConfig {
  baseXpPerBattle: number;
  bonusXpForWin: number;
  levelThresholds: number[];
}

export interface TurnConfig {
  cardsDrawnPerTurn: number;
  turnLimitIfApplicable: number | null;
}
