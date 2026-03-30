import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { DeckConfig, BattlefieldConfig, RulesConfig } from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../domain/ports/configuration-repository.port';
import { ConfigureBattleUseCase } from '../../application/use-cases/battle/configure-battle.use-case';
import { DEFAULT_BATTLEFIELD, DEFAULT_RULES } from '../../infrastructure/seed/default-configs';
import { BattleSessionService } from './battle-session.service';

@Component({
  selector: 'app-battle-configurator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './battle-configurator.component.html',
  styleUrl: './battle-configurator.component.scss',
})
export class BattleConfiguratorComponent {
  decks = signal<DeckConfig[]>([]);
  battlefields = signal<BattlefieldConfig[]>([]);
  rules = signal<RulesConfig[]>([]);

  selectedPlayerDeck = '';
  selectedOpponentDeck = '';
  selectedBattlefield = '';
  selectedRules = '';

  constructor(
    private configRepo: ConfigurationRepositoryPort,
    private configureBattle: ConfigureBattleUseCase,
    private battleSession: BattleSessionService,
    private router: Router,
  ) {
    this.loadConfigs();
  }

  startBattle(): void {
    const playerDeck = this.decks().find((d) => d.id === this.selectedPlayerDeck);
    const opponentDeck = this.decks().find((d) => d.id === this.selectedOpponentDeck);
    const battlefield = this.battlefields().find((b) => b.id === this.selectedBattlefield);
    const rules = this.rules().find((r) => r.id === this.selectedRules);

    if (!playerDeck || !opponentDeck || !battlefield || !rules) return;

    const state = this.configureBattle.buildBattleState(
      playerDeck, opponentDeck, battlefield, rules,
    );
    this.battleSession.setState(state);
    this.router.navigate(['/battle/play']);
  }

  get canStart(): boolean {
    return !!(this.selectedPlayerDeck && this.selectedOpponentDeck && this.selectedBattlefield && this.selectedRules);
  }

  private loadConfigs(): void {
    this.configRepo.listDeckConfigs().subscribe((d) => this.decks.set(d));
    this.configRepo.listBattlefieldConfigs().subscribe((b) => {
      if (b.length === 0) {
        // Seed defaults
        this.configRepo.saveBattlefieldConfig(DEFAULT_BATTLEFIELD).subscribe(() => {
          this.battlefields.set([DEFAULT_BATTLEFIELD]);
          this.selectedBattlefield = DEFAULT_BATTLEFIELD.id;
        });
      } else {
        this.battlefields.set(b);
        this.selectedBattlefield = b[0].id;
      }
    });
    this.configRepo.listRulesConfigs().subscribe((r) => {
      if (r.length === 0) {
        this.configRepo.saveRulesConfig(DEFAULT_RULES).subscribe(() => {
          this.rules.set([DEFAULT_RULES]);
          this.selectedRules = DEFAULT_RULES.id;
        });
      } else {
        this.rules.set(r);
        this.selectedRules = r[0].id;
      }
    });
  }
}
