import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type { BattleDefinition } from '@game-forge/shared-schema';
import { BattleRepositoryPort } from '../../../domain/ports/battle-repository.port';
import { DuckDBService } from '../../../infrastructure/persistence/duckdb/duckdb.service';

@Injectable()
export class LocalBattleRepository extends BattleRepositoryPort {
  constructor(private duckdb: DuckDBService) {
    super();
  }

  saveBattle(battle: BattleDefinition): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO battle_definitions (id, format_version, name, data)
      VALUES ('${battle.id}', '${battle.formatVersion}', '${battle.name}', '${JSON.stringify(battle)}')
    `));
  }

  getBattle(id: string): Observable<BattleDefinition | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM battle_definitions WHERE id = '${id}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as BattleDefinition : null),
    );
  }

  listBattles(): Observable<BattleDefinition[]> {
    return from(
      this.duckdb.query<{ data: string }>('SELECT data FROM battle_definitions ORDER BY name')
        .then((rows) => rows.map((r) => JSON.parse(r.data) as BattleDefinition)),
    );
  }
}
