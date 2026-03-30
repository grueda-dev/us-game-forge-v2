import {
  TerrainType,
  CardClass,
  PowerCalculationStep,
  type BattlefieldConfig,
  type RulesConfig,
} from '@game-forge/shared-schema';

export const DEFAULT_BATTLEFIELD: BattlefieldConfig = {
  id: 'bf-default-3x3',
  formatVersion: '1.0',
  name: 'Standard 3x3',
  grid: { rows: 3, cols: 3 },
  slots: [
    { slotId: 'slot-0-0', position: { row: 0, col: 0 }, terrainType: TerrainType.HILL, modifiers: [{ targetClass: CardClass.ARCHER, multiplier: 2 }] },
    { slotId: 'slot-0-1', position: { row: 0, col: 1 }, terrainType: null, modifiers: [] },
    { slotId: 'slot-0-2', position: { row: 0, col: 2 }, terrainType: TerrainType.FOREST, modifiers: [{ targetClass: CardClass.MAGE, multiplier: 1.5 }] },
    { slotId: 'slot-1-0', position: { row: 1, col: 0 }, terrainType: null, modifiers: [] },
    { slotId: 'slot-1-1', position: { row: 1, col: 1 }, terrainType: TerrainType.PLAINS, modifiers: [{ targetClass: CardClass.CAVALRY, multiplier: 2 }] },
    { slotId: 'slot-1-2', position: { row: 1, col: 2 }, terrainType: null, modifiers: [] },
    { slotId: 'slot-2-0', position: { row: 2, col: 0 }, terrainType: TerrainType.SWAMP, modifiers: [{ targetClass: CardClass.INFANTRY, multiplier: 0.5 }] },
    { slotId: 'slot-2-1', position: { row: 2, col: 1 }, terrainType: null, modifiers: [] },
    { slotId: 'slot-2-2', position: { row: 2, col: 2 }, terrainType: TerrainType.MOUNTAIN, modifiers: [{ targetClass: CardClass.WARRIOR, multiplier: 1.5 }] },
  ],
};

export const DEFAULT_RULES: RulesConfig = {
  id: 'rules-standard',
  formatVersion: '1.0',
  name: 'Standard Rules',
  powerCalculation: {
    stepOrder: [
      PowerCalculationStep.BASE_POWER,
      PowerCalculationStep.AOE_BONUS,
      PowerCalculationStep.SLOT_MODIFIER,
      PowerCalculationStep.GENERAL_BONUS,
    ],
    stepMultipliers: {},
  },
  xpConfig: {
    baseXpPerBattle: 10,
    bonusXpForWin: 5,
    levelThresholds: [0, 100, 250, 500, 800, 1200],
  },
  turnConfig: {
    cardsDrawnPerTurn: 3,
    turnLimitIfApplicable: null,
  },
};
