"""SQLModel implementation of CardDefinitionRepository port."""

from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.entities.card import (
    GeneralCardDefinition,
    HeroCardDefinition,
    RelicCardDefinition,
    TroopCardDefinition,
)
from ....domain.entities.enums import CardClass, CardType, Faction
from ....domain.ports.card_definition_repository import CardDefinitionRepository
from .models import TroopCardDefinitionTable


class SqlModelCardDefinitionRepository(CardDefinitionRepository):
    """Persists card definitions via SQLModel/SQLAlchemy.

    Currently supports troop definitions only — hero, general, and relic
    definition tables will be added in future migrations.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Convenience save (not part of port) ───────────────────────

    async def save_troop_definition(self, defn: TroopCardDefinition) -> None:
        """Save a troop card definition (for seeding and tests)."""
        existing = await self._session.get(
            TroopCardDefinitionTable, defn.definition_id
        )
        if existing:
            existing.card_type = defn.card_type
            existing.name = defn.name
            existing.faction = defn.faction
            existing.card_class = defn.card_class
            existing.base_power = defn.base_power
            self._session.add(existing)
        else:
            row = TroopCardDefinitionTable(
                definition_id=defn.definition_id,
                card_type=defn.card_type,
                name=defn.name,
                faction=defn.faction,
                card_class=defn.card_class,
                base_power=defn.base_power,
            )
            self._session.add(row)
        await self._session.commit()

    # ── Troop Definitions ─────────────────────────────────────────

    async def get_troop_definition(
        self, definition_id: str
    ) -> TroopCardDefinition | None:
        row = await self._session.get(TroopCardDefinitionTable, definition_id)
        if row is None:
            return None
        return TroopCardDefinition(
            definition_id=row.definition_id,
            card_type=CardType(row.card_type),
            name=row.name,
            faction=Faction(row.faction),
            card_class=CardClass(row.card_class),
            base_power=row.base_power,
        )

    async def list_troop_definitions(self) -> list[TroopCardDefinition]:
        from sqlmodel import select

        result = await self._session.execute(select(TroopCardDefinitionTable))
        rows = result.scalars().all()
        return [
            TroopCardDefinition(
                definition_id=row.definition_id,
                card_type=CardType(row.card_type),
                name=row.name,
                faction=Faction(row.faction),
                card_class=CardClass(row.card_class),
                base_power=row.base_power,
            )
            for row in rows
        ]

    # ── Stub implementations for types without tables yet ─────────
    # These return empty results until their table models are added.

    async def get_hero_definition(
        self, definition_id: str
    ) -> HeroCardDefinition | None:
        return None

    async def list_hero_definitions(self) -> list[HeroCardDefinition]:
        return []

    async def get_general_definition(
        self, definition_id: str
    ) -> GeneralCardDefinition | None:
        return None

    async def list_general_definitions(self) -> list[GeneralCardDefinition]:
        return []

    async def get_relic_definition(
        self, definition_id: str
    ) -> RelicCardDefinition | None:
        return None

    async def list_relic_definitions(self) -> list[RelicCardDefinition]:
        return []


