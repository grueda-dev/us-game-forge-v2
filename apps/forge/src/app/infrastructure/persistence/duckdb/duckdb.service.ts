import { Injectable } from '@angular/core';
import * as duckdb from '@duckdb/duckdb-wasm';

@Injectable({ providedIn: 'root' })
export class DuckDBService {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;
  private _initError: string | null = null;

  get initError(): string | null {
    return this._initError;
  }

  get isReady(): boolean {
    return this.conn !== null;
  }

  async initialize(): Promise<void> {
    try {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      const worker = await duckdb.createWorker(bundle.mainWorker!);

      const logger = new duckdb.ConsoleLogger();
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      this.conn = await this.db.connect();

      await this.runMigrations();
      console.log('DuckDB-WASM initialized successfully');
    } catch (err) {
      console.error('DuckDB-WASM initialization failed:', err);
      this._initError = String(err);
      // Don't rethrow — allow app to render and show error in UI
    }
  }

  async query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (!this.conn) {
      console.warn('DuckDB not initialized, returning empty result for query:', sql);
      return [];
    }
    const result = await this.conn.query(sql);
    return result.toArray().map((row: any) => row.toJSON() as T);
  }

  async execute(sql: string): Promise<void> {
    if (!this.conn) {
      console.warn('DuckDB not initialized, skipping execute:', sql);
      return;
    }
    await this.conn.query(sql);
  }

  private async runMigrations(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS deck_configs (
        id VARCHAR PRIMARY KEY,
        format_version VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        general_definition_id VARCHAR NOT NULL,
        data JSON NOT NULL
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS rules_configs (
        id VARCHAR PRIMARY KEY,
        format_version VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        data JSON NOT NULL
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS battlefield_configs (
        id VARCHAR PRIMARY KEY,
        format_version VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        data JSON NOT NULL
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS battle_definitions (
        id VARCHAR PRIMARY KEY,
        format_version VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        data JSON NOT NULL
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS card_instances (
        instance_id VARCHAR PRIMARY KEY,
        definition_id VARCHAR NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        data JSON NOT NULL
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS hero_instances (
        instance_id VARCHAR PRIMARY KEY,
        definition_id VARCHAR NOT NULL,
        deployments_remaining INTEGER NOT NULL,
        data JSON NOT NULL
      );
    `);
  }
}
