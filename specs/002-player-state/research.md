# Research: Player State Domain Model

## R1: PlayerState Storage Strategy — JSON Blob per Version

**Decision**: Store each `PlayerState` snapshot as a single row with a JSON column containing the full serialized aggregate, same pattern used by spec 001 for configurations.

**Rationale**: The `PlayerState` aggregate is always loaded and saved as a whole unit. Individual sub-models (`CardCollection`, `Wallet`) are never queried independently. The JSON column pattern is already proven in the codebase (all config entities use it). Since the domain entity is a Pydantic model, `model_dump()` / `model_validate()` handles serialization round-trips with zero custom code.

**Alternatives considered**:
- **Normalized tables** (separate tables for `owned_cards`, `wallet`, etc.): Premature for current access patterns. Would require JOINs for every load. Can be introduced later if sub-model queries become a requirement.
- **Event sourcing**: Discussed and rejected with the user. Snapshot versioning provides 90% of the auditability at 10% of the complexity.

---

## R2: Snapshot Versioning — Composite Primary Key

**Decision**: Use a composite primary key of `(player_id, version)` for the `PlayerStateTable`. Each save inserts a new row with `version = max(existing) + 1`. No rows are overwritten or deleted.

**Rationale**: This is the simplest append-only strategy. It naturally supports:
- Load latest: `ORDER BY version DESC LIMIT 1`
- Load specific version: `WHERE player_id = ? AND version = ?`
- List versions: `SELECT version WHERE player_id = ?`
- List all players (latest only): `GROUP BY player_id` with `MAX(version)`

The version counter is managed by the repository, not the caller. This prevents version conflicts and ensures monotonicity.

**Alternatives considered**:
- **UUID-based version IDs**: Harder to order, no natural "latest" concept without additional timestamp logic.
- **Separate version history table**: Adds complexity (two tables, two queries per save) without benefit for current access patterns.
- **Timestamp-only versioning**: Risk of collisions at millisecond resolution. Integer version is simpler and unambiguous.

---

## R3: Timestamp and Change Note Fields

**Decision**: `PlayerState` has a single `timestamp` field (UTC) set by the repository at save time. Player creation time is tracked by `Player.created_at`. An optional `change_note: str | None` field provides an audit trail describing what caused each version.

**Rationale**: Since `PlayerState` snapshots are immutable once saved, there is no distinction between "created" and "updated" — each snapshot is created once and never modified. The old `created_at`/`updated_at` pair was designed before the `Player` entity existed; now that `Player.created_at` owns the player's creation time, the state snapshot only needs the moment it was saved.

The `change_note` field enables self-documenting version history (e.g., "Card troop-01 gained 50 XP", "Battle #42 completed", "Initial state"). This is caller-provided, not auto-generated, keeping the domain layer simple. It is invaluable for debugging progression paths in Forge.

**Alternatives considered**:
- **Two timestamps (created_at + updated_at)**: Redundant for immutable snapshots. `created_at` was carried forward from v1, adding complexity for no benefit now that `Player.created_at` exists.
- **Structured change metadata (event type, affected entities)**: Over-engineered for current needs. A freeform string provides 90% of the debugging value at minimal complexity.

---

## R4: CardDefinitionRepository — Read-Only Port Design

**Decision**: The new `CardDefinitionRepository` port will be read-only for all card types (troop, hero, general, relic), with get-by-ID and list-all methods for each type. Write methods (save) remain on the implementations but are not required by the port interface.

**Rationale**: Card definitions are authored in Forge's configuration tools and persisted via the configuration workflow. The `CardDefinitionRepository` is consumed by gameplay/simulation code that only needs to look up definitions — it never writes them. Having a read-only port makes the consumer's intent clear.

However, implementations (both memory and SQLModel) will include save methods as convenience for test setup and data seeding, matching the existing `SqlModelCardRepository.save_troop_definition()` pattern. These are adapter-level concerns, not domain port requirements.

**Alternatives considered**:
- **Read/write port**: Muddies the design-time vs. play-time boundary. Card definition writes belong to configuration management, not to the card definition lookup port.
- **Merge into ConfigurationRepository**: Card definitions are not configurations (they don't have `id` + `format_version` envelope). Keeping them separate preserves the entity taxonomy.

---

## R5: OwnedCard — Unified Instance Model

**Decision**: Replace the existing `CardInstance` (troop-focused, with `level`/`experience`) and `HeroCardInstance` (with `deployments_remaining`) with a single `OwnedCard` entity that uses a `card_type` discriminator field. The `deployments_remaining` field is kept as an optional field on `OwnedCard`, applicable only to hero cards.

**Rationale**: In the player's collection, all owned cards share the same lifecycle: they are acquired, may gain XP/levels, and are referenced by `definition_id`. The `card_type` field indicates what kind of definition the card links to.

Hero deployments are a **cross-battle persistent concern**: a hero with `max_deployments=3` can be deployed in at most 3 different battles (one per battle). Once exhausted, the hero cannot be deployed again. This means `deployments_remaining` must be tracked on the `OwnedCard` entity as persistent player state, not deferred to battle simulation.

The field is modeled as `int | None` — `None` for non-hero card types, and an integer for heroes (initialized from `HeroCardDefinition.max_deployments` when the hero is acquired).

This simplification means `CardCollection.cards` is a flat list of `OwnedCard`, regardless of the underlying card type. Querying "all my troops" is a simple filter on `card_type`.

**Alternatives considered**:
- **Per-type instance classes** (`OwnedTroopCard`, `OwnedHeroCard`, etc.): Adds class hierarchy complexity for a single optional field. The discriminator + optional field approach is simpler.
- **Polymorphic Pydantic discriminated union**: Over-engineered when there is only one type-specific field (`deployments_remaining`).

---

## R6: Migration Strategy

**Decision**: Add a new Alembic migration to create the `players` and `player_states` tables and drop the `card_instances` and `hero_card_instances` tables.

**Rationale**: The `card_instances` and `hero_card_instances` tables were created in the initial schema migration (spec 001). Since `CardInstance` and `HeroCardInstance` are being removed from the domain and replaced by `OwnedCard` inside `PlayerState` (stored as JSON), these tables become obsolete. A migration will cleanly drop them and create the new tables.

**Risk mitigation**: Since the project is pre-production with no real data, dropping tables is safe. The migration will include both upgrade (drop old, create new) and downgrade (drop new, recreate old) paths for completeness.

---

## R7: Player Identity Entity — Separation from PlayerState

**Decision**: Introduce a minimal `Player` entity (`player_id`, `name`, `created_at`) as the identity anchor, with a dedicated `PlayerRepository` port. `PlayerState` references `Player` via `player_id`.

**Rationale**: Without a separate identity entity, `player_id` is a dangling string in `PlayerState`. Future features (billing, stats monitoring, profile data) all need to reference a player — they should reference an entity, not a raw string. The `Player` entity provides:
- A natural home for profile information as it grows
- A `PlayerRepository.list()` method for listing players without loading full state snapshots
- The correct anchor for cross-cutting concerns (billing, stats) via `player_id` foreign key

The entity is intentionally minimal now. Email, contact info, and other profile fields are future concerns that will be added when needed.

**Alternatives considered**:
- **No separate entity** (use `player_id` strings directly): Works for now but forces a retrofit when profile data, billing, or stats are needed. Establishing the entity early is low-cost and prevents future migration pain.
- **Full user account model** (email, auth, preferences): Speculative over-engineering. The Forge tool uses "players" as simulation profiles, not real user accounts.
