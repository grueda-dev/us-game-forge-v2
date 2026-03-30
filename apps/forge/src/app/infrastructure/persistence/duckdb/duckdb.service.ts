import { Injectable } from '@angular/core';
import * as duckdb from '@duckdb/duckdb-wasm';

@Injectable({ providedIn: 'root' })
export class DuckDBService {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;

  async initialize(): Promise<void> {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker = new Worker(
      new URL(bundle.mainWorker!, import.meta.url),
      { type: 'module' },
    );

    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    this.conn = await this.db.connect();

    await this.runMigrations();
  }

  async query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (!this.conn) {
      throw new Error('DuckDB not initialized. Call initialize() first.');
    }
    const result = await this.conn.query(sql);
    return result.toArray().map((row: any) => row.toJSON() as T);
  }

  async execute(sql: string): Promise<void> {
    if (!this.conn) {
      throw new Error('DuckDB not initialized. Call initialize() first.');
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
