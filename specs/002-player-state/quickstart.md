# Quickstart: Player State Domain Model

## Prerequisites

- Python 3.12+
- uv package manager
- Docker + docker-compose (for PostgreSQL tests, optional)

## Setup

```bash
# From repo root, install forge-core dependencies
cd packages/py/forge-core
uv sync --all-extras

# Verify domain entities
uv run python -c "from forge_core.domain.entities.player_state import PlayerState; print('OK')"
```

## Running Tests

```bash
# Run all tests (SQLite in-memory, no Docker needed)
cd packages/py/forge-core
uv run pytest tests/ -v

# Run only player state tests
uv run pytest tests/test_entities.py -v -k "PlayerState or OwnedCard"
uv run pytest tests/adapters/repositories/ -v -k "player_state"

# Run with PostgreSQL (requires docker-compose up)
uv run pytest tests/ -v -m postgres
```

## Key Files

| Purpose | Path |
|---------|------|
| Domain entities (Player, State) | `src/forge_core/domain/entities/player_state.py` |
| Card definitions (cleaned) | `src/forge_core/domain/entities/card.py` |
| PlayerRepository port | `src/forge_core/domain/ports/player_repository.py` |
| CardDefinitionRepository port | `src/forge_core/domain/ports/card_definition_repository.py` |
| PlayerStateRepository port | `src/forge_core/domain/ports/player_state_repository.py` |
| In-memory player repo | `src/forge_core/adapters/repositories/memory_player_repository.py` |
| In-memory card def repo | `src/forge_core/adapters/repositories/memory_card_definition_repository.py` |
| In-memory player state repo | `src/forge_core/adapters/repositories/memory_player_state_repository.py` |
| SQLModel table models | `src/forge_core/adapters/repositories/sqlmodel/models.py` |
| SQLModel player repo | `src/forge_core/adapters/repositories/sqlmodel/sqlmodel_player_repository.py` |
| SQLModel player state repo | `src/forge_core/adapters/repositories/sqlmodel/sqlmodel_player_state_repository.py` |
| SQLModel card def repo | `src/forge_core/adapters/repositories/sqlmodel/sqlmodel_card_definition_repository.py` |

## Verification

After implementation, verify the full checklist:

1. **Entity tests pass**: `uv run pytest tests/test_entities.py -v`
2. **Repository tests pass**: `uv run pytest tests/adapters/ -v`
3. **Linting passes**: `uv run ruff check src/ tests/`
4. **Type checking passes**: `uv run mypy src/`
5. **No domain imports of SQLModel/FastAPI**: `grep -r "from sqlmodel\|from fastapi" src/forge_core/domain/` (should return nothing)
