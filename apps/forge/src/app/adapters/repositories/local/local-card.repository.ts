import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type { CardInstance, HeroCardInstance } from '@game-forge/shared-schema';
import { CardRepositoryPort } from '../../../domain/ports/card-repository.port';
import { DuckDBService } from '../../../infrastructure/persistence/duckdb/duckdb.service';

@Injectable()
export class LocalCardRepository extends CardRepositoryPort {
  constructor(private duckdb: DuckDBService) {
    super();
  }

  saveCardInstance(instance: CardInstance): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO card_instances (instance_id, definition_id, level, experience, data)
      VALUES ('${instance.instanceId}', '${instance.definitionId}', ${instance.level}, ${instance.experience}, '${JSON.stringify(instance)}')
    `));
  }

  getCardInstance(instanceId: string): Observable<CardInstance | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM card_instances WHERE instance_id = '${instanceId}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as CardInstance : null),
    );
  }

  saveHeroInstance(instance: HeroCardInstance): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO hero_instances (instance_id, definition_id, deployments_remaining, data)
      VALUES ('${instance.instanceId}', '${instance.definitionId}', ${instance.deploymentsRemaining}, '${JSON.stringify(instance)}')
    `));
  }

  getHeroInstance(instanceId: string): Observable<HeroCardInstance | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM hero_instances WHERE instance_id = '${instanceId}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as HeroCardInstance : null),
    );
  }
}
