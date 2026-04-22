# Tasks: Player State Domain Model

**Input**: Design documents from `/specs/002-player-state/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/repository-contracts.md, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no new dependencies required, only new files and cleanup

- [x] T001 Verify .gitignore contains Python patterns (__pycache__/, *.pyc, .venv/, dist/, *.egg-info/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain entities and ports that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create Player and PlayerState domain entities in packages/py/forge-core/src/forge_core/domain/entities/player_state.py (Player, PlayerState, OwnedCard, CardCollection, Wallet)
- [x] T003 [P] Remove CardInstance and HeroCardInstance from packages/py/forge-core/src/forge_core/domain/entities/card.py — only definition classes remain
- [x] T004 Update entity exports in packages/py/forge-core/src/forge_core/domain/entities/__init__.py (remove CardInstance/HeroCardInstance, add Player/PlayerState/OwnedCard/CardCollection/Wallet)
- [x] T005 [P] Create PlayerRepository port in packages/py/forge-core/src/forge_core/domain/ports/player_repository.py
- [x] T006 [P] Create CardDefinitionRepository port in packages/py/forge-core/src/forge_core/domain/ports/card_definition_repository.py
- [x] T007 [P] Create PlayerStateRepository port in packages/py/forge-core/src/forge_core/domain/ports/player_state_repository.py
- [x] T008 Remove old CardRepository port file packages/py/forge-core/src/forge_core/domain/ports/card_repository.py
- [x] T009 Update port exports in packages/py/forge-core/src/forge_core/domain/ports/__init__.py (remove CardRepository, add PlayerRepository/CardDefinitionRepository/PlayerStateRepository)

**Checkpoint**: All domain entities and port interfaces defined ✅

---

## Phase 3: User Story 1 — Define Player and Player State Entities in Domain (Priority: P1) 🎯 MVP

**Goal**: Player and PlayerState entities exist and pass unit tests with full serialization round-trip fidelity

**Independent Test**: Instantiate Player, PlayerState with OwnedCards, verify JSON round-trip, verify defaults

### Implementation for User Story 1

- [x] T010 [US1] Add Player and PlayerState entity tests in packages/py/forge-core/tests/test_entities.py (replace TestCardInstance/TestHeroCardInstance with TestPlayer, TestPlayerState, TestOwnedCard, TestCardCollection, TestWallet)
- [x] T011 [US1] Run entity tests and verify they pass: `cd packages/py/forge-core && uv run pytest tests/test_entities.py -v`

**Checkpoint**: Player, PlayerState, OwnedCard are fully testable domain entities with JSON round-trip fidelity ✅

---

## Phase 4: User Story 2 — Separate Card Definitions from Card Instances (Priority: P1)

**Goal**: CardDefinitionRepository port replaces old CardRepository. In-memory adapters working.

**Independent Test**: Verify CardDefinitionRepository only exposes read operations, memory adapter passes tests

### Implementation for User Story 2

- [x] T012 [P] [US2] Create MemoryCardDefinitionRepository in packages/py/forge-core/src/forge_core/adapters/repositories/memory_card_definition_repository.py
- [x] T013 [P] [US2] Create MemoryPlayerRepository in packages/py/forge-core/src/forge_core/adapters/repositories/memory_player_repository.py
- [x] T014 [P] [US2] Create MemoryPlayerStateRepository in packages/py/forge-core/src/forge_core/adapters/repositories/memory_player_state_repository.py
- [x] T015 [US2] Remove old memory_card_repository.py adapter from packages/py/forge-core/src/forge_core/adapters/repositories/memory_card_repository.py
- [x] T016 [US2] Update adapter exports in packages/py/forge-core/src/forge_core/adapters/repositories/__init__.py (remove MemoryCardRepository/SqlModelCardRepository, add new adapters)

**Checkpoint**: All in-memory adapters functional ✅

---

## Phase 5: User Story 3 — Persist and Retrieve Versioned Player State (Priority: P2)

**Goal**: SQLModel implementations and Alembic migration. Versioned persistence working end-to-end.

**Independent Test**: Save PlayerState multiple times, retrieve specific versions, verify immutability

### Implementation for User Story 3

- [x] T017 [US3] Add PlayerTable and PlayerStateTable to packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/models.py (remove CardInstanceTable/HeroCardInstanceTable)
- [x] T018 [P] [US3] Create SqlModelCardDefinitionRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_definition_repository.py
- [x] T019 [P] [US3] Create SqlModelPlayerRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_player_repository.py
- [x] T020 [P] [US3] Create SqlModelPlayerStateRepository in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_player_state_repository.py
- [x] T021 [US3] Remove old sqlmodel_card_repository.py from packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_repository.py
- [x] T022 [US3] Update sqlmodel adapter exports in packages/py/forge-core/src/forge_core/adapters/repositories/sqlmodel/__init__.py
- [x] T023 [US3] Update conftest.py table model imports in packages/py/forge-core/tests/conftest.py (replace CardInstanceTable/HeroCardInstanceTable with PlayerTable/PlayerStateTable)
- [x] T024 [P] [US3] Create SqlModel card definition repository tests in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_card_definition_repository.py
- [x] T025 [P] [US3] Create SqlModel player repository tests in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_player_repository.py
- [x] T026 [P] [US3] Create SqlModel player state repository tests in packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_player_state_repository.py
- [x] T027 [US3] Remove old card repository tests from packages/py/forge-core/tests/adapters/repositories/sqlmodel/test_sqlmodel_card_repository.py
- [x] T028 [US3] Update forge-api dependencies in apps/forge-api/src/forge_api/dependencies.py (replace CardRepository with CardDefinitionRepository, add PlayerRepository/PlayerStateRepository)

**Checkpoint**: Full persistence layer working ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, linting, type checks

- [x] T029 Run full test suite: `cd packages/py/forge-core && uv run pytest tests/ -v`
- [x] T030 Run linting: `cd packages/py/forge-core && uv run ruff check src/ tests/`
- [x] T031 Run type checking: `cd packages/py/forge-core && uv run mypy src/`
- [x] T032 Verify no domain imports of SQLModel/FastAPI: `grep -r "from sqlmodel\|from fastapi" packages/py/forge-core/src/forge_core/domain/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (entities must exist first)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (ports must exist first)
- **User Story 3 (Phase 5)**: Depends on Phases 3+4 (needs entities + ports)
- **Polish (Phase 6)**: Depends on all phases complete

### Within Each User Story

- Models before services
- Ports before adapters
- Core implementation before integration
- Story complete before moving to next

### Parallel Opportunities

- T002/T003 can run in parallel (different files)
- T005/T006/T007 can run in parallel (different port files)
- T012/T013/T014 can run in parallel (different adapter files)
- T018/T019/T020 can run in parallel (different sqlmodel files)
- T024/T025/T026 can run in parallel (different test files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (entities + ports)
3. Complete Phase 3: User Story 1 (entity tests)
4. **STOP and VALIDATE**: Test entities independently

### Incremental Delivery

1. Setup + Foundational → Domain model defined
2. User Story 1 → Entities tested → MVP!
3. User Story 2 → In-memory adapters → Functional layer
4. User Story 3 → SQLModel + tests → Full persistence
5. Polish → Linting, type checks, final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Spec IV mandates TDD — tests written alongside implementation
- Constitution I: No SQLModel/FastAPI imports in domain/
- Constitution II: Every port gets both memory + SQLModel adapter
