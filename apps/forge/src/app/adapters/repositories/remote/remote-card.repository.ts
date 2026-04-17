import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CardInstance, HeroCardInstance } from '@game-forge/shared-schema';
import { CardRepositoryPort } from '../../../domain/ports/card-repository.port';
import { environment } from '../../../../environments/environment';

@Injectable()
export class RemoteCardRepository extends CardRepositoryPort {
  private baseUrl = `${environment.apiUrl}/api/v1/cards`;

  constructor(private http: HttpClient) {
    super();
  }

  saveCardInstance(instance: CardInstance): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/instances`, instance);
  }

  getCardInstance(instanceId: string): Observable<CardInstance | null> {
    return this.http.get<CardInstance>(`${this.baseUrl}/instances/${instanceId}`);
  }

  saveHeroInstance(instance: HeroCardInstance): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/heroes`, instance);
  }

  getHeroInstance(instanceId: string): Observable<HeroCardInstance | null> {
    return this.http.get<HeroCardInstance>(`${this.baseUrl}/heroes/${instanceId}`);
  }
}
