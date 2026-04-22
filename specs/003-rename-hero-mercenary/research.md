# Research: Rename Hero → Mercenary

**Date**: 2026-04-22

## Decision 1: Enum Value String Representation

**Decision**: Change the `CardType` enum value from `HERO = "HERO"` to `MERCENARY = "MERCENARY"` in both Python (`StrEnum`) and TypeScript (`enum`).

**Rationale**: The enum string value is the serialized representation stored in JSON configurations, database columns, and API payloads. It must match the new name to maintain domain consistency.

**Alternatives considered**:
- Keep `HERO = "HERO"` and only rename classes → Rejected because it creates a confusing disconnect between the enum value and the class names.
- Add `MERCENARY` as alias and keep `HERO` → Rejected because dual values create ambiguity in serialization and break the single-source-of-truth principle.

---

## Decision 2: Data Migration Strategy for Persisted `HERO` Values

**Decision**: This rename affects the `card_type` field stored in `OwnedCard` entities within `PlayerState` JSON blobs and the `card_type` column in `TroopCardDefinitionTable` (which currently only stores troop-type values, but the pattern applies). No Alembic migration is needed because:

1. `PlayerState` stores `OwnedCard` data as JSON inside the `data` column — the Python `StrEnum` value is serialized as the string `"HERO"`. After the rename, new records will serialize as `"MERCENARY"`.
2. There is no production database or saved JSON files to preserve — this is an early-stage development project. No real user data exists.
3. No backward-compatibility aliases or validators will be added. This is a clean break.

**Rationale**: No data to migrate, no aliases to maintain. Clean code over backward compatibility.

**Alternatives considered**:
- Add a backward-compatible alias in `CardType` → Rejected; unnecessary complexity with no production data to preserve.

---

## Decision 3: Alembic Migration Files — Immutable

**Decision**: Existing Alembic migration files (e.g., `3e0b26118647_initial_schema_7_tables.py`) that reference `hero_card_instances` table MUST NOT be modified. These are historical records of past schema changes.

**Rationale**: Modifying migration files would invalidate the migration history chain. The `hero_card_instances` table was already dropped in a subsequent migration (spec 002), so no runtime impact exists.

---

## Decision 4: File Rename Strategy for TypeScript

**Decision**: Use git-aware file rename (`git mv`) for `hero-card.entity.ts` → `mercenary-card.entity.ts` and `hero-card.entity.test.ts` → `mercenary-card.entity.test.ts` to preserve git history.

**Rationale**: Git tracks file renames when the content similarity is high enough. Since we're changing class names inside the files too, doing the rename in a separate commit before content changes would maximize history tracking — but for a development project this level of git archaeology is unnecessary. A single commit is fine.

---

## Decision 5: DuckDB-WASM Table Rename (`hero_instances`)

**Decision**: Rename the DuckDB in-browser table from `hero_instances` to `mercenary_instances` in `duckdb.service.ts`.

**Rationale**: DuckDB-WASM tables are created on-the-fly at app startup via `CREATE TABLE IF NOT EXISTS`. There is no persistent storage to migrate — the tables are recreated each session. Renaming is a straightforward string change.

---

## Decision 6: `alembic/env.py` Stale Import

**Decision**: The `alembic/env.py` file imports `CardInstanceTable` and `HeroCardInstanceTable` from `models.py`, but these classes no longer exist in `models.py` (they were removed in spec 002). This is a pre-existing bug. This rename spec will **fix** this stale import as part of the cleanup — removing `CardInstanceTable` and `HeroCardInstanceTable` from the import list since they don't exist.

**Rationale**: The import would cause a runtime `ImportError` if Alembic were invoked. Fixing it now is a natural part of the cleanup.
