# Contracts: SQLModel Repository Adapters

## Overview

This feature implements the existing repository port interfaces defined
in `forge_core.domain.ports`. No new public interfaces are introduced —
the contracts are already defined. This document records the exact
port contracts that the SQLModel adapters must satisfy.

## Existing Port Contracts (unchanged)

### ConfigurationRepository

```python
class ConfigurationRepository(ABC):
    async def save_deck_config(self, config: DeckConfig) -> None
    async def get_deck_config(self, config_id: str) -> DeckConfig | None
    async def list_deck_configs(self) -> list[DeckConfig]
    async def save_rules_config(self, config: RulesConfig) -> None
    async def get_rules_config(self, config_id: str) -> RulesConfig | None
    async def list_rules_configs(self) -> list[RulesConfig]
    async def save_battlefield_config(self, config: BattlefieldConfig) -> None
    async def get_battlefield_config(self, config_id: str) -> BattlefieldConfig | None
    async def list_battlefield_configs(self) -> list[BattlefieldConfig]
```

### BattleRepository

```python
class BattleRepository(ABC):
    async def save_battle(self, battle: BattleDefinition) -> None
    async def get_battle(self, battle_id: str) -> BattleDefinition | None
    async def list_battles(self) -> list[BattleDefinition]
```

### CardRepository

```python
class CardRepository(ABC):
    async def get_troop_definition(self, definition_id: str) -> TroopCardDefinition | None
    async def save_card_instance(self, instance: CardInstance) -> None
    async def get_card_instance(self, instance_id: str) -> CardInstance | None
    async def save_hero_instance(self, instance: HeroCardInstance) -> None
    async def get_hero_instance(self, instance_id: str) -> HeroCardInstance | None
```

## Behavioral Contract

All `save_*` methods MUST use upsert semantics:
- If a record with the given ID exists, replace it
- If no record exists, insert it

All `get_*` methods MUST return `None` when the ID is not found.

All `list_*` methods MUST return an empty list when no records exist.

## New Internal Interfaces (not public API)

### Database Session Provider

A session factory will be introduced to provide async database sessions
to repository constructors. This is an infrastructure concern, not a
domain port.

```python
# Infrastructure — not part of domain ports
async def get_async_session() -> AsyncGenerator[AsyncSession, None]
```

Repositories receive sessions via dependency injection in the FastAPI
layer.
