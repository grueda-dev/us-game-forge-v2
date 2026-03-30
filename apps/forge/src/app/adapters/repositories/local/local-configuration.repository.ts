import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type {
  DeckConfig,
  RulesConfig,
  BattlefieldConfig,
} from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../../domain/ports/configuration-repository.port';
import { DuckDBService } from '../../../infrastructure/persistence/duckdb/duckdb.service';

@Injectable()
export class LocalConfigurationRepository extends ConfigurationRepositoryPort {
  constructor(private duckdb: DuckDBService) {
    super();
  }

  saveDeckConfig(config: DeckConfig): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO deck_configs (id, format_version, name, general_definition_id, data)
      VALUES ('${config.id}', '${config.formatVersion}', '${config.name}', '${config.generalDefinitionId}', '${JSON.stringify(config)}')
    `));
  }

  getDeckConfig(id: string): Observable<DeckConfig | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM deck_configs WHERE id = '${id}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as DeckConfig : null),
    );
  }

  listDeckConfigs(): Observable<DeckConfig[]> {
    return from(
      this.duckdb.query<{ data: string }>('SELECT data FROM deck_configs ORDER BY name')
        .then((rows) => rows.map((r) => JSON.parse(r.data) as DeckConfig)),
    );
  }

  saveRulesConfig(config: RulesConfig): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO rules_configs (id, format_version, name, data)
      VALUES ('${config.id}', '${config.formatVersion}', '${config.name}', '${JSON.stringify(config)}')
    `));
  }

  getRulesConfig(id: string): Observable<RulesConfig | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM rules_configs WHERE id = '${id}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as RulesConfig : null),
    );
  }

  listRulesConfigs(): Observable<RulesConfig[]> {
    return from(
      this.duckdb.query<{ data: string }>('SELECT data FROM rules_configs ORDER BY name')
        .then((rows) => rows.map((r) => JSON.parse(r.data) as RulesConfig)),
    );
  }

  saveBattlefieldConfig(config: BattlefieldConfig): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO battlefield_configs (id, format_version, name, data)
      VALUES ('${config.id}', '${config.formatVersion}', '${config.name}', '${JSON.stringify(config)}')
    `));
  }

  getBattlefieldConfig(id: string): Observable<BattlefieldConfig | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM battlefield_configs WHERE id = '${id}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as BattlefieldConfig : null),
    );
  }

  listBattlefieldConfigs(): Observable<BattlefieldConfig[]> {
    return from(
      this.duckdb.query<{ data: string }>('SELECT data FROM battlefield_configs ORDER BY name')
        .then((rows) => rows.map((r) => JSON.parse(r.data) as BattlefieldConfig)),
    );
  }
}
