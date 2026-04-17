from ...domain.entities.battlefield import BattlefieldConfig
from ...domain.entities.configuration import DeckConfig, RulesConfig
from ...domain.ports.configuration_repository import ConfigurationRepository


class MemoryConfigurationRepository(ConfigurationRepository):
    def __init__(self) -> None:
        self._decks: dict[str, DeckConfig] = {}
        self._rules: dict[str, RulesConfig] = {}
        self._battlefields: dict[str, BattlefieldConfig] = {}

    async def save_deck_config(self, config: DeckConfig) -> None:
        self._decks[config.id] = config

    async def get_deck_config(self, config_id: str) -> DeckConfig | None:
        return self._decks.get(config_id)

    async def list_deck_configs(self) -> list[DeckConfig]:
        return list(self._decks.values())

    async def save_rules_config(self, config: RulesConfig) -> None:
        self._rules[config.id] = config

    async def get_rules_config(self, config_id: str) -> RulesConfig | None:
        return self._rules.get(config_id)

    async def list_rules_configs(self) -> list[RulesConfig]:
        return list(self._rules.values())

    async def save_battlefield_config(self, config: BattlefieldConfig) -> None:
        self._battlefields[config.id] = config

    async def get_battlefield_config(self, config_id: str) -> BattlefieldConfig | None:
        return self._battlefields.get(config_id)

    async def list_battlefield_configs(self) -> list[BattlefieldConfig]:
        return list(self._battlefields.values())
