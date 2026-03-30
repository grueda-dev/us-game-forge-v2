import type { PowerCalculationConfig, XpConfig } from '@game-forge/shared-schema';
import {
  BattlefieldEntity,
  type PlaceableCard,
  type GlobalBonusEffect,
  calculateArmyPower,
  type ArmyPowerResult,
} from '@game-forge/shared-domain';

export interface BattleDeck {
  cards: PlaceableCard[];
  drawn: PlaceableCard[];
}

export class BattleState {
  currentTurn = 0;
  activePlayer: 'player' | 'opponent' = 'player';
  battleComplete = false;
  winner: 'player' | 'opponent' | 'draw' | null = null;

  constructor(
    public readonly battleId: string,
    public readonly playerBattlefield: BattlefieldEntity,
    public readonly opponentBattlefield: BattlefieldEntity,
    public readonly playerDeck: BattleDeck,
    public readonly opponentDeck: BattleDeck,
    public readonly playerGeneral: GlobalBonusEffect | null,
    public readonly opponentGeneral: GlobalBonusEffect | null,
    public readonly powerConfig: PowerCalculationConfig,
    public readonly xpConfig: XpConfig,
    public readonly aoeUnlockLevel: number,
    public readonly maxTurns: number | null,
    public readonly endWhenFull: boolean,
  ) {}

  drawHand(count: number): PlaceableCard[] {
    const deck = this.activePlayer === 'player' ? this.playerDeck : this.opponentDeck;
    const hand: PlaceableCard[] = [];
    for (let i = 0; i < count && deck.cards.length > 0; i++) {
      const index = Math.floor(Math.random() * deck.cards.length);
      hand.push(deck.cards.splice(index, 1)[0]);
    }
    deck.drawn = hand;
    return hand;
  }

  returnUnplayed(played: PlaceableCard): void {
    const deck = this.activePlayer === 'player' ? this.playerDeck : this.opponentDeck;
    const remaining = deck.drawn.filter(
      (c) => !c.instanceId.equals(played.instanceId),
    );
    deck.cards.push(...remaining);
    deck.drawn = [];
  }

  getActiveBattlefield(): BattlefieldEntity {
    return this.activePlayer === 'player'
      ? this.playerBattlefield
      : this.opponentBattlefield;
  }

  getActiveGeneral(): GlobalBonusEffect | null {
    return this.activePlayer === 'player'
      ? this.playerGeneral
      : this.opponentGeneral;
  }

  calculatePower(side: 'player' | 'opponent'): ArmyPowerResult {
    const bf = side === 'player' ? this.playerBattlefield : this.opponentBattlefield;
    const general = side === 'player' ? this.playerGeneral : this.opponentGeneral;
    return calculateArmyPower(bf, general, this.powerConfig, this.aoeUnlockLevel);
  }

  advanceTurn(): void {
    if (this.activePlayer === 'opponent') {
      this.currentTurn++;
    }
    this.activePlayer = this.activePlayer === 'player' ? 'opponent' : 'player';
    this.checkBattleEnd();
  }

  private checkBattleEnd(): void {
    if (this.endWhenFull) {
      if (this.playerBattlefield.isFull && this.opponentBattlefield.isFull) {
        this.resolveBattle();
        return;
      }
    }
    if (this.maxTurns !== null && this.currentTurn >= this.maxTurns) {
      this.resolveBattle();
    }
  }

  resolveBattle(): void {
    const playerResult = this.calculatePower('player');
    const opponentResult = this.calculatePower('opponent');

    if (playerResult.totalPower > opponentResult.totalPower) {
      this.winner = 'player';
    } else if (opponentResult.totalPower > playerResult.totalPower) {
      this.winner = 'opponent';
    } else {
      this.winner = 'draw';
    }
    this.battleComplete = true;
  }
}
