import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SlicePipe, DecimalPipe } from '@angular/common';
import { BattleSessionService } from '../battle-configurator/battle-session.service';
import type { BattleEndResult } from '../../application/use-cases/battle/resolve-battle-end.use-case';
import type { CardPowerBreakdown } from '@game-forge/shared-domain';

@Component({
  selector: 'app-battle-result',
  standalone: true,
  imports: [RouterLink, SlicePipe, DecimalPipe],
  templateUrl: './battle-result.component.html',
  styleUrl: './battle-result.component.scss',
})
export class BattleResultComponent {
  result: BattleEndResult | null = null;

  constructor(
    private session: BattleSessionService,
    private router: Router,
  ) {
    this.result = session.getResult();
    if (!this.result) {
      this.router.navigate(['/battle']);
    }
  }

  get winner(): string {
    return this.result?.result.winner ?? '';
  }

  get playerPower(): number {
    return this.result?.result.playerTotalPower ?? 0;
  }

  get opponentPower(): number {
    return this.result?.result.opponentTotalPower ?? 0;
  }

  get playerBreakdowns(): CardPowerBreakdown[] {
    return this.result?.result.playerBreakdowns ?? [];
  }

  get opponentBreakdowns(): CardPowerBreakdown[] {
    return this.result?.result.opponentBreakdowns ?? [];
  }

  get xpGains() {
    return this.result?.xpGains ?? [];
  }
}
