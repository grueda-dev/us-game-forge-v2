import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ConfigurationRepositoryPort } from '../../domain/ports/configuration-repository.port';
import { BattleRepositoryPort } from '../../domain/ports/battle-repository.port';
import { CardRepositoryPort } from '../../domain/ports/card-repository.port';
import { LocalConfigurationRepository } from '../../adapters/repositories/local/local-configuration.repository';
import { LocalBattleRepository } from '../../adapters/repositories/local/local-battle.repository';
import { LocalCardRepository } from '../../adapters/repositories/local/local-card.repository';

export type PersistenceStrategy = 'remote' | 'local';

export function providePersistenceStrategy(
  strategy: PersistenceStrategy,
): EnvironmentProviders {
  if (strategy === 'local') {
    return makeEnvironmentProviders([
      { provide: ConfigurationRepositoryPort, useClass: LocalConfigurationRepository },
      { provide: BattleRepositoryPort, useClass: LocalBattleRepository },
      { provide: CardRepositoryPort, useClass: LocalCardRepository },
    ]);
  }

  // Remote providers will be added in Milestone 5
  throw new Error(`Persistence strategy "${strategy}" is not yet implemented`);
}
