import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DuckDBService } from './infrastructure/persistence/duckdb/duckdb.service';
import { providePersistenceStrategy } from './infrastructure/providers/persistence-strategy.provider';

function initializeDuckDB(duckdb: DuckDBService) {
  return () => duckdb.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePersistenceStrategy('local'),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDuckDB,
      deps: [DuckDBService],
      multi: true,
    },
  ]
};
