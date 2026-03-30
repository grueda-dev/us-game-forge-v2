import { Injectable } from '@angular/core';
import type { CardPowerBreakdown } from '@game-forge/shared-domain';
import type { BattleState } from '../../services/battle-state';
import type { PlayTurnInput, PlayTurnOutput, BattleStateDto, CardSummaryDto } from '../../dtos/battle.dto';

@Injectable({ providedIn: 'root' })
export class PlayBattleTurnUseCase {
  /**
   * Draw a hand of N cards from the active player's deck.
   */
  drawHand(state: BattleState, count: number): CardSummaryDto[] {
    const hand = state.drawHand(count);
    return hand.map((card) => ({
      instanceId: card.instanceId.value,
      definitionId: card.definitionId,
      name: card.name,
      faction: card.faction,
      cardClass: card.cardClass,
      effectivePower: card.effectivePower,
      cardType: card.cardType,
    }));
  }

  /**
   * Place a card from the drawn hand onto a battlefield slot.
   */
  placeCard(
    state: BattleState,
    cardInstanceId: string,
    targetSlotId: string,
  ): PlayTurnOutput {
    const battlefield = state.getActiveBattlefield();
    const deck = state.activePlayer === 'player' ? state.playerDeck : state.opponentDeck;

    const card = deck.drawn.find((c) => c.instanceId.value === cardInstanceId);
    if (!card) {
      throw new Error(`Card ${cardInstanceId} not found in drawn hand`);
    }

    const slot = battlefield.getSlot(targetSlotId);
    if (!slot) {
      throw new Error(`Slot ${targetSlotId} not found on battlefield`);
    }

    slot.place(card);
    state.returnUnplayed(card);

    const powerResult = state.calculatePower(state.activePlayer);
    const cardBreakdown = powerResult.cardBreakdowns.find(
      (b) => b.instanceId === cardInstanceId,
    )!;

    state.advanceTurn();

    return {
      updatedPower: powerResult.totalPower,
      cardBreakdown,
      turnComplete: true,
      battleComplete: state.battleComplete,
      nextState: this.toBattleStateDto(state),
    };
  }

  toBattleStateDto(state: BattleState): BattleStateDto {
    const playerPower = state.calculatePower('player').totalPower;
    const opponentPower = state.calculatePower('opponent').totalPower;

    return {
      battleId: state.battleId,
      currentTurn: state.currentTurn,
      activePlayer: state.activePlayer,
      playerHandOptions: [],
      playerPower,
      opponentPower,
      battleComplete: state.battleComplete,
    };
  }
}
