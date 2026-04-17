import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ConfigurationRepositoryPort } from '../../domain/ports/configuration-repository.port';
import { BattleRepositoryPort } from '../../domain/ports/battle-repository.port';
import { CardRepositoryPort } from '../../domain/ports/card-repository.port';
import { LocalConfigurationRepository } from '../../adapters/repositories/local/local-configuration.repository';
import { LocalBattleRepository } from '../../adapters/repositories/local/local-battle.repository';
import { LocalCardRepository } from '../../adapters/repositories/local/local-card.repository';
import { RemoteConfigurationRepository } from '../../adapters/repositories/remote/remote-configuration.repository';
import { RemoteBattleRepository } from '../../adapters/repositories/remote/remote-battle.repository';
import { RemoteCardRepository } from '../../adapters/repositories/remote/remote-card.repository';

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

  return makeEnvironmentProviders([
    provideHttpClient(),
    { provide: ConfigurationRepositoryPort, useClass: RemoteConfigurationRepository },
    { provide: BattleRepositoryPort, useClass: RemoteBattleRepository },
    { provide: CardRepositoryPort, useClass: RemoteCardRepository },
  ]);
}
