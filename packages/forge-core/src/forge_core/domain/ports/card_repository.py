from abc import ABC, abstractmethod

from ..entities.card import CardInstance, HeroCardInstance, TroopCardDefinition


class CardRepository(ABC):
    @abstractmethod
    async def get_troop_definition(self, definition_id: str) -> TroopCardDefinition | None: ...

    @abstractmethod
    async def save_card_instance(self, instance: CardInstance) -> None: ...

    @abstractmethod
    async def get_card_instance(self, instance_id: str) -> CardInstance | None: ...

    @abstractmethod
    async def save_hero_instance(self, instance: HeroCardInstance) -> None: ...

    @abstractmethod
    async def get_hero_instance(self, instance_id: str) -> HeroCardInstance | None: ...
