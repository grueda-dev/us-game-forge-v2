# Quickstart: Rename Hero → Mercenary

## What Changed

All references to the "hero" card type across the monorepo are renamed to "mercenary". This is a mechanical rename with zero behavioral changes.

## Key Files (by layer)

### Shared Packages (change first — other layers depend on these)

| File | What Changes |
|------|-------------|
| `packages/ts/shared-schema/src/enums/card-type.ts` | `HERO` → `MERCENARY` |
| `packages/ts/shared-schema/src/entities/card.ts` | `HeroCardDefinition` → `MercenaryCardDefinition`, `HeroCardInstance` → `MercenaryCardInstance` |
| `packages/ts/shared-schema/src/entities/configuration.ts` | `DeckHeroEntry` → `DeckMercenaryEntry`, `heroEntries` → `mercenaryEntries` |
| `packages/ts/shared-schema/src/entities/index.ts` | Re-export updated names |
| `packages/ts/shared-domain/src/entities/hero-card.entity.ts` → `mercenary-card.entity.ts` | `HeroCardEntity` → `MercenaryCardEntity` |
| `packages/ts/shared-domain/src/entities/battlefield.entity.ts` | `PlaceableCard` type union |
| `packages/ts/shared-domain/src/rules/power-calculator.ts` | Import + `instanceof` check |
| `packages/ts/shared-domain/src/rules/adjacency-resolver.ts` | Import + `instanceof` check |
| `packages/ts/shared-domain/src/index.ts` | Re-export |
| `packages/ts/shared-domain/src/__tests__/hero-card.entity.test.ts` → `mercenary-card.entity.test.ts` | All hero → mercenary |
| `packages/ts/shared-domain/src/__tests__/power-calculator.test.ts` | Import + variable names |
| `packages/ts/shared-domain/src/__tests__/adjacency-resolver.test.ts` | Import + variable names |
| `packages/ts/shared-domain/src/__tests__/battle-state.test.ts` | Import + variable names |
| `packages/py/forge-core/src/forge_core/domain/entities/enums.py` | `HERO` → `MERCENARY` |
| `packages/py/forge-core/src/forge_core/domain/entities/card.py` | `HeroCardDefinition` → `MercenaryCardDefinition` |
| `packages/py/forge-core/src/forge_core/domain/entities/configuration.py` | `DeckHeroEntry` → `DeckMercenaryEntry`, `hero_entries` → `mercenary_entries` |
| `packages/py/forge-core/src/forge_core/domain/entities/__init__.py` | Re-export |
| `packages/py/forge-core/src/forge_core/domain/ports/card_definition_repository.py` | Method renames |
| `packages/py/forge-core/src/forge_core/adapters/repositories/memory_card_definition_repository.py` | Method + field renames |
| `packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_definition_repository.py` | Method renames |
| `packages/py/forge-core/tests/test_entities.py` | Class + variable renames |

### Frontend Application (change after shared packages)

| File | What Changes |
|------|-------------|
| `apps/forge/src/app/domain/ports/card-repository.port.ts` | Method renames |
| `apps/forge/src/app/adapters/repositories/local/local-card.repository.ts` | Method + table renames |
| `apps/forge/src/app/adapters/repositories/remote/remote-card.repository.ts` | Method + path renames |
| `apps/forge/src/app/application/use-cases/battle/configure-battle.use-case.ts` | Import + usage renames |
| `apps/forge/src/app/ui/deck-builder/deck-builder.component.ts` | `heroEntries` → `mercenaryEntries` |
| `apps/forge/src/app/infrastructure/persistence/duckdb/duckdb.service.ts` | Table name rename |

### Infrastructure & Docs

| File | What Changes |
|------|-------------|
| `packages/py/forge-core/alembic/env.py` | Fix stale imports (remove `CardInstanceTable`, `HeroCardInstanceTable`) |
| `docs/game_design.md` | "Hero Cards" → "Mercenary Cards" throughout |
| `docs/architecture.md` | `HeroCardEntity` → `MercenaryCardEntity` and related references |
| `docs/forge_design.md` | "heroes" → "mercenaries" in card catalogs |

## Verification

```bash
# Python tests
cd packages/py/forge-core && uv run pytest

# TypeScript tests
npx turbo test --filter=@game-forge/shared-domain

# Frontend build
cd apps/forge && ng build

# Backend start
cd apps/forge-api && uv run uvicorn forge_api.main:app

# Global search for remaining "hero" in card-type context
grep -ri "hero" --include="*.py" --include="*.ts" --exclude-dir=node_modules --exclude-dir=alembic
```
