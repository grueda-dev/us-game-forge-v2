import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { BattlefieldSlotEntity, PlaceableCard } from '@game-forge/shared-domain';
import { BattleSessionService } from '../battle-configurator/battle-session.service';
import { PlayBattleTurnUseCase } from '../../application/use-cases/battle/play-battle-turn.use-case';
import { ResolveBattleEndUseCase } from '../../application/use-cases/battle/resolve-battle-end.use-case';
import type { BattleState } from '../../application/services/battle-state';

@Component({
  selector: 'app-battle-player',
  standalone: true,
  templateUrl: './battle-player.component.html',
  styleUrl: './battle-player.component.scss',
})
export class BattlePlayerComponent {
  state: BattleState | null = null;

  hand = signal<PlaceableCard[]>([]);
  selectedCard = signal<PlaceableCard | null>(null);
  playerPower = signal(0);
  opponentPower = signal(0);
  currentTurn = signal(0);
  activePlayer = signal<'player' | 'opponent'>('player');
  battleComplete = signal(false);
  log = signal<string[]>([]);

  constructor(
    private session: BattleSessionService,
    private playTurn: PlayBattleTurnUseCase,
    private resolveEnd: ResolveBattleEndUseCase,
    private router: Router,
  ) {
    this.state = session.getState();
    if (!this.state) {
      this.router.navigate(['/battle']);
      return;
    }
    this.drawPlayerHand();
  }

  get battlefield(): BattlefieldSlotEntity[] {
    return this.state?.playerBattlefield.slots ?? [];
  }

  get opponentBattlefield(): BattlefieldSlotEntity[] {
    return this.state?.opponentBattlefield.slots ?? [];
  }

  get gridRows(): number {
    return this.state?.playerBattlefield.rows ?? 0;
  }

  get gridCols(): number {
    return this.state?.playerBattlefield.cols ?? 0;
  }

  selectCard(card: PlaceableCard): void {
    this.selectedCard.set(card);
  }

  placeCard(slot: BattlefieldSlotEntity): void {
    if (!this.state || slot.isOccupied || !this.selectedCard()) return;

    const card = this.selectedCard()!;
    const result = this.playTurn.placeCard(this.state, card.instanceId.value, slot.slotId);

    this.addLog(`Player placed ${card.name} (${card.cardClass}) on ${slot.slotId} — Power: ${result.updatedPower}`);

    this.selectedCard.set(null);
    this.hand.update((h) => h.filter((c) => !c.instanceId.equals(card.instanceId)));
    this.updatePower();

    if (result.battleComplete) {
      this.battleComplete.set(true);
      this.finishBattle();
      return;
    }

    // Opponent turn (auto-play)
    this.playOpponentTurn();
  }

  slotLabel(slot: BattlefieldSlotEntity): string {
    if (slot.card) {
      return `${slot.card.name}\n${slot.card.effectivePower}`;
    }
    if (slot.terrainType) {
      return slot.terrainType;
    }
    return '';
  }

  private drawPlayerHand(): void {
    if (!this.state) return;
    const drawn = this.state.drawHand(this.state.powerConfig.stepOrder.length > 0 ? 3 : 3);
    this.hand.set(drawn);
    this.currentTurn.set(this.state.currentTurn);
    this.activePlayer.set(this.state.activePlayer);
  }

  private playOpponentTurn(): void {
    if (!this.state || this.state.battleComplete) return;

    const hand = this.state.drawHand(3);
    if (hand.length === 0) {
      this.state.resolveBattle();
      this.battleComplete.set(true);
      this.finishBattle();
      return;
    }

    const emptySlots = this.state.opponentBattlefield.allEmptySlots;
    if (emptySlots.length === 0) {
      this.state.advanceTurn();
      this.drawPlayerHand();
      return;
    }

    const card = hand[Math.floor(Math.random() * hand.length)];
    const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];

    this.playTurn.placeCard(this.state, card.instanceId.value, slot.slotId);
    this.addLog(`Opponent placed ${card.name} (${card.cardClass}) on ${slot.slotId}`);

    this.updatePower();

    if (this.state.battleComplete) {
      this.battleComplete.set(true);
      this.finishBattle();
      return;
    }

    // Draw new player hand
    this.drawPlayerHand();
  }

  private updatePower(): void {
    if (!this.state) return;
    this.playerPower.set(this.state.calculatePower('player').totalPower);
    this.opponentPower.set(this.state.calculatePower('opponent').totalPower);
  }

  private finishBattle(): void {
    if (!this.state) return;
    const result = this.resolveEnd.execute(this.state);
    this.session.setResult(result);
    this.addLog(`Battle over! Winner: ${result.result.winner}`);
  }

  viewResults(): void {
    this.router.navigate(['/battle/result']);
  }

  private addLog(msg: string): void {
    this.log.update((l) => [...l, msg]);
  }
}
