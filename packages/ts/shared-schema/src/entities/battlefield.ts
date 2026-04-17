import { TerrainType } from '../enums/terrain-type';
import { CardClass } from '../enums/card-class';

export interface GridPosition {
  row: number;
  col: number;
}

export interface TerrainModifier {
  targetClass: CardClass;
  multiplier: number;
}

export interface BattlefieldSlot {
  slotId: string;
  position: GridPosition;
  terrainType: TerrainType | null;
  modifiers: TerrainModifier[];
}

export interface BattlefieldGrid {
  rows: number;
  cols: number;
}

export interface BattlefieldConfig {
  id: string;
  formatVersion: string;
  name: string;
  grid: BattlefieldGrid;
  slots: BattlefieldSlot[];
}
