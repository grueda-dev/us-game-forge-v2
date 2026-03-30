import { Observable } from 'rxjs';
import type {
  DeckConfig,
  RulesConfig,
  BattlefieldConfig,
} from '@game-forge/shared-schema';

export abstract class ConfigurationRepositoryPort {
  abstract saveDeckConfig(config: DeckConfig): Observable<void>;
  abstract getDeckConfig(id: string): Observable<DeckConfig | null>;
  abstract listDeckConfigs(): Observable<DeckConfig[]>;

  abstract saveRulesConfig(config: RulesConfig): Observable<void>;
  abstract getRulesConfig(id: string): Observable<RulesConfig | null>;
  abstract listRulesConfigs(): Observable<RulesConfig[]>;

  abstract saveBattlefieldConfig(config: BattlefieldConfig): Observable<void>;
  abstract getBattlefieldConfig(id: string): Observable<BattlefieldConfig | null>;
  abstract listBattlefieldConfigs(): Observable<BattlefieldConfig[]>;
}
