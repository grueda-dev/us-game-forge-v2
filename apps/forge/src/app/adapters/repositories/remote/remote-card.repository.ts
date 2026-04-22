import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CardInstance, MercenaryCardInstance } from '@game-forge/shared-schema';
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

  saveMercenaryInstance(instance: MercenaryCardInstance): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mercenaries`, instance);
  }

  getMercenaryInstance(instanceId: string): Observable<MercenaryCardInstance | null> {
    return this.http.get<MercenaryCardInstance>(`${this.baseUrl}/mercenaries/${instanceId}`);
  }
}
