import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import type {
  DeckConfig,
  RulesConfig,
  BattlefieldConfig,
} from '@game-forge/shared-schema';
import {
  TroopCardEntity,
  MercenaryCardEntity,
  BattlefieldSlotEntity,
  BattlefieldEntity,
  type GlobalBonusEffect,
  type PlaceableCard,
} from '@game-forge/shared-domain';
import { ConfigurationRepositoryPort } from '../../../domain/ports/configuration-repository.port';
import { BattleState, type BattleDeck } from '../../services/battle-state';
import type { ConfigureBattleInput, BattleStateDto } from '../../dtos/battle.dto';

let battleCounter = 0;

@Injectable({ providedIn: 'root' })
export class ConfigureBattleUseCase {
  constructor(private configRepo: ConfigurationRepositoryPort) {}

  execute(input: ConfigureBattleInput): Observable<BattleState> {
    return forkJoin({
      playerDeck: this.configRepo.getDeckConfig(input.playerDeckConfigId),
      opponentDeck: this.configRepo.getDeckConfig(input.opponentDeckConfigId),
      battlefield: this.configRepo.getBattlefieldConfig(input.battlefieldConfigId),
      rules: this.configRepo.getRulesConfig(input.rulesConfigId),
    }).pipe(
      map(({ playerDeck, opponentDeck, battlefield, rules }) => {
        if (!playerDeck || !opponentDeck || !battlefield || !rules) {
          throw new Error('One or more configurations not found');
        }
        return this.buildBattleState(playerDeck, opponentDeck, battlefield, rules);
      }),
    );
  }

  /**
   * Create a BattleState directly from config objects (no repository lookup needed).
   * Useful for testing and simulation.
   */
  buildBattleState(
    playerDeckConfig: DeckConfig,
    opponentDeckConfig: DeckConfig,
    battlefieldConfig: BattlefieldConfig,
    rulesConfig: RulesConfig,
  ): BattleState {
    const battleId = `battle_${++battleCounter}_${Date.now().toString(36)}`;

    const playerCards = this.instantiateCards(playerDeckConfig);
    const opponentCards = this.instantiateCards(opponentDeckConfig);

    const playerBf = this.buildBattlefield(battlefieldConfig);
    const opponentBf = this.buildBattlefield(battlefieldConfig);

    const endWhenFull = rulesConfig.turnConfig.turnLimitIfApplicable === null;
    const maxTurns = rulesConfig.turnConfig.turnLimitIfApplicable;

    return new BattleState(
      battleId,
      playerBf,
      opponentBf,
      { cards: playerCards, drawn: [] },
      { cards: opponentCards, drawn: [] },
      null, // TODO: resolve general from deck config
      null,
      rulesConfig.powerCalculation,
      rulesConfig.xpConfig,
      5, // aoeUnlockLevel — should come from rules config eventually
      maxTurns,
      endWhenFull,
    );
  }

  private instantiateCards(deckConfig: DeckConfig): PlaceableCard[] {
    const cards: PlaceableCard[] = [];

    for (const entry of deckConfig.troopEntries) {
      for (let i = 0; i < entry.quantity; i++) {
        cards.push(
          new TroopCardEntity(
            entry.definitionId,
            entry.definitionId, // name — would come from card catalog
            'HUMAN' as any,
            'INFANTRY' as any,
            10, // basePower — would come from card catalog
          ),
        );
      }
    }

    for (const entry of deckConfig.mercenaryEntries ?? []) {
      cards.push(
        new MercenaryCardEntity(
          entry.definitionId,
          entry.definitionId,
          'HUMAN' as any,
          'INFANTRY' as any,
          25,
          3,
          null,
        ),
      );
    }

    return cards;
  }

  private buildBattlefield(config: BattlefieldConfig): BattlefieldEntity {
    const slots = config.slots.map(
      (s) =>
        new BattlefieldSlotEntity(
          s.slotId,
          s.position,
          s.terrainType,
          s.modifiers,
        ),
    );
    return new BattlefieldEntity(config.grid.rows, config.grid.cols, slots);
  }
}
