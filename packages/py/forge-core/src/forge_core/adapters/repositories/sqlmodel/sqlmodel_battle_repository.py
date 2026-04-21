"""SQLModel implementation of BattleRepository port."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ....domain.entities.battle import BattleDefinition
from ....domain.ports.battle_repository import BattleRepository
from .models import BattleDefinitionTable


class SqlModelBattleRepository(BattleRepository):
    """Persists battle definition entities via SQLModel/SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save_battle(self, battle: BattleDefinition) -> None:
        data = battle.model_dump()
        existing = await self._session.get(BattleDefinitionTable, battle.id)
        if existing:
            existing.format_version = battle.format_version
            existing.name = battle.name
            existing.battlefield_config_id = battle.battlefield_config_id
            existing.player_deck_config_id = battle.player_deck_config_id
            existing.opponent_deck_config_id = battle.opponent_deck_config_id
            existing.rules_config_id = battle.rules_config_id
            existing.data = data
            self._session.add(existing)
        else:
            row = BattleDefinitionTable(
                id=battle.id,
                format_version=battle.format_version,
                name=battle.name,
                battlefield_config_id=battle.battlefield_config_id,
                player_deck_config_id=battle.player_deck_config_id,
                opponent_deck_config_id=battle.opponent_deck_config_id,
                rules_config_id=battle.rules_config_id,
                data=data,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_battle(self, battle_id: str) -> BattleDefinition | None:
        row = await self._session.get(BattleDefinitionTable, battle_id)
        if row is None:
            return None
        return BattleDefinition.model_validate(row.data)

    async def list_battles(self) -> list[BattleDefinition]:
        result = await self._session.execute(select(BattleDefinitionTable))
        rows = result.scalars().all()
        return [BattleDefinition.model_validate(row.data) for row in rows]
