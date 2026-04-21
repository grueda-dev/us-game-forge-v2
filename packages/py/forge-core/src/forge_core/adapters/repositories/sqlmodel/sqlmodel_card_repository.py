"""SQLModel implementation of CardRepository port."""

from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.entities.card import CardInstance, HeroCardInstance, TroopCardDefinition
from ....domain.entities.enums import CardClass, CardType, Faction
from ....domain.ports.card_repository import CardRepository
from .models import CardInstanceTable, HeroCardInstanceTable, TroopCardDefinitionTable


class SqlModelCardRepository(CardRepository):
    """Persists card entities via SQLModel/SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

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

    async def save_troop_definition(self, defn: TroopCardDefinition) -> None:
        """Save a troop card definition (needed to populate test data)."""
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

    # ── Card Instances ────────────────────────────────────────────

    async def save_card_instance(self, instance: CardInstance) -> None:
        existing = await self._session.get(
            CardInstanceTable, instance.instance_id
        )
        if existing:
            existing.definition_id = instance.definition_id
            existing.level = instance.level
            existing.experience = instance.experience
            self._session.add(existing)
        else:
            row = CardInstanceTable(
                instance_id=instance.instance_id,
                definition_id=instance.definition_id,
                level=instance.level,
                experience=instance.experience,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_card_instance(self, instance_id: str) -> CardInstance | None:
        row = await self._session.get(CardInstanceTable, instance_id)
        if row is None:
            return None
        return CardInstance(
            instance_id=row.instance_id,
            definition_id=row.definition_id,
            level=row.level,
            experience=row.experience,
        )

    # ── Hero Instances ────────────────────────────────────────────

    async def save_hero_instance(self, instance: HeroCardInstance) -> None:
        existing = await self._session.get(
            HeroCardInstanceTable, instance.instance_id
        )
        if existing:
            existing.definition_id = instance.definition_id
            existing.deployments_remaining = instance.deployments_remaining
            self._session.add(existing)
        else:
            row = HeroCardInstanceTable(
                instance_id=instance.instance_id,
                definition_id=instance.definition_id,
                deployments_remaining=instance.deployments_remaining,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_hero_instance(self, instance_id: str) -> HeroCardInstance | None:
        row = await self._session.get(HeroCardInstanceTable, instance_id)
        if row is None:
            return None
        return HeroCardInstance(
            instance_id=row.instance_id,
            definition_id=row.definition_id,
            deployments_remaining=row.deployments_remaining,
        )
