import { Injectable } from '@angular/core';
import type {
  DeckConfig,
  RulesConfig,
  BattlefieldConfig,
} from '@game-forge/shared-schema';
import { ConfigureBattleUseCase } from './configure-battle.use-case';
import { PlayBattleTurnUseCase } from './play-battle-turn.use-case';
import { ResolveBattleEndUseCase, type BattleEndResult } from './resolve-battle-end.use-case';
import type { BattleState } from '../../services/battle-state';

export interface SimulationInput {
  playerDeckConfig: DeckConfig;
  opponentDeckConfig: DeckConfig;
  battlefieldConfig: BattlefieldConfig;
  rulesConfig: RulesConfig;
  iterations: number;
}

export interface SimulationOutput {
  results: BattleEndResult[];
  summary: {
    playerWinRate: number;
    opponentWinRate: number;
    drawRate: number;
    avgPlayerPower: number;
    avgOpponentPower: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SimulateBattleUseCase {
  constructor(
    private configureBattle: ConfigureBattleUseCase,
    private playTurn: PlayBattleTurnUseCase,
    private resolveEnd: ResolveBattleEndUseCase,
  ) {}

  execute(input: SimulationInput): SimulationOutput {
    const results: BattleEndResult[] = [];

    for (let i = 0; i < input.iterations; i++) {
      const state = this.configureBattle.buildBattleState(
        input.playerDeckConfig,
        input.opponentDeckConfig,
        input.battlefieldConfig,
        input.rulesConfig,
      );

      this.playOutBattle(state, input.rulesConfig.turnConfig.cardsDrawnPerTurn);
      results.push(this.resolveEnd.execute(state));
    }

    return {
      results,
      summary: this.computeSummary(results),
    };
  }

  private playOutBattle(state: BattleState, cardsPerTurn: number): void {
    const maxIterations = 1000; // safety limit
    let iterations = 0;

    while (!state.battleComplete && iterations < maxIterations) {
      const hand = state.drawHand(cardsPerTurn);
      if (hand.length === 0) {
        state.resolveBattle();
        break;
      }

      const emptySlots = state.getActiveBattlefield().allEmptySlots;
      if (emptySlots.length === 0) {
        state.advanceTurn();
        iterations++;
        continue;
      }

      // AI: random card placement
      const card = hand[Math.floor(Math.random() * hand.length)];
      const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];

      this.playTurn.placeCard(state, card.instanceId.value, slot.slotId);
      iterations++;
    }
  }

  private computeSummary(results: BattleEndResult[]): SimulationOutput['summary'] {
    const total = results.length;
    if (total === 0) {
      return { playerWinRate: 0, opponentWinRate: 0, drawRate: 0, avgPlayerPower: 0, avgOpponentPower: 0 };
    }

    const playerWins = results.filter((r) => r.result.winner === 'player').length;
    const opponentWins = results.filter((r) => r.result.winner === 'opponent').length;
    const draws = results.filter((r) => r.result.winner === 'draw').length;

    const avgPlayerPower =
      results.reduce((sum, r) => sum + r.result.playerTotalPower, 0) / total;
    const avgOpponentPower =
      results.reduce((sum, r) => sum + r.result.opponentTotalPower, 0) / total;

    return {
      playerWinRate: playerWins / total,
      opponentWinRate: opponentWins / total,
      drawRate: draws / total,
      avgPlayerPower,
      avgOpponentPower,
    };
  }
}
