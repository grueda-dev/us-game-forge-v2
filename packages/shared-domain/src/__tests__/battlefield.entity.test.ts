import { TerrainType, CardClass, Faction } from '@game-forge/shared-schema';
import { BattlefieldSlotEntity, BattlefieldEntity } from '../entities/battlefield.entity';
import { TroopCardEntity } from '../entities/troop-card.entity';

function createSlot(
  row: number, col: number,
  terrainType: TerrainType | null = null,
  modifiers: { targetClass: CardClass; multiplier: number }[] = [],
): BattlefieldSlotEntity {
  return new BattlefieldSlotEntity(
    `slot-${row}-${col}`, { row, col }, terrainType, modifiers,
  );
}

function createTroop(cardClass: CardClass = CardClass.ARCHER): TroopCardEntity {
  return new TroopCardEntity('troop-01', 'Test Troop', Faction.HUMAN, cardClass, 10);
}

describe('BattlefieldSlotEntity', () => {
  it('starts empty', () => {
    const slot = createSlot(0, 0);
    expect(slot.isOccupied).toBe(false);
    expect(slot.card).toBeNull();
  });

  it('can place and retrieve a card', () => {
    const slot = createSlot(0, 0);
    const troop = createTroop();
    slot.place(troop);
    expect(slot.isOccupied).toBe(true);
    expect(slot.card).toBe(troop);
  });

  it('throws when placing into an occupied slot', () => {
    const slot = createSlot(0, 0);
    slot.place(createTroop());
    expect(() => slot.place(createTroop())).toThrow('already occupied');
  });

  it('can remove a card', () => {
    const slot = createSlot(0, 0);
    const troop = createTroop();
    slot.place(troop);
    const removed = slot.remove();
    expect(removed).toBe(troop);
    expect(slot.isOccupied).toBe(false);
  });

  it('returns terrain modifier for matching class', () => {
    const slot = createSlot(0, 0, TerrainType.HILL, [
      { targetClass: CardClass.ARCHER, multiplier: 2 },
    ]);
    expect(slot.getTerrainModifierFor(CardClass.ARCHER)).toBe(2);
  });

  it('returns 1 for non-matching class', () => {
    const slot = createSlot(0, 0, TerrainType.HILL, [
      { targetClass: CardClass.ARCHER, multiplier: 2 },
    ]);
    expect(slot.getTerrainModifierFor(CardClass.CAVALRY)).toBe(1);
  });
});

describe('BattlefieldEntity', () => {
  function create2x2Battlefield(): BattlefieldEntity {
    const slots = [
      createSlot(0, 0), createSlot(0, 1),
      createSlot(1, 0), createSlot(1, 1),
    ];
    return new BattlefieldEntity(2, 2, slots);
  }

  it('finds slots by id and position', () => {
    const bf = create2x2Battlefield();
    expect(bf.getSlot('slot-0-0')).toBeDefined();
    expect(bf.getSlotAt(1, 1)).toBeDefined();
    expect(bf.getSlot('nonexistent')).toBeUndefined();
  });

  it('resolves adjacent slots correctly', () => {
    const bf = create2x2Battlefield();
    // slot (0,0) is adjacent to (0,1) and (1,0)
    const adjacent = bf.getAdjacentSlots('slot-0-0');
    const ids = adjacent.map((s) => s.slotId).sort();
    expect(ids).toEqual(['slot-0-1', 'slot-1-0']);
  });

  it('resolves adjacent slots for center of 3x3', () => {
    const slots = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        slots.push(createSlot(r, c));
      }
    }
    const bf = new BattlefieldEntity(3, 3, slots);
    const adjacent = bf.getAdjacentSlots('slot-1-1');
    const ids = adjacent.map((s) => s.slotId).sort();
    expect(ids).toEqual(['slot-0-1', 'slot-1-0', 'slot-1-2', 'slot-2-1']);
  });

  it('tracks occupied and empty slots', () => {
    const bf = create2x2Battlefield();
    expect(bf.allOccupiedSlots).toHaveLength(0);
    expect(bf.allEmptySlots).toHaveLength(4);
    expect(bf.isFull).toBe(false);

    bf.getSlot('slot-0-0')!.place(createTroop());
    expect(bf.allOccupiedSlots).toHaveLength(1);
    expect(bf.allEmptySlots).toHaveLength(3);
  });

  it('detects when battlefield is full', () => {
    const bf = create2x2Battlefield();
    bf.slots.forEach((s) => s.place(createTroop()));
    expect(bf.isFull).toBe(true);
  });
});
