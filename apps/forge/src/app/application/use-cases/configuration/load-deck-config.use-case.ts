import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { DeckConfig } from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../../domain/ports/configuration-repository.port';

@Injectable({ providedIn: 'root' })
export class LoadDeckConfigUseCase {
  execute(configRepo: ConfigurationRepositoryPort, id: string): Observable<DeckConfig | null> {
    return configRepo.getDeckConfig(id);
  }
}

@Injectable({ providedIn: 'root' })
export class ListDeckConfigsUseCase {
  constructor(private configRepo: ConfigurationRepositoryPort) {}

  execute(): Observable<DeckConfig[]> {
    return this.configRepo.listDeckConfigs();
  }
}
