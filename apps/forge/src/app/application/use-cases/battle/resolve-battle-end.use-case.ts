import { Injectable } from '@angular/core';
import {
  TroopCardEntity,
  awardBattleXp,
  type XpGainResult,
} from '@game-forge/shared-domain';
import type { BattleState } from '../../services/battle-state';
import type { BattleResultDto } from '../../dtos/battle.dto';

export interface BattleEndResult {
  result: BattleResultDto;
  xpGains: XpGainResult[];
}

@Injectable({ providedIn: 'root' })
export class ResolveBattleEndUseCase {
  execute(state: BattleState): BattleEndResult {
    if (!state.battleComplete) {
      state.resolveBattle();
    }

    const playerPower = state.calculatePower('player');
    const opponentPower = state.calculatePower('opponent');

    const participatingTroops = state.playerBattlefield.allOccupiedSlots
      .map((s) => s.card!)
      .filter((c): c is TroopCardEntity => c instanceof TroopCardEntity);

    const xpGains = awardBattleXp(
      participatingTroops,
      state.winner === 'player',
      state.xpConfig,
    );

    return {
      result: {
        battleId: state.battleId,
        playerTotalPower: playerPower.totalPower,
        opponentTotalPower: opponentPower.totalPower,
        winner: state.winner!,
        playerBreakdowns: playerPower.cardBreakdowns,
        opponentBreakdowns: opponentPower.cardBreakdowns,
      },
      xpGains,
    };
  }
}
