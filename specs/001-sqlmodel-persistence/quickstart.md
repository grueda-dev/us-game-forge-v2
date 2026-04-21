# Quickstart: SQLModel Backend Persistence

## Prerequisites

- Python 3.12+
- uv (Python package manager)
- PostgreSQL (optional — SQLite used by default)

## Setup

### 1. Install dependencies

```bash
cd packages/py/forge-core
uv sync
```

This installs `sqlmodel`, `alembic`, `aiosqlite`, and `asyncpg` along
with existing dependencies.

### 2. Run database migrations

```bash
cd packages/py/forge-core
alembic upgrade head
```

This creates all tables in the default SQLite database (`forge.db`).

### 3. Start the API

```bash
cd apps/forge-api
uv run uvicorn forge_api.main:app --reload
```

The API now uses SQLModel repositories backed by SQLite.

## Switch to PostgreSQL

Set the `DATABASE_URL` environment variable:

```bash
$env:DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5432/forge"
alembic upgrade head
uv run uvicorn forge_api.main:app --reload
```

## Verify

```bash
# Save a rules config
curl -X POST http://localhost:8000/api/v1/configurations/rules \
  -H "Content-Type: application/json" \
  -d '{"id":"test","formatVersion":"1.0","name":"Test Rules",
       "powerCalculation":{"stepOrder":["BASE_POWER"]},
       "xpConfig":{"baseXpPerBattle":10,"bonusXpForWin":5,
                   "levelThresholds":[100]},
       "turnConfig":{"cardsDrawnPerTurn":3}}'

# Restart the server, then retrieve:
curl http://localhost:8000/api/v1/configurations/rules/test
# Should return the saved config
```

## Run Tests

```bash
cd packages/py/forge-core
uv run pytest tests/ -v
```

Tests run against an in-memory SQLite database by default (no file
created, no PostgreSQL required).
