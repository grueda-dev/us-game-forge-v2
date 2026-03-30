import { Injectable } from '@angular/core';
import type { BattleState } from '../../application/services/battle-state';
import type { BattleEndResult } from '../../application/use-cases/battle/resolve-battle-end.use-case';

@Injectable({ providedIn: 'root' })
export class BattleSessionService {
  private currentState: BattleState | null = null;
  private lastResult: BattleEndResult | null = null;

  setState(state: BattleState): void {
    this.currentState = state;
    this.lastResult = null;
  }

  getState(): BattleState | null {
    return this.currentState;
  }

  setResult(result: BattleEndResult): void {
    this.lastResult = result;
  }

  getResult(): BattleEndResult | null {
    return this.lastResult;
  }
}
