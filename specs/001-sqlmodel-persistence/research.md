# Research: SQLModel Backend Persistence

## R1: ORM Choice — SQLModel

**Decision**: Use SQLModel as the ORM layer.

**Rationale**: SQLModel is built by the same author as FastAPI (tiangolo),
combines Pydantic v2 models with SQLAlchemy Core/ORM, and provides
first-class integration with the existing Pydantic-based domain entities.
Since forge-core already uses Pydantic `BaseModel` for all entities, the
mapping layer between domain models and database table models is minimal.

**Alternatives considered**:
- **Raw SQLAlchemy**: More mature, but requires separate Pydantic ↔ ORM
  mapping. SQLModel eliminates this boilerplate.
- **Tortoise ORM**: Async-native, but smaller ecosystem. SQLAlchemy's
  ecosystem (Alembic, extensive docs) is a significant advantage.
- **Django ORM**: Heavyweight; brings the entire Django framework.
  Inappropriate for a FastAPI project.

---

## R2: Nested Pydantic Models in SQL — JSON Columns

**Decision**: Store complex nested domain objects (e.g.,
`PowerCalculationConfig`, `BattleEndCondition`, `BattlefieldSlot` lists)
as JSON columns in the database. Use `sa_column=Column(JSON)` in SQLModel
table models.

**Rationale**: The domain entities contain deeply nested Pydantic models
(e.g., `RulesConfig` has `PowerCalculationConfig`, `XpConfig`,
`TurnConfig` as nested objects; `BattlefieldConfig` has a list of
`BattlefieldSlot` each with `GridPosition` and `TerrainModifier` lists).
Normalizing these into separate relational tables would be premature — the
application never queries inside these nested structures; it always loads
and saves the full entity as a unit. JSON columns preserve the natural
Pydantic serialization.

**Alternatives considered**:
- **Full normalization** (separate tables for each nested model): Too
  complex for the current access patterns. Would require JOIN-heavy
  queries for simple save/load operations. Can be introduced later for
  specific entities if query-inside-JSON becomes a requirement.
- **Pickle/Blob**: Not human-readable, not portable across Python
  versions. JSON is inspectable and cross-platform.

**Implementation detail**: On read, JSON dicts are reconstructed into
Pydantic models in the repository adapter's mapping layer. On write,
Pydantic models are serialized via `model_dump()`. PostgreSQL `JSONB`
should be preferred when available for indexing support, but plain `JSON`
works for both SQLite and PostgreSQL.

---

## R3: Migration Strategy — Alembic

**Decision**: Use Alembic for database schema migrations, integrated with
SQLModel's SQLAlchemy metadata.

**Rationale**: `SQLModel.metadata.create_all()` only creates missing
tables — it cannot alter existing tables (add/remove/rename columns). As
domain entities evolve (many "to be defined" items in the game design
docs), schema evolution is inevitable. Alembic provides:
- Versioned migration scripts committed to git
- Upgrade and downgrade paths
- Autogeneration from SQLModel metadata diffs
- Consistent schema across all environments (dev SQLite, prod PostgreSQL)

**Alternatives considered**:
- **`create_all()` on startup**: Only viable for greenfield; breaks
  silently on schema changes to existing tables.
- **Manual SQL scripts**: Error-prone, no downgrade path, no
  autogeneration.

**Configuration**: Alembic's `env.py` will import SQLModel metadata from
the table models. The `alembic.ini` connection string will be
configurable via environment variable to support both SQLite and
PostgreSQL.

---

## R4: Table Model Design — Separation from Domain Entities

**Decision**: Create dedicated SQLModel table models (`table=True`)
separate from the existing Pydantic domain entities. Repository adapters
map between them.

**Rationale**: The constitution mandates that domain entities have zero
framework imports (Principle I: Clean Architecture). SQLModel table models
require SQLAlchemy imports (`Column`, `JSON`, `Field`). Keeping them
separate preserves domain purity. The mapping happens in the repository
adapter layer, which is the correct location per the architecture.

**Alternatives considered**:
- **Make domain entities inherit from SQLModel**: Violates Constitution
  Principle I — would import SQLAlchemy into the domain layer.
- **Single model for both**: Tight coupling between database schema and
  domain model. Schema changes force domain changes and vice versa.

---

## R5: Database Portability — SQLite + PostgreSQL

**Decision**: Support both SQLite (dev/single-user) and PostgreSQL
(production/multi-user) via SQLAlchemy's database URL abstraction.

**Rationale**: Switching databases requires only changing the connection
string. SQLAlchemy handles dialect differences. For JSON columns:
- SQLite stores JSON as text (native JSON support since 3.38)
- PostgreSQL supports `JSONB` with indexing

The repository code is identical for both; only the connection string
differs.

**Configuration**: A single `DATABASE_URL` environment variable:
- SQLite default: `sqlite+aiosqlite:///./forge.db`
- PostgreSQL: `postgresql+asyncpg://user:pass@host/dbname`

---

## R6: Async Database Access

**Decision**: Use async database sessions via `sqlalchemy.ext.asyncio`
with `aiosqlite` (SQLite) and `asyncpg` (PostgreSQL) drivers.

**Rationale**: The existing repository port methods are all `async def`.
The FastAPI application is async. Using sync database access would block
the event loop and degrade API performance under concurrent requests.

**Alternatives considered**:
- **Sync SQLAlchemy with `run_in_executor`**: Adds complexity and
  overhead. Native async is cleaner.
- **Sync-only**: Would work for SQLite single-user but bottleneck
  PostgreSQL under concurrent API calls.
