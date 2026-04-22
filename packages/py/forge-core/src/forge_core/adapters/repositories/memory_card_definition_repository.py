"""In-memory implementation of CardDefinitionRepository."""

from ...domain.entities.card import (
    GeneralCardDefinition,
    MercenaryCardDefinition,
    RelicCardDefinition,
    TroopCardDefinition,
)
from ...domain.ports.card_definition_repository import CardDefinitionRepository


class MemoryCardDefinitionRepository(CardDefinitionRepository):
    """In-memory card definition catalog for testing and seeding."""

    def __init__(self) -> None:
        self._troop_defs: dict[str, TroopCardDefinition] = {}
        self._mercenary_defs: dict[str, MercenaryCardDefinition] = {}
        self._general_defs: dict[str, GeneralCardDefinition] = {}
        self._relic_defs: dict[str, RelicCardDefinition] = {}

    # ── Convenience save methods (not part of the port contract) ──

    async def save_troop_definition(self, defn: TroopCardDefinition) -> None:
        self._troop_defs[defn.definition_id] = defn

    async def save_mercenary_definition(self, defn: MercenaryCardDefinition) -> None:
        self._mercenary_defs[defn.definition_id] = defn

    async def save_general_definition(self, defn: GeneralCardDefinition) -> None:
        self._general_defs[defn.definition_id] = defn

    async def save_relic_definition(self, defn: RelicCardDefinition) -> None:
        self._relic_defs[defn.definition_id] = defn

    # ── Port contract methods ─────────────────────────────────────

    async def get_troop_definition(self, definition_id: str) -> TroopCardDefinition | None:
        return self._troop_defs.get(definition_id)

    async def list_troop_definitions(self) -> list[TroopCardDefinition]:
        return list(self._troop_defs.values())

    async def get_mercenary_definition(self, definition_id: str) -> MercenaryCardDefinition | None:
        return self._mercenary_defs.get(definition_id)

    async def list_mercenary_definitions(self) -> list[MercenaryCardDefinition]:
        return list(self._mercenary_defs.values())

    async def get_general_definition(self, definition_id: str) -> GeneralCardDefinition | None:
        return self._general_defs.get(definition_id)

    async def list_general_definitions(self) -> list[GeneralCardDefinition]:
        return list(self._general_defs.values())

    async def get_relic_definition(self, definition_id: str) -> RelicCardDefinition | None:
        return self._relic_defs.get(definition_id)

    async def list_relic_definitions(self) -> list[RelicCardDefinition]:
        return list(self._relic_defs.values())
