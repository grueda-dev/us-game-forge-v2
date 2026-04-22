# Tasks: Rename Hero Cards to Mercenary Cards

**Input**: Design documents from `specs/003-rename-hero-mercenary/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new test tasks — existing tests are updated in-place as part of the rename.

**Organization**: Tasks grouped by user story. US1 (domain vocabulary) must complete before US2 (docs) and US3 (frontend) since shared packages are upstream dependencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: File renames that must happen before content edits (git mv)

- [X] T001 Rename packages/ts/shared-domain/src/entities/hero-card.entity.ts → mercenary-card.entity.ts via `git mv`
- [X] T002 Rename packages/ts/shared-domain/src/__tests__/hero-card.entity.test.ts → mercenary-card.entity.test.ts via `git mv`

---

## Phase 2: Foundational (Shared Enums)

**Purpose**: Enum value changes that ALL downstream files depend on — MUST complete before any user story phase

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Rename `HERO = "HERO"` to `MERCENARY = "MERCENARY"` in packages/ts/shared-schema/src/enums/card-type.ts
- [X] T004 [P] Rename `HERO = "HERO"` to `MERCENARY = "MERCENARY"` in packages/py/forge-core/src/forge_core/domain/entities/enums.py

**Checkpoint**: Enum values updated in both languages — all downstream renames can now proceed

---

## Phase 3: User Story 1 — Consistent Domain Vocabulary (Priority: P1) 🎯 MVP

**Goal**: Rename all hero references to mercenary across domain entities, ports, adapters, and tests in shared packages and Python backend

**Independent Test**: Run `uv run pytest` in `packages/py/forge-core/` and `npx turbo test --filter=@game-forge/shared-domain` — all tests must pass with zero "hero" references in card-type context

### TypeScript shared-schema entities

- [X] T005 [P] [US1] Rename `HeroCardDefinition` → `MercenaryCardDefinition`, `HeroCardInstance` → `MercenaryCardInstance`, and update comments/JSDoc in packages/ts/shared-schema/src/entities/card.ts
- [X] T006 [P] [US1] Rename `DeckHeroEntry` → `DeckMercenaryEntry` and `heroEntries` → `mercenaryEntries` in packages/ts/shared-schema/src/entities/configuration.ts
- [X] T007 [US1] Update re-exports: `HeroCardDefinition` → `MercenaryCardDefinition`, `HeroCardInstance` → `MercenaryCardInstance`, `DeckHeroEntry` → `DeckMercenaryEntry` in packages/ts/shared-schema/src/entities/index.ts

### TypeScript shared-domain entities & rules

- [X] T008 [US1] Rename class `HeroCardEntity` → `MercenaryCardEntity`, update `CardType.HERO` → `CardType.MERCENARY`, and update error message string in packages/ts/shared-domain/src/entities/mercenary-card.entity.ts (already renamed in T001)
- [X] T009 [US1] Update import `HeroCardEntity` → `MercenaryCardEntity` from `./mercenary-card.entity` and `PlaceableCard` type union in packages/ts/shared-domain/src/entities/battlefield.entity.ts
- [X] T010 [P] [US1] Update import and `instanceof HeroCardEntity` → `instanceof MercenaryCardEntity` in packages/ts/shared-domain/src/rules/power-calculator.ts
- [X] T011 [P] [US1] Update import and `instanceof HeroCardEntity` → `instanceof MercenaryCardEntity` in packages/ts/shared-domain/src/rules/adjacency-resolver.ts
- [X] T012 [US1] Update re-export `HeroCardEntity` → `MercenaryCardEntity` from `./entities/mercenary-card.entity` in packages/ts/shared-domain/src/index.ts

### TypeScript shared-domain tests

- [X] T013 [P] [US1] Rename all `HeroCardEntity` → `MercenaryCardEntity` references, `createHero` → `createMercenary`, variable names, and test descriptions in packages/ts/shared-domain/src/__tests__/mercenary-card.entity.test.ts (already renamed in T002)
- [X] T014 [P] [US1] Update import and variable names (`hero` → `mercenary`) in packages/ts/shared-domain/src/__tests__/power-calculator.test.ts
- [X] T015 [P] [US1] Update import and variable names (`hero` → `mercenary`) in packages/ts/shared-domain/src/__tests__/adjacency-resolver.test.ts
- [X] T016 [P] [US1] Update import and variable names (`hero` → `mercenary`, `HeroCardEntity` → `MercenaryCardEntity`) in packages/ts/shared-domain/src/__tests__/battle-state.test.ts

### Python domain entities

- [X] T017 [P] [US1] Rename `HeroCardDefinition` → `MercenaryCardDefinition` and `CardType.HERO` → `CardType.MERCENARY` default in packages/py/forge-core/src/forge_core/domain/entities/card.py
- [X] T018 [P] [US1] Rename `DeckHeroEntry` → `DeckMercenaryEntry` and `hero_entries` → `mercenary_entries` in packages/py/forge-core/src/forge_core/domain/entities/configuration.py
- [X] T019 [US1] Update comment referencing "hero" in `OwnedCard` docstring in packages/py/forge-core/src/forge_core/domain/entities/player_state.py
- [X] T020 [US1] Update imports and `__all__` exports: `HeroCardDefinition` → `MercenaryCardDefinition` in packages/py/forge-core/src/forge_core/domain/entities/__init__.py

### Python domain ports

- [X] T021 [US1] Rename `get_hero_definition` → `get_mercenary_definition` and `list_hero_definitions` → `list_mercenary_definitions`, update `HeroCardDefinition` → `MercenaryCardDefinition` import in packages/py/forge-core/src/forge_core/domain/ports/card_definition_repository.py

### Python adapters

- [X] T022 [P] [US1] Rename all hero → mercenary methods, fields (`_hero_defs` → `_mercenary_defs`), and imports in packages/py/forge-core/src/forge_core/adapters/repositories/memory_card_definition_repository.py
- [X] T023 [P] [US1] Rename all hero → mercenary methods, comments, and imports in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_definition_repository.py

### Python infrastructure fix

- [X] T024 [US1] Fix stale imports in packages/py/forge-core/alembic/env.py — remove `CardInstanceTable` and `HeroCardInstanceTable` from the import list (these classes no longer exist in models.py)

### Python tests

- [X] T025 [US1] Rename `TestHeroCardDefinition` → `TestMercenaryCardDefinition`, update `HeroCardDefinition` → `MercenaryCardDefinition` import, all `CardType.HERO` → `CardType.MERCENARY` references, `DeckHeroEntry` → `DeckMercenaryEntry`, and `hero_entries` → `mercenary_entries` in packages/py/forge-core/tests/test_entities.py

**Checkpoint**: All shared packages and Python backend use "mercenary" consistently. Run `uv run pytest` and `npx turbo test --filter=@game-forge/shared-domain` to verify.

---

## Phase 4: User Story 2 — Updated Documentation (Priority: P2)

**Goal**: Replace all "hero" card-type references with "mercenary" in project documentation

**Independent Test**: Search `docs/` for "hero" in card-type context — zero results expected

- [X] T026 [P] [US2] Replace "Hero Cards" → "Mercenary Cards", "heroes" → "mercenaries", "hero" → "mercenary" in card-type context throughout docs/game_design.md
- [X] T027 [P] [US2] Replace `HeroCardEntity` → `MercenaryCardEntity` and "heroes" → "mercenaries" in docs/architecture.md
- [X] T028 [P] [US2] Replace "heroes" → "mercenaries" and "hero" → "mercenary" in card catalog/deck config references in docs/forge_design.md

**Checkpoint**: All documentation uses "mercenary" consistently

---

## Phase 5: User Story 3 — Frontend Alignment (Priority: P2)

**Goal**: Update the Angular frontend to use renamed shared-package exports and rename local hero methods/tables

**Independent Test**: Run `ng build` in `apps/forge/` — must compile without errors

- [X] T029 [US3] Rename `saveHeroInstance` → `saveMercenaryInstance` and `getHeroInstance` → `getMercenaryInstance`, update `HeroCardInstance` → `MercenaryCardInstance` import in apps/forge/src/app/domain/ports/card-repository.port.ts
- [X] T030 [P] [US3] Rename hero → mercenary methods, update `HeroCardInstance` → `MercenaryCardInstance` import, rename DuckDB table reference `hero_instances` → `mercenary_instances` in apps/forge/src/app/adapters/repositories/local/local-card.repository.ts
- [X] T031 [P] [US3] Rename hero → mercenary methods, update `HeroCardInstance` → `MercenaryCardInstance` import, rename API path `/heroes` → `/mercenaries` in apps/forge/src/app/adapters/repositories/remote/remote-card.repository.ts
- [X] T032 [US3] Update `HeroCardEntity` → `MercenaryCardEntity` import, `heroEntries` → `mercenaryEntries` loop in apps/forge/src/app/application/use-cases/battle/configure-battle.use-case.ts
- [X] T033 [US3] Update `heroEntries: []` → `mercenaryEntries: []` in apps/forge/src/app/ui/deck-builder/deck-builder.component.ts
- [X] T034 [US3] Rename DuckDB `CREATE TABLE` from `hero_instances` → `mercenary_instances` in apps/forge/src/app/infrastructure/persistence/duckdb/duckdb.service.ts

**Checkpoint**: Frontend compiles and serves. Run `ng build` and verify.

---

## Phase 6: Polish & Verification

**Purpose**: Final validation across the entire monorepo

- [X] T035 Run global search for remaining "hero" references in card-type context across all `.py`, `.ts`, `.html`, `.scss` files (excluding `node_modules/`, `alembic/versions/`, and changelogs) — fix any stragglers
- [X] T036 Run full Python test suite: `cd packages/py/forge-core && uv run pytest`
- [X] T037 Run full TypeScript test suite: `npx turbo test --filter=@game-forge/shared-domain`
- [X] T038 Verify Angular frontend builds: `cd apps/forge && ng build`
- [X] T039 Verify FastAPI backend starts: `cd apps/forge-api && uv run uvicorn forge_api.main:app`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — git mv file renames first
- **Foundational (Phase 2)**: Depends on Phase 1 — enum changes BLOCK all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — shared packages + Python backend
- **US2 (Phase 4)**: Depends on Phase 2 only — can run in parallel with US1 and US3
- **US3 (Phase 5)**: Depends on Phase 3 (US1) — frontend imports shared-schema and shared-domain exports
- **Polish (Phase 6)**: Depends on Phases 3, 4, 5 complete

### User Story Dependencies

- **US1 (P1)**: BLOCKS US3 — shared packages must be renamed before frontend can import them
- **US2 (P2)**: Independent — documentation can be updated any time after enums change
- **US3 (P2)**: Depends on US1 — frontend consumes shared-package exports

### Parallel Opportunities

- T001 + T002 (git renames) — parallel
- T003 + T004 (enum changes) — parallel (different languages)
- T005 + T006 (schema entities) — parallel (different files)
- T010 + T011 (rules) — parallel
- T013 + T014 + T015 + T016 (TS tests) — parallel
- T017 + T018 (Python entities) — parallel
- T022 + T023 (Python adapters) — parallel
- T026 + T027 + T028 (docs) — fully parallel
- T030 + T031 (frontend adapters) — parallel
- T036 + T037 + T038 + T039 (verification) — parallel

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: File renames
2. Complete Phase 2: Enum values
3. Complete Phase 3: US1 — all shared packages + Python backend
4. **STOP and VALIDATE**: Run all tests
5. Proceed to US2 + US3

### Sequential Execution (Single Developer)

1. Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) + Phase 5 (US3) → Phase 6
2. Total: 39 tasks, estimated ~30 minutes for experienced developer (mechanical rename)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a mechanical rename — no behavioral logic changes
- Existing Alembic migration files are NOT touched (historical records)
- No backward-compatibility aliases — clean break per user directive
- Commit after each phase checkpoint for clean git history
