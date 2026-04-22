# Data Model: Rename Hero → Mercenary

**Date**: 2026-04-22

This document captures the entity rename mapping. No structural or behavioral changes to any entity — only name changes.

## Enum Changes

### CardType (Python — `packages/py/forge-core/src/forge_core/domain/entities/enums.py`)

| Before | After |
|--------|-------|
| `HERO = "HERO"` | `MERCENARY = "MERCENARY"` |

### CardType (TypeScript — `packages/ts/shared-schema/src/enums/card-type.ts`)

| Before | After |
|--------|-------|
| `HERO = 'HERO'` | `MERCENARY = 'MERCENARY'` |

---

## Entity Renames

### Python — `packages/py/forge-core/`

| Before | After | File |
|--------|-------|------|
| `HeroCardDefinition` | `MercenaryCardDefinition` | `domain/entities/card.py` |
| `CardType.HERO` default on `HeroCardDefinition` | `CardType.MERCENARY` default on `MercenaryCardDefinition` | `domain/entities/card.py` |
| `DeckHeroEntry` | `DeckMercenaryEntry` | `domain/entities/configuration.py` |
| `hero_entries: list[DeckHeroEntry]` | `mercenary_entries: list[DeckMercenaryEntry]` | `domain/entities/configuration.py` |

### TypeScript — `packages/ts/shared-schema/`

| Before | After | File |
|--------|-------|------|
| `HeroCardDefinition` | `MercenaryCardDefinition` | `entities/card.ts` |
| `HeroCardInstance` | `MercenaryCardInstance` | `entities/card.ts` |
| `DeckHeroEntry` | `DeckMercenaryEntry` | `entities/configuration.ts` |
| `heroEntries: DeckHeroEntry[]` | `mercenaryEntries: DeckMercenaryEntry[]` | `entities/configuration.ts` |

### TypeScript — `packages/ts/shared-domain/`

| Before | After | File |
|--------|-------|------|
| `HeroCardEntity` (class) | `MercenaryCardEntity` (class) | `entities/hero-card.entity.ts` → `entities/mercenary-card.entity.ts` |
| `PlaceableCard = TroopCardEntity \| HeroCardEntity` | `PlaceableCard = TroopCardEntity \| MercenaryCardEntity` | `entities/battlefield.entity.ts` |

---

## Port & Adapter Renames

### Python — Card Definition Repository Port

| Before | After | File |
|--------|-------|------|
| `get_hero_definition()` | `get_mercenary_definition()` | `domain/ports/card_definition_repository.py` |
| `list_hero_definitions()` | `list_mercenary_definitions()` | `domain/ports/card_definition_repository.py` |

### Python — Memory Card Definition Repository

| Before | After | File |
|--------|-------|------|
| `_hero_defs` | `_mercenary_defs` | `adapters/repositories/memory_card_definition_repository.py` |
| `save_hero_definition()` | `save_mercenary_definition()` | Same |
| `get_hero_definition()` | `get_mercenary_definition()` | Same |
| `list_hero_definitions()` | `list_mercenary_definitions()` | Same |

### Python — SQLModel Card Definition Repository

| Before | After | File |
|--------|-------|------|
| `get_hero_definition()` | `get_mercenary_definition()` | `adapters/repositories/sqlmodel/sqlmodel_card_definition_repository.py` |
| `list_hero_definitions()` | `list_mercenary_definitions()` | Same |

### TypeScript — Frontend Card Repository Port

| Before | After | File |
|--------|-------|------|
| `saveHeroInstance()` | `saveMercenaryInstance()` | `apps/forge/src/app/domain/ports/card-repository.port.ts` |
| `getHeroInstance()` | `getMercenaryInstance()` | Same |

### TypeScript — Frontend Local Card Repository

| Before | After | File |
|--------|-------|------|
| `saveHeroInstance()` | `saveMercenaryInstance()` | `apps/forge/src/app/adapters/repositories/local/local-card.repository.ts` |
| `getHeroInstance()` | `getMercenaryInstance()` | Same |
| `hero_instances` (DuckDB table ref) | `mercenary_instances` (DuckDB table ref) | Same |

### TypeScript — Frontend Remote Card Repository

| Before | After | File |
|--------|-------|------|
| `saveHeroInstance()` | `saveMercenaryInstance()` | `apps/forge/src/app/adapters/repositories/remote/remote-card.repository.ts` |
| `getHeroInstance()` | `getMercenaryInstance()` | Same |
| `/heroes` (API path) | `/mercenaries` (API path) | Same |

---

## Infrastructure Changes

### DuckDB-WASM Service

| Before | After | File |
|--------|-------|------|
| `hero_instances` (CREATE TABLE) | `mercenary_instances` (CREATE TABLE) | `apps/forge/src/app/infrastructure/persistence/duckdb/duckdb.service.ts` |

### Alembic Environment (Bug Fix)

| Before | After | File |
|--------|-------|------|
| `CardInstanceTable, HeroCardInstanceTable` (stale imports) | Remove these imports | `packages/py/forge-core/alembic/env.py` |

---

## No Changes Required

- `OwnedCard` in `player_state.py` — uses `card_type: CardType` field; the value changes automatically when the enum changes.
- `PlayerTable`, `PlayerStateTable` in `models.py` — no hero references.
- Alembic migration files — immutable historical records.
- `__init__.py` for SQLModel adapters — no hero references (those table classes were already removed).
