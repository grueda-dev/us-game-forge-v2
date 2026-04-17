import { Component, computed, signal } from '@angular/core';
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

  selectedPlayerDeck = signal('');
  selectedOpponentDeck = signal('');
  selectedBattlefield = signal('');
  selectedRules = signal('');

  constructor(
    private configRepo: ConfigurationRepositoryPort,
    private configureBattle: ConfigureBattleUseCase,
    private battleSession: BattleSessionService,
    private router: Router,
  ) {
    this.loadConfigs();
  }

  startBattle(): void {
    const playerDeck = this.decks().find((d) => d.id === this.selectedPlayerDeck());
    const opponentDeck = this.decks().find((d) => d.id === this.selectedOpponentDeck());
    const battlefield = this.battlefields().find((b) => b.id === this.selectedBattlefield());
    const rules = this.rules().find((r) => r.id === this.selectedRules());

    if (!playerDeck || !opponentDeck || !battlefield || !rules) return;

    const state = this.configureBattle.buildBattleState(
      playerDeck, opponentDeck, battlefield, rules,
    );
    this.battleSession.setState(state);
    this.router.navigate(['/battle/play']);
  }

  canStart = computed(() =>
    !!(this.selectedPlayerDeck() && this.selectedOpponentDeck() && this.selectedBattlefield() && this.selectedRules()),
  );

  private loadConfigs(): void {
    this.configRepo.listDeckConfigs().subscribe({
      next: (d) => this.decks.set(d),
      error: (err) => console.error('Failed to load decks:', err),
    });
    this.configRepo.listBattlefieldConfigs().subscribe({
      next: (b) => {
        if (b.length === 0) {
          console.log('No battlefields found, seeding default...');
          this.configRepo.saveBattlefieldConfig(DEFAULT_BATTLEFIELD).subscribe({
            next: () => {
              console.log('Default battlefield seeded');
              this.battlefields.set([DEFAULT_BATTLEFIELD]);
              this.selectedBattlefield.set(DEFAULT_BATTLEFIELD.id);
            },
            error: (err) => console.error('Failed to seed battlefield:', err),
          });
        } else {
          this.battlefields.set(b);
          this.selectedBattlefield.set(b[0].id);
        }
      },
      error: (err) => console.error('Failed to load battlefields:', err),
    });
    this.configRepo.listRulesConfigs().subscribe({
      next: (r) => {
        if (r.length === 0) {
          console.log('No rules found, seeding default...');
          this.configRepo.saveRulesConfig(DEFAULT_RULES).subscribe({
            next: () => {
              console.log('Default rules seeded');
              this.rules.set([DEFAULT_RULES]);
              this.selectedRules.set(DEFAULT_RULES.id);
            },
            error: (err) => console.error('Failed to seed rules:', err),
          });
        } else {
          this.rules.set(r);
          this.selectedRules.set(r[0].id);
        }
      },
      error: (err) => console.error('Failed to load rules:', err),
    });
  }
}
