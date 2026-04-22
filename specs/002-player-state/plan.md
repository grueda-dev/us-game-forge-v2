# Implementation Plan: Player State Domain Model

**Branch**: `002-player-state` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-player-state/spec.md`

## Summary

Introduce a `PlayerState` aggregate entity with snapshot versioning to
cleanly separate play-time state (owned cards, currency, progression)
from design-time configurations (card definitions, deck configs, rules).
Rework the existing `CardInstance` / `HeroCardInstance` into a unified
`OwnedCard` entity within the state model. Split the current
`CardRepository` port into `CardDefinitionRepository` (design-time reads)
and `PlayerStateRepository` (append-only versioned CRUD). Provide both
in-memory and SQLModel implementations for all new ports.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: Pydantic 2.x, SQLModel, SQLAlchemy (async), Alembic, aiosqlite, asyncpg
**Storage**: SQLite (development), PostgreSQL (production) — JSON column for state snapshots
**Testing**: pytest + pytest-asyncio, tests against in-memory SQLite
**Target Platform**: Linux/Windows server, local development
**Project Type**: Library (forge-core) + web-service (forge-api)
**Performance Goals**: Save/load < 100ms
**Constraints**: Must preserve existing async port contracts; domain layer must have zero framework imports
**Scale/Scope**: Single-digit concurrent designers; ~100s of configs + player states

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Clean Architecture | ✅ PASS | New domain entities (`Player`, `PlayerState`, `OwnedCard`, etc.) live in `domain/entities/`. New ports live in `domain/ports/`. SQLModel table models stay in `adapters/repositories/sqlmodel/`. No framework imports in domain layer. |
| II. Dual Persistence | ✅ PASS | New `PlayerRepository`, `PlayerStateRepository`, and `CardDefinitionRepository` ports get both in-memory and SQLModel implementations. Port abstraction preserved. |
| III. Shared Domain | ✅ PASS | All state entities live in `forge_core.domain.entities`. No duplication across packages. |
| IV. Test-Driven Development | ✅ PASS | Entity unit tests, repository contract tests for both in-memory and SQLModel. All tests written alongside implementation. |
| V. Configuration-Driven Design | ✅ PASS | This feature explicitly separates player state from configurations. Configurations remain configuration-driven; state is a new distinct concept. |

**Post-Phase 1 re-check**: All gates still pass. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/002-player-state/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Entity and table model definitions
├── quickstart.md        # Setup and verification guide
├── contracts/           # Repository port contracts
│   └── repository-contracts.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Task list (created by /speckit.tasks)
```

### Source Code (repository root)

```text
packages/py/forge-core/
├── src/forge_core/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── card.py                      # MODIFIED — remove CardInstance, HeroCardInstance
│   │   │   ├── player_state.py              # NEW — Player, PlayerState, OwnedCard, CardCollection, Wallet
│   │   │   └── __init__.py                  # MODIFIED — update exports
│   │   └── ports/
│   │       ├── card_repository.py           # REMOVED
│   │       ├── card_definition_repository.py  # NEW — read-only card def lookups
│   │       ├── player_repository.py         # NEW — Player CRUD
│   │       ├── player_state_repository.py   # NEW — append-only versioned state
│   │       └── __init__.py                  # MODIFIED — update exports
│   ├── adapters/
│   │   └── repositories/
│   │       ├── memory_card_repository.py          # REMOVED
│   │       ├── memory_card_definition_repository.py  # NEW
│   │       ├── memory_player_repository.py        # NEW
│   │       ├── memory_player_state_repository.py   # NEW
│   │       ├── __init__.py                         # MODIFIED — update exports
│   │       └── sqlmodel/
│   │           ├── models.py                      # MODIFIED — add PlayerTable, PlayerStateTable; remove CardInstance/HeroCardInstance tables
│   │           ├── sqlmodel_card_repository.py    # REMOVED
│   │           ├── sqlmodel_card_definition_repository.py  # NEW
│   │           ├── sqlmodel_player_repository.py          # NEW
│   │           ├── sqlmodel_player_state_repository.py    # NEW
│   │           └── __init__.py                    # MODIFIED — update exports
│   └── infrastructure/
│       └── database.py                            # UNCHANGED
├── alembic/
│   └── versions/
│       └── 002_player_state.py              # NEW — migration for players + player_states tables + drop old tables
├── tests/
│   ├── test_entities.py                     # MODIFIED — add Player tests, update/replace CardInstance/HeroCardInstance tests
│   ├── conftest.py                          # MODIFIED — update table model imports
│   └── adapters/
│       └── repositories/
│           └── sqlmodel/
│               ├── test_sqlmodel_card_repository.py    # REMOVED
│               ├── test_sqlmodel_card_definition_repository.py  # NEW
│               ├── test_sqlmodel_player_repository.py           # NEW
│               └── test_sqlmodel_player_state_repository.py     # NEW
└── pyproject.toml                           # UNCHANGED

apps/forge-api/
├── src/forge_api/
│   └── dependencies.py                      # MODIFIED — update imports for new ports/repos
└── pyproject.toml                           # UNCHANGED
```

**Structure Decision**: All changes follow the existing adapter layer pattern.
New domain entities go in `domain/entities/player_state.py` (including `Player`).
New ports go in `domain/ports/`. New adapters follow the existing naming convention
(`memory_*` for in-memory, `sqlmodel/sqlmodel_*` for SQLModel). The migration
adds a new version file under the existing Alembic setup.

## Complexity Tracking

No constitution violations. Table is empty — no justifications needed.
