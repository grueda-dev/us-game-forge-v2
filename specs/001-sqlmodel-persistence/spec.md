# Feature Specification: SQLModel Backend Persistence

**Feature Branch**: `001-sqlmodel-persistence`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "Implement SQLModel-based backend persistence layer for forge-core with PostgreSQL and SQLite support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save and Retrieve Game Configurations (Priority: P1)

A game designer creates deck, rules, and battlefield configurations through
the Forge UI. When working online, these configurations are persisted to the
backend database so they survive server restarts and are accessible from any
device.

**Why this priority**: Without durable persistence, all configurations are
lost when the server restarts (the current in-memory repository). This is
the foundational capability that every other feature depends on.

**Independent Test**: Create a deck config via the API, restart the server,
retrieve the same deck config — it returns unchanged.

**Acceptance Scenarios**:

1. **Given** no existing deck configs, **When** a designer saves a new deck
   config via the API, **Then** the config is persisted and retrievable by
   its ID after a server restart.
2. **Given** existing configurations in the database, **When** the designer
   requests a listing of all deck configs, **Then** all previously saved
   configs are returned.
3. **Given** an existing rules config, **When** the designer saves a rules
   config with the same ID, **Then** the previous version is replaced with
   the new data.
4. **Given** an existing battlefield config, **When** the designer retrieves
   it by ID, **Then** all nested data (grid dimensions, slots, terrain
   modifiers) is fully preserved.

---

### User Story 2 - Save and Retrieve Battle Definitions (Priority: P1)

A game designer defines battle setups linking specific deck, battlefield,
and rules configurations together. These battle definitions are persisted
durably so they can be loaded and played later.

**Why this priority**: Battle definitions are a core entity for Phase 1
(Battle Testing). Without persistence, designers cannot save battle setups
for later testing or simulation.

**Independent Test**: Create a battle definition via the API, restart the
server, retrieve the same battle definition — it returns unchanged
including all referenced config IDs.

**Acceptance Scenarios**:

1. **Given** no existing battles, **When** a designer saves a battle
   definition, **Then** it is persisted and retrievable by ID.
2. **Given** multiple battle definitions, **When** the designer lists all
   battles, **Then** all previously saved battles are returned.
3. **Given** a battle definition referencing deck, battlefield, and rules
   config IDs, **When** retrieved, **Then** all reference IDs are intact.

---

### User Story 3 - Save and Retrieve Card Instances (Priority: P2)

Card instances track individual card state (level, XP, deployments
remaining) across battles. Designers need these persisted to test
progression mechanics across multiple battle sessions.

**Why this priority**: Card instance persistence is required for progression
testing but is not needed for basic single-battle testing, making it lower
priority than configurations and battle definitions.

**Independent Test**: Save a card instance and a hero instance, restart the
server, retrieve both — level, XP, and deployment counters are preserved.

**Acceptance Scenarios**:

1. **Given** a troop card instance with specific level and XP, **When**
   saved and retrieved, **Then** level and XP values are preserved exactly.
2. **Given** a hero card instance with deployments remaining, **When** saved
   and retrieved, **Then** the deployment counter is preserved.
3. **Given** a troop card definition, **When** retrieved by definition ID,
   **Then** the full definition with faction, class, and base power is
   returned.

---

### User Story 4 - Switch Between SQLite and PostgreSQL Without Code Changes (Priority: P2)

The system supports both SQLite (for local development and single-designer
use) and PostgreSQL (for production multi-designer deployments) using the
same repository implementations. Switching between them requires only a
configuration change — no code modifications.

**Why this priority**: Database portability enables rapid local development
with SQLite while deploying to production with PostgreSQL. This reduces
onboarding friction for new contributors.

**Independent Test**: Run the full test suite against both SQLite and
PostgreSQL — all tests pass identically on both databases.

**Acceptance Scenarios**:

1. **Given** a database connection string pointing to SQLite, **When** the
   application starts, **Then** all repository operations work correctly
   using an SQLite file.
2. **Given** a database connection string pointing to PostgreSQL, **When**
   the application starts, **Then** all repository operations work
   correctly using the PostgreSQL instance.
3. **Given** no explicit database configuration, **When** the application
   starts in development mode, **Then** it defaults to an SQLite file
   database.

---

### Edge Cases

- What happens when saving a config with an ID that already exists?
  The existing record is updated (upsert behavior), matching the current
  in-memory repository semantics.
- What happens when retrieving a config by an ID that does not exist?
  `None` is returned, consistent with the existing port contract.
- What happens when the database file (SQLite) or server (PostgreSQL)
  is unavailable at startup? The application fails fast with a clear
  error message rather than silently degrading.
- What happens when complex nested entities (battlefield slots with
  terrain modifiers, deck configs with troop/hero entries) are saved?
  All nested data is fully serialized and deserialized without loss.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement all three repository port interfaces
  (`ConfigurationRepository`, `BattleRepository`, `CardRepository`) using
  SQLModel as the ORM.
- **FR-002**: System MUST persist all domain entity fields without data
  loss, including nested Pydantic models and enum values.
- **FR-003**: System MUST support both SQLite and PostgreSQL as target
  databases, selectable via a connection string configuration.
- **FR-004**: System MUST manage database schema changes through versioned
  migration scripts that are run explicitly before deployment — not
  automatically on application startup.
- **FR-005**: System MUST use upsert semantics for save operations — if a
  record with the same ID exists, it is replaced.
- **FR-006**: System MUST return `None` for get operations when the
  requested ID does not exist.
- **FR-007**: System MUST preserve the existing repository port contracts
  exactly — no changes to the abstract base classes in the domain layer.
- **FR-008**: System MUST default to SQLite when no database connection
  string is explicitly configured.

### Key Entities *(include if feature involves data)*

- **DeckConfig**: Named deck with general, troop entries (definition ID +
  quantity), hero entries, and relic IDs.
- **RulesConfig**: Named rules set with power calculation config, XP
  config, and turn config — all as nested objects.
- **BattlefieldConfig**: Named battlefield with grid dimensions and a list
  of slots, each with position, terrain type, and terrain modifiers.
- **BattleDefinition**: Named battle linking deck, battlefield, and rules
  config IDs with an end condition.
- **CardInstance**: Individual troop card with instance ID, definition ID,
  level, and XP.
- **HeroCardInstance**: Individual hero card with instance ID, definition
  ID, and deployments remaining.
- **TroopCardDefinition**: Card definition with name, faction, class, and
  base power.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing repository port methods (save, get, list) are
  implemented for all three repository interfaces with full data fidelity.
- **SC-002**: Configurations survive server restarts — data persisted
  before a restart is fully retrievable after restart.
- **SC-003**: The same test suite passes against both SQLite and PostgreSQL
  without any test modifications.
- **SC-004**: Switching from SQLite to PostgreSQL requires only changing
  one configuration value (the database connection string).
- **SC-005**: Application startup including schema migration completes in
  under 5 seconds in local development.

## Assumptions

- The existing domain entities (Pydantic models in `forge_core.domain`)
  remain stable during this implementation — no entity refactors are
  in scope.
- SQLite is acceptable as the default for local development and
  single-designer use; PostgreSQL is used for shared/production
  environments.
- The SQLModel dependency is added to `forge-core` (not `forge-api`)
  since persistence adapters live in the shared library.
- The current in-memory repository implementations are retained as-is
  for unit testing and potential future use.
- Database migrations use Alembic, integrated with SQLModel's metadata.
  The initial migration creates all tables; subsequent migrations handle
  schema evolution (add/remove/alter columns). Migrations are run
  explicitly (e.g., `alembic upgrade head`) — not on app startup.
