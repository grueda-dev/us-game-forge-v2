"""Card definition repository port — read-only access to card catalog."""

from abc import ABC, abstractmethod

from ..entities.card import (
    GeneralCardDefinition,
    HeroCardDefinition,
    RelicCardDefinition,
    TroopCardDefinition,
)


class CardDefinitionRepository(ABC):
    """Read-only access to the card definition catalog.

    Design-time port — card definitions are authored in Forge's
    configuration tools. Consumers of this port only read definitions.
    """

    @abstractmethod
    async def get_troop_definition(
        self, definition_id: str
    ) -> TroopCardDefinition | None: ...

    @abstractmethod
    async def list_troop_definitions(self) -> list[TroopCardDefinition]: ...

    @abstractmethod
    async def get_hero_definition(
        self, definition_id: str
    ) -> HeroCardDefinition | None: ...

    @abstractmethod
    async def list_hero_definitions(self) -> list[HeroCardDefinition]: ...

    @abstractmethod
    async def get_general_definition(
        self, definition_id: str
    ) -> GeneralCardDefinition | None: ...

    @abstractmethod
    async def list_general_definitions(self) -> list[GeneralCardDefinition]: ...

    @abstractmethod
    async def get_relic_definition(
        self, definition_id: str
    ) -> RelicCardDefinition | None: ...

    @abstractmethod
    async def list_relic_definitions(self) -> list[RelicCardDefinition]: ...
