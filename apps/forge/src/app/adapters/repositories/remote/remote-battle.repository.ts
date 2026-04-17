import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { BattleDefinition } from '@game-forge/shared-schema';
import { BattleRepositoryPort } from '../../../domain/ports/battle-repository.port';
import { environment } from '../../../../environments/environment';

@Injectable()
export class RemoteBattleRepository extends BattleRepositoryPort {
  private baseUrl = `${environment.apiUrl}/api/v1/battles`;

  constructor(private http: HttpClient) {
    super();
  }

  saveBattle(battle: BattleDefinition): Observable<void> {
    return this.http.post<void>(this.baseUrl, battle);
  }

  getBattle(id: string): Observable<BattleDefinition | null> {
    return this.http.get<BattleDefinition>(`${this.baseUrl}/${id}`);
  }

  listBattles(): Observable<BattleDefinition[]> {
    return this.http.get<BattleDefinition[]>(this.baseUrl);
  }
}
