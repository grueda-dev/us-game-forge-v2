from forge_core.adapters.repositories import (
    MemoryBattleRepository,
    MemoryCardRepository,
    MemoryConfigurationRepository,
)
from forge_core.domain.ports import BattleRepository, CardRepository, ConfigurationRepository

# Singleton in-memory repositories (will be swapped for DB-backed in production)
_config_repo = MemoryConfigurationRepository()
_battle_repo = MemoryBattleRepository()
_card_repo = MemoryCardRepository()


def get_config_repo() -> ConfigurationRepository:
    return _config_repo


def get_battle_repo() -> BattleRepository:
    return _battle_repo


def get_card_repo() -> CardRepository:
    return _card_repo
