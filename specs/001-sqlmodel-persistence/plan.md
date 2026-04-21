# Implementation Plan: SQLModel Backend Persistence

**Branch**: `001-sqlmodel-persistence` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-sqlmodel-persistence/spec.md`

## Summary

Replace the in-memory repository implementations in `forge-core` with
durable SQLModel-based repositories supporting both SQLite and PostgreSQL.
Add Alembic for versioned schema migrations. Existing domain entities and
port interfaces remain unchanged — only new adapter implementations and
infrastructure are added.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: SQLModel, SQLAlchemy (async), Alembic, aiosqlite, asyncpg
**Storage**: SQLite (development default), PostgreSQL (production)
**Testing**: pytest + pytest-asyncio (existing), tests against in-memory SQLite
**Target Platform**: Linux/Windows server, local development
**Project Type**: Library (forge-core) + web-service (forge-api)
**Performance Goals**: Startup with migration < 5 seconds; save/load < 100ms
**Constraints**: Must preserve existing async port contracts exactly
**Scale/Scope**: Single-digit concurrent designers; ~100s of configs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Clean Architecture | ✅ PASS | SQLModel table models live in `adapters/repositories/sqlmodel/`. Domain entities unchanged. No framework imports in domain layer. |
| II. Dual Persistence | ✅ PASS | New SQLModel adapter is a third implementation alongside existing `memory/` and frontend `local/`+`remote/`. Port abstraction preserved. |
| III. Shared Domain | ✅ PASS | Domain entities in `forge_core.domain` are untouched. SQLModel table models are separate classes in the adapter layer. |
| IV. Test-Driven Development | ✅ PASS | All repository adapters will have integration tests against in-memory SQLite. Tests verify port contract compliance. |
| V. Configuration-Driven Design | ✅ PASS | JSON columns preserve full entity serialization including nested configs. No data loss. |

**Post-Phase 1 re-check**: All gates still pass. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-sqlmodel-persistence/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Table model definitions
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
│   ├── domain/                          # UNCHANGED
│   │   ├── entities/                    # Existing domain entities
│   │   └── ports/                       # Existing repository port ABCs
│   ├── adapters/
│   │   └── repositories/
│   │       ├── memory_*.py              # UNCHANGED — existing in-memory repos
│   │       └── sqlmodel/                # NEW — SQLModel implementations
│   │           ├── __init__.py
│   │           ├── models.py            # SQLModel table models (table=True)
│   │           ├── sqlmodel_configuration_repository.py
│   │           ├── sqlmodel_battle_repository.py
│   │           └── sqlmodel_card_repository.py
│   └── infrastructure/                  # NEW directory
│       ├── __init__.py
│       └── database.py                  # Engine, session factory, settings
├── alembic/                             # NEW — Alembic migrations
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       └── 001_initial_schema.py
├── tests/
│   ├── conftest.py                      # Async SQLite session fixture
│   └── adapters/
│       └── repositories/
│           └── sqlmodel/
│               ├── test_sqlmodel_configuration_repository.py
│               ├── test_sqlmodel_battle_repository.py
│               └── test_sqlmodel_card_repository.py
└── pyproject.toml                       # Updated dependencies

apps/forge-api/
├── src/forge_api/
│   ├── dependencies.py                  # Updated — SQLModel session provider
│   └── main.py                          # Updated — database lifecycle
└── pyproject.toml                       # Updated — async driver deps
```

**Structure Decision**: All new code follows the existing adapter layer
pattern. SQLModel repositories are placed under
`adapters/repositories/sqlmodel/` alongside the existing `memory_*.py`
implementations. Database infrastructure (engine, sessions) lives in a
new `infrastructure/` directory within forge-core. Alembic config sits
at the forge-core package root.

## Complexity Tracking

No constitution violations. Table is empty — no justifications needed.
