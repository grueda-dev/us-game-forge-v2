import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type {
  DeckConfig,
  RulesConfig,
  BattlefieldConfig,
} from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../../domain/ports/configuration-repository.port';
import { environment } from '../../../../environments/environment';

@Injectable()
export class RemoteConfigurationRepository extends ConfigurationRepositoryPort {
  private baseUrl = `${environment.apiUrl}/api/v1/configurations`;

  constructor(private http: HttpClient) {
    super();
  }

  saveDeckConfig(config: DeckConfig): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/decks`, config);
  }

  getDeckConfig(id: string): Observable<DeckConfig | null> {
    return this.http.get<DeckConfig>(`${this.baseUrl}/decks/${id}`);
  }

  listDeckConfigs(): Observable<DeckConfig[]> {
    return this.http.get<DeckConfig[]>(`${this.baseUrl}/decks`);
  }

  saveRulesConfig(config: RulesConfig): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/rules`, config);
  }

  getRulesConfig(id: string): Observable<RulesConfig | null> {
    return this.http.get<RulesConfig>(`${this.baseUrl}/rules/${id}`);
  }

  listRulesConfigs(): Observable<RulesConfig[]> {
    return this.http.get<RulesConfig[]>(`${this.baseUrl}/rules`);
  }

  saveBattlefieldConfig(config: BattlefieldConfig): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/battlefields`, config);
  }

  getBattlefieldConfig(id: string): Observable<BattlefieldConfig | null> {
    return this.http.get<BattlefieldConfig>(`${this.baseUrl}/battlefields/${id}`);
  }

  listBattlefieldConfigs(): Observable<BattlefieldConfig[]> {
    return this.http.get<BattlefieldConfig[]>(`${this.baseUrl}/battlefields`);
  }
}
