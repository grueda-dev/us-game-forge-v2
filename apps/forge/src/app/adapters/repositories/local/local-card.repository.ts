import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type { CardInstance, MercenaryCardInstance } from '@game-forge/shared-schema';
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

  saveMercenaryInstance(instance: MercenaryCardInstance): Observable<void> {
    return from(this.duckdb.execute(`
      INSERT OR REPLACE INTO mercenary_instances (instance_id, definition_id, deployments_remaining, data)
      VALUES ('${instance.instanceId}', '${instance.definitionId}', ${instance.deploymentsRemaining}, '${JSON.stringify(instance)}')
    `));
  }

  getMercenaryInstance(instanceId: string): Observable<MercenaryCardInstance | null> {
    return from(
      this.duckdb.query<{ data: string }>(`SELECT data FROM mercenary_instances WHERE instance_id = '${instanceId}'`)
        .then((rows) => rows.length > 0 ? JSON.parse(rows[0].data) as MercenaryCardInstance : null),
    );
  }
}
