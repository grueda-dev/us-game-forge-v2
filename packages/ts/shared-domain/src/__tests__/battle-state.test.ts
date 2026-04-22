import {
  Faction, CardClass, TerrainType, PowerCalculationStep,
  type PowerCalculationConfig, type XpConfig, type DeckConfig,
  type RulesConfig, type BattlefieldConfig,
} from '@game-forge/shared-schema';
import {
  TroopCardEntity,
  MercenaryCardEntity,
  BattlefieldSlotEntity,
  BattlefieldEntity,
  calculateArmyPower,
  awardBattleXp,
  type GlobalBonusEffect,
  type PlaceableCard,
} from '../index';

// Minimal battle simulation test without Angular dependency

function createSlot(
  row: number, col: number,
  terrainType: TerrainType | null = null,
  modifiers: { targetClass: CardClass; multiplier: number }[] = [],
): BattlefieldSlotEntity {
  return new BattlefieldSlotEntity(
    `slot-${row}-${col}`, { row, col }, terrainType, modifiers,
  );
}

function createTroop(
  id: string, cardClass: CardClass, basePower: number, level = 1,
): TroopCardEntity {
  return new TroopCardEntity(id, `Test ${id}`, Faction.HUMAN, cardClass, basePower, { level });
}

const DEFAULT_CONFIG: PowerCalculationConfig = {
  stepOrder: [
    PowerCalculationStep.BASE_POWER,
    PowerCalculationStep.AOE_BONUS,
    PowerCalculationStep.SLOT_MODIFIER,
    PowerCalculationStep.GENERAL_BONUS,
  ],
  stepMultipliers: {},
};

const DEFAULT_XP: XpConfig = {
  baseXpPerBattle: 10,
  bonusXpForWin: 5,
  levelThresholds: [0, 100, 250, 500],
};

describe('Battle simulation flow', () => {
  it('runs a complete battle: place cards, calculate power, award XP', () => {
    // Setup: 2x2 battlefield, one hill slot
    const playerSlots = [
      createSlot(0, 0, TerrainType.HILL, [{ targetClass: CardClass.ARCHER, multiplier: 2 }]),
      createSlot(0, 1),
      createSlot(1, 0),
      createSlot(1, 1),
    ];
    const opponentSlots = [
      createSlot(0, 0), createSlot(0, 1),
      createSlot(1, 0), createSlot(1, 1),
    ];

    const playerBf = new BattlefieldEntity(2, 2, playerSlots);
    const opponentBf = new BattlefieldEntity(2, 2, opponentSlots);

    // Player places an archer on the hill (should get 2x)
    const archer = createTroop('archer-1', CardClass.ARCHER, 10);
    playerBf.getSlot('slot-0-0')!.place(archer);

    // Player places infantry adjacent
    const infantry = createTroop('infantry-1', CardClass.INFANTRY, 8);
    playerBf.getSlot('slot-0-1')!.place(infantry);

    // Opponent places two cavalry
    const cav1 = createTroop('cav-1', CardClass.CAVALRY, 12);
    const cav2 = createTroop('cav-2', CardClass.CAVALRY, 12);
    opponentBf.getSlot('slot-0-0')!.place(cav1);
    opponentBf.getSlot('slot-0-1')!.place(cav2);

    // Calculate power
    const playerPower = calculateArmyPower(playerBf, null, DEFAULT_CONFIG, 5);
    const opponentPower = calculateArmyPower(opponentBf, null, DEFAULT_CONFIG, 5);

    // Player: archer (10 base, 2x hill = 20) + infantry (8) = 28
    expect(playerPower.totalPower).toBe(28);
    // Opponent: 12 + 12 = 24
    expect(opponentPower.totalPower).toBe(24);

    // Player wins
    const playerWon = playerPower.totalPower > opponentPower.totalPower;
    expect(playerWon).toBe(true);

    // Award XP
    const participatingTroops = playerBf.allOccupiedSlots
      .map((s) => s.card!)
      .filter((c): c is TroopCardEntity => c instanceof TroopCardEntity);

    const xpResults = awardBattleXp(participatingTroops, playerWon, DEFAULT_XP);
    expect(xpResults).toHaveLength(2);
    xpResults.forEach((r) => {
      expect(r.xpGained).toBe(15); // 10 base + 5 win bonus
    });
  });

  it('general bonus changes battle outcome', () => {
    const playerSlots = [createSlot(0, 0)];
    const opponentSlots = [createSlot(0, 0)];

    const playerBf = new BattlefieldEntity(1, 1, playerSlots);
    const opponentBf = new BattlefieldEntity(1, 1, opponentSlots);

    playerBf.getSlot('slot-0-0')!.place(createTroop('inf-1', CardClass.INFANTRY, 10));
    opponentBf.getSlot('slot-0-0')!.place(createTroop('inf-2', CardClass.INFANTRY, 15));

    // Without general: player 10 vs opponent 15 → opponent wins
    const p1 = calculateArmyPower(playerBf, null, DEFAULT_CONFIG, 5);
    const o1 = calculateArmyPower(opponentBf, null, DEFAULT_CONFIG, 5);
    expect(p1.totalPower).toBeLessThan(o1.totalPower);

    // With player general: 2x infantry → player 20 vs opponent 15
    const general: GlobalBonusEffect = {
      targetClass: CardClass.INFANTRY,
      targetFaction: null,
      multiplier: 2,
    };
    const p2 = calculateArmyPower(playerBf, general, DEFAULT_CONFIG, 5);
    expect(p2.totalPower).toBeGreaterThan(o1.totalPower);
  });

  it('mercenary deployment tracking across battles', () => {
    const mercenary = new MercenaryCardEntity(
      'mercenary-01', 'Iron Commander', Faction.HUMAN, CardClass.INFANTRY, 25, 2, null,
    );

    // Battle 1
    mercenary.deploy();
    expect(mercenary.deploymentsRemaining).toBe(1);
    expect(mercenary.isExhausted).toBe(false);

    // Battle 2
    mercenary.deploy();
    expect(mercenary.deploymentsRemaining).toBe(0);
    expect(mercenary.isExhausted).toBe(true);

    // Cannot deploy again
    expect(() => mercenary.deploy()).toThrow();
  });

  it('simulation produces statistics from multiple battles', () => {
    const results: { winner: 'player' | 'opponent' | 'draw' }[] = [];

    // Run 100 micro-battles
    for (let i = 0; i < 100; i++) {
      const playerSlots = [createSlot(0, 0)];
      const opponentSlots = [createSlot(0, 0)];
      const pBf = new BattlefieldEntity(1, 1, playerSlots);
      const oBf = new BattlefieldEntity(1, 1, opponentSlots);

      // Random power between 5-15
      const pPower = 5 + Math.floor(Math.random() * 11);
      const oPower = 5 + Math.floor(Math.random() * 11);

      pBf.getSlot('slot-0-0')!.place(createTroop(`p-${i}`, CardClass.INFANTRY, pPower));
      oBf.getSlot('slot-0-0')!.place(createTroop(`o-${i}`, CardClass.INFANTRY, oPower));

      const pResult = calculateArmyPower(pBf, null, DEFAULT_CONFIG, 5);
      const oResult = calculateArmyPower(oBf, null, DEFAULT_CONFIG, 5);

      if (pResult.totalPower > oResult.totalPower) results.push({ winner: 'player' });
      else if (oResult.totalPower > pResult.totalPower) results.push({ winner: 'opponent' });
      else results.push({ winner: 'draw' });
    }

    const playerWins = results.filter((r) => r.winner === 'player').length;
    const opponentWins = results.filter((r) => r.winner === 'opponent').length;
    const draws = results.filter((r) => r.winner === 'draw').length;

    // With random power, should have a roughly even distribution
    expect(playerWins + opponentWins + draws).toBe(100);
    expect(playerWins).toBeGreaterThan(0);
    expect(opponentWins).toBeGreaterThan(0);
  });
});
