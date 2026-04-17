from ...domain.entities.card import CardInstance, HeroCardInstance, TroopCardDefinition
from ...domain.ports.card_repository import CardRepository


class MemoryCardRepository(CardRepository):
    def __init__(self) -> None:
        self._troop_defs: dict[str, TroopCardDefinition] = {}
        self._card_instances: dict[str, CardInstance] = {}
        self._hero_instances: dict[str, HeroCardInstance] = {}

    async def get_troop_definition(self, definition_id: str) -> TroopCardDefinition | None:
        return self._troop_defs.get(definition_id)

    async def save_card_instance(self, instance: CardInstance) -> None:
        self._card_instances[instance.instance_id] = instance

    async def get_card_instance(self, instance_id: str) -> CardInstance | None:
        return self._card_instances.get(instance_id)

    async def save_hero_instance(self, instance: HeroCardInstance) -> None:
        self._hero_instances[instance.instance_id] = instance

    async def get_hero_instance(self, instance_id: str) -> HeroCardInstance | None:
        return self._hero_instances.get(instance_id)
