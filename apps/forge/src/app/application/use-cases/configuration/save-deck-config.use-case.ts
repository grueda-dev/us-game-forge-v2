import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { DeckConfig } from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../../domain/ports/configuration-repository.port';

@Injectable({ providedIn: 'root' })
export class SaveDeckConfigUseCase {
  constructor(private configRepo: ConfigurationRepositoryPort) {}

  execute(config: DeckConfig): Observable<void> {
    return this.configRepo.saveDeckConfig(config);
  }
}
