# Feature Specification: Player State Domain Model

**Feature Branch**: `002-player-state`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Introduce a player state aggregate entity to cleanly separate design-time card/game configurations from play-time player state. Rework existing CardInstance into the state model. Add a PlayerStateRepository port."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Player and Player State Entities in Domain (Priority: P1)

As a domain developer, I need a `Player` identity entity and a `PlayerState` aggregate entity composed of typed sub-models (`CardCollection`, `Wallet`) with built-in snapshot versioning, so that player identity is separated from game progression, and play-time data (owned cards, XP, levels, currency) is structurally separated from design-time configuration data (card definitions, deck configs, rules). Every change to the state is preserved as an auditable, replayable history.

**Why this priority**: This is the foundational entity that everything else depends on. Without a clean domain model, the separation between configuration and state cannot exist.

**Independent Test**: Can be fully tested by instantiating `PlayerState` with `OwnedCard` entries, verifying serialization round-trips, and confirming that card instances are correctly associated with their definition IDs.

**Acceptance Scenarios**:

1. **Given** a new player is created, **When** a `Player` entity is instantiated, **Then** it has a `player_id`, `name`, and `created_at` timestamp.
2. **Given** a new player, **When** a `PlayerState` is created with default values referencing their `player_id`, **Then** it contains an empty `CardCollection`, an empty relic list, no active general, a `Wallet` with zero currency, version 1, and a `timestamp`.
3. **Given** a player who has played several battles, **When** their state is represented as a `PlayerState`, **Then** each owned card is an `OwnedCard` with its own `instance_id`, `definition_id`, `card_type`, `level`, and `experience`.
4. **Given** an `OwnedCard` at level 3 with 250 XP, **When** the state is serialized to JSON and deserialized back, **Then** all fields including `version`, `timestamp`, and `change_note` are preserved exactly.

---

### User Story 2 - Separate Card Definitions from Card Instances (Priority: P1)

As a domain developer, I need the existing `CardInstance` and `HeroCardInstance` entities to be reworked into a unified `OwnedCard` entity within the player state model, and the existing `CardRepository` port to be split into a design-time `CardDefinitionRepository` (for card blueprints) and a play-time `PlayerStateRepository` (for player state).

**Why this priority**: The current `CardRepository` mixes design-time definition lookups with play-time instance persistence. Splitting it is essential to enforce the configuration-vs-state boundary and aligns with the project's clean architecture principle.

**Independent Test**: Can be fully tested by verifying that `CardDefinitionRepository` only exposes definition-read operations and `PlayerStateRepository` only exposes state CRUD operations, and that existing tests continue to pass after the refactor.

**Acceptance Scenarios**:

1. **Given** the current `CardRepository` port, **When** the refactor is complete, **Then** a `CardDefinitionRepository` port exists with methods to retrieve card definitions (troop, hero, general, relic) and a separate `PlayerStateRepository` port exists with methods to save/load `PlayerState`.
2. **Given** the current `CardInstance` and `HeroCardInstance` entities, **When** the refactor is complete, **Then** these entities no longer exist as standalone domain entities and their data is represented by `OwnedCard` within `CardCollection`.
3. **Given** the existing `card.py` domain file, **When** the refactor is complete, **Then** it contains only card definition entities (`TroopCardDefinition`, `HeroCardDefinition`, `GeneralCardDefinition`, `RelicCardDefinition`) and their supporting value objects.

---

### User Story 3 - Persist and Retrieve Versioned Player State (Priority: P2)

As a Forge developer, I need a `PlayerStateRepository` port with append-only (snapshot versioning) semantics and concrete implementations (in-memory and SQLModel) so that every change to a player's state is preserved as a new version, enabling progression history inspection, debugging, and future simulation features.

**Why this priority**: The port and at least one implementation (in-memory) are needed to make the domain model usable. Snapshot versioning is cheap to implement now but extremely costly to retrofit later, and is essential for Forge's progression-testing value proposition.

**Independent Test**: Can be fully tested by saving a `PlayerState` multiple times, retrieving specific versions and the latest version, and verifying that no historical data is lost.

**Acceptance Scenarios**:

1. **Given** a `PlayerState` with 5 owned cards, 2 equipped relics, and 100 gold, **When** saved and then loaded by `player_id`, **Then** all fields match the original state exactly and the version is 1.
2. **Given** a `PlayerState` at version 1, **When** it is modified (e.g., a card gains XP) and saved again, **Then** loading by `player_id` without a version returns version 2, and loading with version 1 returns the original unmodified state.
3. **Given** a player with 5 saved versions, **When** listing versions for that player, **Then** all 5 version numbers are returned in order.
4. **Given** multiple players exist, **When** listing all players via `PlayerRepository`, **Then** all player profiles are returned.

---

### Edge Cases

- What happens when a `PlayerState` references a `definition_id` that does not exist in the card definition catalog? The state should still be valid — referential integrity is an application-layer concern, not a domain-layer constraint.
- What happens when saving a `PlayerState` with an empty `CardCollection`? It should succeed — a new player starts with nothing.
- What happens when two `OwnedCard` entries reference the same `definition_id`? This is valid — a player can own multiple copies of the same card type, each with independent XP/level.
- What happens when loading a version that does not exist? The repository should return `None`, same as loading a non-existent player.
- What happens when saving a `PlayerState` with a `version` that does not match the next expected version? The repository should assign the correct next version automatically — the caller does not control versioning.
- What happens when saving a `PlayerState` for a `player_id` that does not exist in `PlayerRepository`? This is an application-layer validation concern. The domain/repository does not enforce referential integrity between `Player` and `PlayerState`.
- What happens when creating a `Player` with a duplicate `player_id`? The repository should raise or return an error — player IDs must be unique.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The domain layer MUST define a `PlayerState` aggregate entity that composes typed sub-models: `CardCollection`, `Wallet`.
- **FR-002**: The `CardCollection` sub-model MUST contain a list of `OwnedCard` entities, each with `instance_id`, `definition_id`, `card_type`, `level`, `experience`, and `deployments_remaining` (optional, hero-only: tracks remaining deployments across battles).
- **FR-003**: The `Wallet` sub-model MUST track at least one currency type (gold) with an integer balance.
- **FR-004**: The `PlayerState` entity MUST include fields for `player_id`, `version`, `timestamp` (UTC, set by repository on save), `change_note` (optional string describing what caused this version), `active_general_definition_id` (optional), and `equipped_relic_ids` (list).
- **FR-005**: The existing `CardInstance` and `HeroCardInstance` entities MUST be removed and replaced by `OwnedCard` within the player state model.
- **FR-006**: The existing `CardRepository` port MUST be split into `CardDefinitionRepository` (design-time reads) and `PlayerStateRepository` (play-time CRUD).
- **FR-007**: The `CardDefinitionRepository` port MUST expose methods to retrieve definitions for all card types (troop, hero, general, relic).
- **FR-008**: The `PlayerStateRepository` port MUST expose methods to save (append-only), load (by player ID with optional version), and list versions for a given player.
- **FR-009**: Saving a `PlayerState` MUST create a new version snapshot. Previous versions MUST NOT be overwritten or deleted.
- **FR-010**: The repository MUST automatically assign the next sequential version number on save. The caller MUST NOT control version numbering.
- **FR-011**: Loading a `PlayerState` by player ID without specifying a version MUST return the latest version.
- **FR-012**: Loading a `PlayerState` by player ID with a specific version number MUST return that exact snapshot, or `None` if the version does not exist.
- **FR-013**: An in-memory implementation of `PlayerStateRepository` MUST be provided for testing.
- **FR-014**: A SQLModel implementation of `PlayerStateRepository` MUST be provided, following the same adapter pattern established in spec 001.
- **FR-015**: All new entities MUST serialize to and deserialize from JSON without data loss (round-trip fidelity).
- **FR-016**: The `card.py` domain file MUST contain only card definition entities after the refactor — no instance/state entities.
- **FR-017**: The domain layer MUST define a `Player` identity entity with `player_id`, `name`, and `created_at` fields.
- **FR-018**: A `PlayerRepository` port MUST expose methods to create, get (by player ID), list, and delete players.
- **FR-019**: An in-memory implementation of `PlayerRepository` MUST be provided for testing.
- **FR-020**: A SQLModel implementation of `PlayerRepository` MUST be provided, following the same adapter pattern established in spec 001.

### Key Entities

- **Player**: The identity anchor entity representing a player/simulation profile. Contains `player_id`, `name`, and `created_at`. All other player-related aggregates (state, future billing, stats) reference this entity via `player_id`. Keyed by `player_id`.
- **PlayerState**: The root aggregate representing a player's current game state. Contains a `CardCollection`, `Wallet`, active general reference, equipped relic references, version metadata (`version`, `timestamp`), and an optional `change_note` for audit trail. References `Player` via `player_id`. Keyed by `player_id` + `version`.
- **OwnedCard**: A card instance owned by a player. Links to a card definition via `definition_id` and tracks play-time progression (`level`, `experience`, `card_type`). For hero cards, also tracks `deployments_remaining` — a cross-battle persistent resource (max one deployment consumed per battle). Replaces the current `CardInstance` and `HeroCardInstance`.
- **CardCollection**: A value object holding the player's collection of owned cards.
- **Wallet**: A value object tracking the player's currency balances.
- **PlayerRepository**: A port for CRUD operations on player identity/profile.
- **CardDefinitionRepository**: A port for read-only access to the card definition catalog (all card types).
- **PlayerStateRepository**: A port for append-only versioned persistence of player state. Supports loading latest or specific versions, and listing version history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing tests pass after the refactor with no regressions.
- **SC-002**: Domain entities in `card.py` contain zero instance/state-related classes — only definition classes remain.
- **SC-003**: A `PlayerState` entity can be created, serialized to JSON, deserialized, and all fields including version metadata match — achieving 100% round-trip fidelity.
- **SC-004**: The `PlayerStateRepository` port has at least two concrete implementations (in-memory and SQLModel) that both pass identical contract tests.
- **SC-005**: No domain entity imports any framework-specific module (SQLModel, FastAPI, etc.) — verified by inspection.
- **SC-006**: The `CardDefinitionRepository` port covers all four card types (troop, hero, general, relic) with retrieval methods.
- **SC-007**: Saving a `PlayerState` three times produces three distinct retrievable versions — version 1, 2, and 3 — and loading without a version returns version 3.
- **SC-008**: Historical versions are immutable — loading version 1 after further saves returns the original snapshot unchanged.
- **SC-009**: A `Player` can be created, retrieved by ID, and listed. The `PlayerRepository` port has both in-memory and SQLModel implementations passing identical contract tests.

## Assumptions

- The `OwnedCard` entity uses a generic representation that covers all card types (troop, hero, general, relic) via a `card_type` discriminator field, rather than having separate instance classes per card type.
- Hero deployment tracking (`deployments_remaining`) is a cross-battle persistent concern — a hero can be deployed at most once per battle, consuming one deployment. The field is modeled as `int | None` on `OwnedCard`: `None` for non-hero card types, initialized from `HeroCardDefinition.max_deployments` when a hero is acquired.
- Currency is modeled as a simple integer (`gold`) for now. Additional currency types can be added to `Wallet` later without breaking changes.
- The `PlayerState` aggregate is loaded/saved as a whole unit. Fine-grained sub-model repositories are not needed at this stage but the typed sub-models provide natural seam lines for future extraction.
- Referential integrity between `PlayerState.player_id` and `Player`, and between `OwnedCard.definition_id` and the card definition catalog, is an application-layer concern, not enforced at the domain entity level.
- The existing in-memory `CardRepository` adapter will be updated to match the new `CardDefinitionRepository` port.
- Snapshot versioning uses an append-only storage strategy. No automatic pruning or retention policy is implemented in this feature — all versions are kept indefinitely. A future feature may add configurable retention if storage becomes a concern.
- The `version` field is a monotonically increasing integer starting at 1. The repository assigns versions, not the caller.
- Each `PlayerState` snapshot has a single `timestamp` field (UTC) set by the repository at save time. Since snapshots are immutable, there is no distinction between "created" and "updated" — the snapshot is created once and never modified. Player creation time is tracked by `Player.created_at`.
- The `change_note` field (`str | None`) on `PlayerState` provides an optional audit trail describing what caused this version (e.g., "Card troop-01 gained 50 XP", "Battle #42 completed"). It is caller-provided, not auto-generated.
- The `Player` entity is intentionally minimal (identity only). Profile fields (email, contact info) and associated data (billing, stats) will be added in future features when needed. The important thing is that the entity exists as an anchor for all player-related data.
