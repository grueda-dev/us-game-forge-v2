# Tasks: SQLModel Backend Persistence

**Input**: Design documents from `specs/001-sqlmodel-persistence/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add SQLModel, Alembic, and async driver dependencies

- [x] T001 Add sqlmodel, alembic, aiosqlite, asyncpg dependencies to packages/py/forge-core/pyproject.toml
- [x] T002 Create database infrastructure module at packages/py/forge-core/src/forge_core/infrastructure/__init__.py
- [x] T003 Implement database engine and async session factory in packages/py/forge-core/src/forge_core/infrastructure/database.py — include DATABASE_URL setting with SQLite default, async engine creation, and async session generator

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: SQLModel table models and Alembic migration setup — MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create SQLModel table models module at packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/__init__.py
- [x] T005 Implement all 7 SQLModel table models (DeckConfigTable, RulesConfigTable, BattlefieldConfigTable, BattleDefinitionTable, CardInstanceTable, HeroCardInstanceTable, TroopCardDefinitionTable) in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/models.py — use JSON columns for entities with nested Pydantic objects, native columns for flat entities per data-model.md
- [x] T006 Initialize Alembic at packages/py/forge-core/ — run `alembic init alembic`, configure alembic.ini with DATABASE_URL env var, update env.py to import SQLModel metadata from models.py
- [x] T007 Generate initial Alembic migration for all 7 tables at packages/py/forge-core/alembic/versions/ — verify it runs against both SQLite and PostgreSQL dialects
- [x] T008 Create pytest conftest with async SQLite session fixture at packages/py/forge-core/tests/conftest.py — use in-memory SQLite (`sqlite+aiosqlite://`), create all tables via metadata, yield async session, teardown

**Checkpoint**: Foundation ready — table models exist, migrations run, test fixtures work

---

## Phase 3: User Story 1 — Save and Retrieve Game Configurations (Priority: P1) 🎯 MVP

**Goal**: Implement SQLModel ConfigurationRepository for deck, rules, and battlefield configs with durable persistence

**Independent Test**: Save a config, create a new session (simulating restart), retrieve it — data matches exactly

### Implementation for User Story 1

- [x] T009 [US1] Implement SqlModelConfigurationRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_configuration_repository.py — implement all 9 methods (save/get/list for decks, rules, battlefields) with upsert semantics using SQLModel merge, map between domain entities and table models via model_dump/model_validate
- [x] T010 [US1] Write integration tests for SqlModelConfigurationRepository in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_configuration_repository.py — test save+retrieve, upsert (save twice with same ID), list multiple, get missing ID returns None, nested data (troop_entries, battlefield slots with terrain modifiers) round-trips without loss
- [x] T011 [US1] Wire SqlModelConfigurationRepository into forge-api DI — update packages/py/forge-core/src/forge_core/adapters/repositories/__init__.py to export the new class, update apps/forge-api/src/forge_api/dependencies.py to provide async session and inject SqlModelConfigurationRepository instead of MemoryConfigurationRepository

**Checkpoint**: Configs survive server restarts. Decks, rules, battlefields all persist durably.

---

## Phase 4: User Story 2 — Save and Retrieve Battle Definitions (Priority: P1)

**Goal**: Implement SQLModel BattleRepository for battle definitions with durable persistence

**Independent Test**: Save a battle definition, create a new session, retrieve it — all reference IDs and end condition intact

### Implementation for User Story 2

- [x] T012 [P] [US2] Implement SqlModelBattleRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_battle_repository.py — implement save_battle, get_battle, list_battles with upsert semantics, map between BattleDefinition and BattleDefinitionTable
- [x] T013 [P] [US2] Write integration tests for SqlModelBattleRepository in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_battle_repository.py — test save+retrieve, upsert, list, get missing returns None, nested BattleEndCondition round-trips correctly
- [x] T014 [US2] Wire SqlModelBattleRepository into forge-api DI — update apps/forge-api/src/forge_api/dependencies.py to inject SqlModelBattleRepository instead of MemoryBattleRepository

**Checkpoint**: Battle definitions persist durably with all referenced config IDs intact.

---

## Phase 5: User Story 3 — Save and Retrieve Card Instances (Priority: P2)

**Goal**: Implement SQLModel CardRepository for card instances, hero instances, and troop definitions

**Independent Test**: Save card and hero instances with specific level/XP/deployment values, create a new session, retrieve — values preserved exactly

### Implementation for User Story 3

- [x] T015 [P] [US3] Implement SqlModelCardRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_repository.py — implement all 5 methods (get_troop_definition, save/get card_instance, save/get hero_instance) with upsert semantics, map between domain entities and table models
- [x] T016 [P] [US3] Write integration tests for SqlModelCardRepository in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_card_repository.py — test troop definition save+retrieve, card instance level/XP preservation, hero instance deployments_remaining preservation, get missing returns None
- [x] T017 [US3] Wire SqlModelCardRepository into forge-api DI — update apps/forge-api/src/forge_api/dependencies.py to inject SqlModelCardRepository instead of MemoryCardRepository

**Checkpoint**: Card progression data persists across sessions.

---

## Phase 6: User Story 4 — Database Portability (Priority: P2)

**Goal**: Verify the same repository code works against both SQLite and PostgreSQL without modification

**Independent Test**: Run the full test suite against both SQLite and PostgreSQL — all tests pass identically

### Implementation for User Story 4

- [x] T018 [US4] Add a pytest marker and fixture for PostgreSQL tests in packages/py/forge-core/tests/conftest.py — use `@pytest.mark.postgres` marker, skip when PostgreSQL is unavailable, configure via TEST_DATABASE_URL env var
- [x] T019 [US4] Parameterize existing repository tests to run against both SQLite and PostgreSQL — ensure all tests from T010, T013, T016 pass on both backends without modification
- [x] T020 [US4] Verify SQLite default behavior — confirm that when DATABASE_URL is not set, the application defaults to `sqlite+aiosqlite:///./forge.db` and all operations work correctly
- [x] T021 [US4] Update apps/forge-api/src/forge_api/main.py to add database lifecycle management — create engine on startup, dispose on shutdown, run via lifespan context manager

**Checkpoint**: Switching databases requires only changing DATABASE_URL. No code changes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, cleanup

- [x] T022 [P] Update packages/py/forge-core/src/forge_core/adapters/repositories/__init__.py to export all SQLModel repository classes alongside existing memory implementations
- [x] T023 [P] Update specs/001-sqlmodel-persistence/quickstart.md to reflect final file paths and verified commands
- [x] T024 Run full test suite (`uv run pytest tests/ -v`) and verify all tests pass in packages/py/forge-core/
- [x] T025 Run `alembic upgrade head` against a fresh SQLite file and verify all tables are created correctly
- [x] T026 End-to-end verification: start forge-api with SQLModel repos, save configs via API, restart server, retrieve configs — confirm data survives restart

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on US1, US2, US3 (needs existing tests to parameterize)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2
- **US2 (P1)**: Independent after Phase 2 — can run in parallel with US1
- **US3 (P2)**: Independent after Phase 2 — can run in parallel with US1/US2
- **US4 (P2)**: Depends on US1+US2+US3 tests existing

### Parallel Opportunities

- T012 and T013 (US2 repo + tests) can run in parallel
- T015 and T016 (US3 repo + tests) can run in parallel
- T012/T013 can run in parallel with T009/T010 (US2 parallel with US1)
- T015/T016 can run in parallel with T009/T010 (US3 parallel with US1)
- T022 and T023 (polish) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008)
3. Complete Phase 3: User Story 1 (T009–T011)
4. **STOP and VALIDATE**: Save configs via API, restart, retrieve
5. Deploy if ready — configs now survive restarts

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Configs persist → MVP!
3. Add US2 → Battles persist
4. Add US3 → Card instances persist
5. Add US4 → Database portability verified
6. Polish → Final integration and docs

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
