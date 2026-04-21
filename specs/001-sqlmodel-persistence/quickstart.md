# Quickstart: SQLModel Backend Persistence

## Prerequisites

- Python 3.12+
- uv (Python package manager)
- Docker (for PostgreSQL — optional, SQLite used by default)

## Setup

### 1. Install dependencies

```bash
cd packages/py/forge-core
uv sync --extra dev
```

This installs `sqlmodel`, `alembic`, `aiosqlite`, `asyncpg`,
`psycopg2-binary`, and dev tools (pytest, ruff, mypy).

### 2. Run database migrations (SQLite default)

```bash
cd packages/py/forge-core
$env:PYTHONPATH = "src"    # PowerShell
alembic upgrade head
```

This creates `forge.db` with all 7 tables.

### 3. Start the API

```bash
cd apps/forge-api
uv run uvicorn forge_api.main:app --reload
```

The API now uses SQLModel repositories backed by SQLite.

## Switch to PostgreSQL

### Start PostgreSQL via Docker

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container (user: `forge`, password: `forge`, db: `forge`).

### Run migrations against PostgreSQL

```bash
cd packages/py/forge-core
$env:DATABASE_URL = "postgresql+asyncpg://forge:forge@localhost:5432/forge"
$env:PYTHONPATH = "src"
alembic upgrade head
```

### Start the API with PostgreSQL

```bash
cd apps/forge-api
$env:DATABASE_URL = "postgresql+asyncpg://forge:forge@localhost:5432/forge"
uv run uvicorn forge_api.main:app --reload
```

## Run Tests

### SQLite only (default, no Docker needed)

```bash
cd packages/py/forge-core
$env:PYTHONPATH = "src"
uv run pytest tests/ -v
```

### Including PostgreSQL tests (requires running Docker container)

```bash
cd packages/py/forge-core
$env:PYTHONPATH = "src"
uv run pytest tests/ -v -m "postgres or not postgres"
```

### PostgreSQL tests only

```bash
uv run pytest tests/ -v -m postgres
```

## Project Structure

```
packages/py/forge-core/
├── src/forge_core/
│   ├── domain/                         # Unchanged domain entities & ports
│   ├── adapters/repositories/
│   │   ├── memory_*.py                 # In-memory implementations
│   │   └── sqlmodel/                   # SQLModel implementations
│   │       ├── models.py               # 7 table models
│   │       ├── sqlmodel_configuration_repository.py
│   │       ├── sqlmodel_battle_repository.py
│   │       └── sqlmodel_card_repository.py
│   └── infrastructure/
│       └── database.py                 # Engine, session factory
├── alembic/                            # Migration scripts
│   ├── env.py
│   └── versions/
├── alembic.ini
└── tests/
    ├── conftest.py                     # SQLite + PostgreSQL fixtures
    └── adapters/repositories/sqlmodel/ # Integration tests (57 total)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./forge.db` | Database connection string |
| `TEST_DATABASE_URL` | `postgresql+asyncpg://forge:forge@localhost:5432/forge` | PostgreSQL test URL |
