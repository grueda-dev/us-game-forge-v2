import {
  TerrainType,
  CardClass,
  type GridPosition,
  type TerrainModifier,
} from '@game-forge/shared-schema';
import type { TroopCardEntity } from './troop-card.entity';
import type { MercenaryCardEntity } from './mercenary-card.entity';

export type PlaceableCard = TroopCardEntity | MercenaryCardEntity;

export class BattlefieldSlotEntity {
  private _occupiedBy: PlaceableCard | null = null;

  constructor(
    public readonly slotId: string,
    public readonly position: GridPosition,
    public readonly terrainType: TerrainType | null,
    public readonly modifiers: TerrainModifier[],
  ) {}

  get isOccupied(): boolean {
    return this._occupiedBy !== null;
  }

  get card(): PlaceableCard | null {
    return this._occupiedBy;
  }

  place(card: PlaceableCard): void {
    if (this._occupiedBy !== null) {
      throw new Error(`Slot ${this.slotId} is already occupied`);
    }
    this._occupiedBy = card;
  }

  remove(): PlaceableCard | null {
    const card = this._occupiedBy;
    this._occupiedBy = null;
    return card;
  }

  getTerrainModifierFor(cardClass: CardClass): number {
    const modifier = this.modifiers.find((m) => m.targetClass === cardClass);
    return modifier?.multiplier ?? 1;
  }
}

export class BattlefieldEntity {
  constructor(
    public readonly rows: number,
    public readonly cols: number,
    public readonly slots: BattlefieldSlotEntity[],
  ) {}

  getSlot(slotId: string): BattlefieldSlotEntity | undefined {
    return this.slots.find((s) => s.slotId === slotId);
  }

  getSlotAt(row: number, col: number): BattlefieldSlotEntity | undefined {
    return this.slots.find(
      (s) => s.position.row === row && s.position.col === col,
    );
  }

  getAdjacentSlots(slotId: string): BattlefieldSlotEntity[] {
    const slot = this.getSlot(slotId);
    if (!slot) return [];

    const { row, col } = slot.position;
    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    return adjacentPositions
      .map(({ row: r, col: c }) => this.getSlotAt(r, c))
      .filter((s): s is BattlefieldSlotEntity => s !== undefined);
  }

  get allOccupiedSlots(): BattlefieldSlotEntity[] {
    return this.slots.filter((s) => s.isOccupied);
  }

  get allEmptySlots(): BattlefieldSlotEntity[] {
    return this.slots.filter((s) => !s.isOccupied);
  }

  get isFull(): boolean {
    return this.slots.every((s) => s.isOccupied);
  }
}
