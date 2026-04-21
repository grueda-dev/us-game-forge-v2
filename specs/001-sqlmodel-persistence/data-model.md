# Data Model: SQLModel Backend Persistence

## Overview

This document defines the SQLModel table models that map domain entities
to relational database tables. Each table model is a separate class from
the domain entity it represents. Repository adapters handle the mapping.

**Design principle**: Scalar fields are stored as native SQL columns.
Complex nested objects are stored as JSON columns. This matches the
access pattern — entities are always loaded and saved as complete units.

---

## Table Models

### DeckConfigTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `id` | `VARCHAR` | `PRIMARY KEY` | `DeckConfig.id` |
| `format_version` | `VARCHAR` | `NOT NULL` | `DeckConfig.format_version` |
| `name` | `VARCHAR` | `NOT NULL` | `DeckConfig.name` |
| `general_definition_id` | `VARCHAR` | `NOT NULL` | `DeckConfig.general_definition_id` |
| `data` | `JSON` | `NOT NULL` | Full `DeckConfig` serialized via `model_dump()` |

**Note**: The `data` column stores the complete entity as JSON for
lossless round-tripping of nested objects (`troop_entries`,
`hero_entries`, `relic_definition_ids`). Top-level scalar columns
(`name`, `format_version`, `general_definition_id`) are denormalized
for potential future querying/filtering.

---

### RulesConfigTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `id` | `VARCHAR` | `PRIMARY KEY` | `RulesConfig.id` |
| `format_version` | `VARCHAR` | `NOT NULL` | `RulesConfig.format_version` |
| `name` | `VARCHAR` | `NOT NULL` | `RulesConfig.name` |
| `data` | `JSON` | `NOT NULL` | Full `RulesConfig` serialized |

**Nested objects in `data`**: `PowerCalculationConfig` (with
`step_order` list and `step_multipliers` dict), `XpConfig`, `TurnConfig`.

---

### BattlefieldConfigTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `id` | `VARCHAR` | `PRIMARY KEY` | `BattlefieldConfig.id` |
| `format_version` | `VARCHAR` | `NOT NULL` | `BattlefieldConfig.format_version` |
| `name` | `VARCHAR` | `NOT NULL` | `BattlefieldConfig.name` |
| `data` | `JSON` | `NOT NULL` | Full `BattlefieldConfig` serialized |

**Nested objects in `data`**: `BattlefieldGrid` (rows, cols),
list of `BattlefieldSlot` (each with `GridPosition`,
`TerrainType`, list of `TerrainModifier`).

---

### BattleDefinitionTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `id` | `VARCHAR` | `PRIMARY KEY` | `BattleDefinition.id` |
| `format_version` | `VARCHAR` | `NOT NULL` | `BattleDefinition.format_version` |
| `name` | `VARCHAR` | `NOT NULL` | `BattleDefinition.name` |
| `battlefield_config_id` | `VARCHAR` | `NOT NULL` | `BattleDefinition.battlefield_config_id` |
| `player_deck_config_id` | `VARCHAR` | `NOT NULL` | `BattleDefinition.player_deck_config_id` |
| `opponent_deck_config_id` | `VARCHAR` | `NOT NULL` | `BattleDefinition.opponent_deck_config_id` |
| `rules_config_id` | `VARCHAR` | `NOT NULL` | `BattleDefinition.rules_config_id` |
| `data` | `JSON` | `NOT NULL` | Full `BattleDefinition` serialized |

**Note**: Reference IDs are denormalized as columns for potential future
JOIN queries. No foreign key constraints — configs may be created in
any order.

---

### CardInstanceTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `instance_id` | `VARCHAR` | `PRIMARY KEY` | `CardInstance.instance_id` |
| `definition_id` | `VARCHAR` | `NOT NULL` | `CardInstance.definition_id` |
| `level` | `INTEGER` | `NOT NULL, DEFAULT 1` | `CardInstance.level` |
| `experience` | `INTEGER` | `NOT NULL, DEFAULT 0` | `CardInstance.experience` |

**Note**: No JSON column needed — all fields are scalar.

---

### HeroCardInstanceTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `instance_id` | `VARCHAR` | `PRIMARY KEY` | `HeroCardInstance.instance_id` |
| `definition_id` | `VARCHAR` | `NOT NULL` | `HeroCardInstance.definition_id` |
| `deployments_remaining` | `INTEGER` | `NOT NULL` | `HeroCardInstance.deployments_remaining` |

**Note**: No JSON column needed — all fields are scalar.

---

### TroopCardDefinitionTable

| Column | SQL Type | Constraints | Maps To |
|--------|----------|-------------|---------|
| `definition_id` | `VARCHAR` | `PRIMARY KEY` | `TroopCardDefinition.definition_id` |
| `card_type` | `VARCHAR` | `NOT NULL` | `TroopCardDefinition.card_type` |
| `name` | `VARCHAR` | `NOT NULL` | `TroopCardDefinition.name` |
| `faction` | `VARCHAR` | `NOT NULL` | `TroopCardDefinition.faction` |
| `card_class` | `VARCHAR` | `NOT NULL` | `TroopCardDefinition.card_class` |
| `base_power` | `INTEGER` | `NOT NULL` | `TroopCardDefinition.base_power` |

**Note**: All fields are scalar enums or primitives — no JSON needed.

---

## Entity ↔ Table Mapping Summary

| Domain Entity | Table Model | JSON Column? | Reason |
|---------------|-------------|-------------|--------|
| `DeckConfig` | `DeckConfigTable` | Yes | Nested `troop_entries`, `hero_entries` |
| `RulesConfig` | `RulesConfigTable` | Yes | Nested `PowerCalculationConfig`, `XpConfig`, `TurnConfig` |
| `BattlefieldConfig` | `BattlefieldConfigTable` | Yes | Nested `BattlefieldSlot` list with sub-objects |
| `BattleDefinition` | `BattleDefinitionTable` | Yes | Nested `BattleEndCondition` |
| `CardInstance` | `CardInstanceTable` | No | All scalar fields |
| `HeroCardInstance` | `HeroCardInstanceTable` | No | All scalar fields |
| `TroopCardDefinition` | `TroopCardDefinitionTable` | No | All scalar/enum fields |

## Mapping Strategy

Repository adapters convert between domain entities and table models:

**Domain → Table (save)**:
1. `entity.model_dump()` → dict
2. Extract top-level scalar fields for dedicated columns
3. Store full dict as `data` JSON column (for entities with nested objects)

**Table → Domain (load)**:
1. Read `data` JSON column (or scalar columns for flat entities)
2. Construct domain entity via `DomainEntity(**data)` or
   `DomainEntity.model_validate(data)`
