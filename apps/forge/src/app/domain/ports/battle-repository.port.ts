import { Observable } from 'rxjs';
import type { BattleDefinition } from '@game-forge/shared-schema';

export abstract class BattleRepositoryPort {
  abstract saveBattle(battle: BattleDefinition): Observable<void>;
  abstract getBattle(id: string): Observable<BattleDefinition | null>;
  abstract listBattles(): Observable<BattleDefinition[]>;
}
