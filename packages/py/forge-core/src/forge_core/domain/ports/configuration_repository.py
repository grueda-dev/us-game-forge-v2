from abc import ABC, abstractmethod

from ..entities.battlefield import BattlefieldConfig
from ..entities.configuration import DeckConfig, RulesConfig


class ConfigurationRepository(ABC):
    @abstractmethod
    async def save_deck_config(self, config: DeckConfig) -> None: ...

    @abstractmethod
    async def get_deck_config(self, config_id: str) -> DeckConfig | None: ...

    @abstractmethod
    async def list_deck_configs(self) -> list[DeckConfig]: ...

    @abstractmethod
    async def save_rules_config(self, config: RulesConfig) -> None: ...

    @abstractmethod
    async def get_rules_config(self, config_id: str) -> RulesConfig | None: ...

    @abstractmethod
    async def list_rules_configs(self) -> list[RulesConfig]: ...

    @abstractmethod
    async def save_battlefield_config(self, config: BattlefieldConfig) -> None: ...

    @abstractmethod
    async def get_battlefield_config(self, config_id: str) -> BattlefieldConfig | None: ...

    @abstractmethod
    async def list_battlefield_configs(self) -> list[BattlefieldConfig]: ...
