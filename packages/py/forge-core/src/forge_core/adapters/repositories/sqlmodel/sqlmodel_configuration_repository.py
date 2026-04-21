"""SQLModel implementation of ConfigurationRepository port."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ....domain.entities.battlefield import BattlefieldConfig
from ....domain.entities.configuration import DeckConfig, RulesConfig
from ....domain.ports.configuration_repository import ConfigurationRepository
from .models import BattlefieldConfigTable, DeckConfigTable, RulesConfigTable


class SqlModelConfigurationRepository(ConfigurationRepository):
    """Persists configuration entities via SQLModel/SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Deck Configs ──────────────────────────────────────────────

    async def save_deck_config(self, config: DeckConfig) -> None:
        data = config.model_dump()
        existing = await self._session.get(DeckConfigTable, config.id)
        if existing:
            existing.format_version = config.format_version
            existing.name = config.name
            existing.general_definition_id = config.general_definition_id
            existing.data = data
            self._session.add(existing)
        else:
            row = DeckConfigTable(
                id=config.id,
                format_version=config.format_version,
                name=config.name,
                general_definition_id=config.general_definition_id,
                data=data,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_deck_config(self, config_id: str) -> DeckConfig | None:
        row = await self._session.get(DeckConfigTable, config_id)
        if row is None:
            return None
        return DeckConfig.model_validate(row.data)

    async def list_deck_configs(self) -> list[DeckConfig]:
        result = await self._session.execute(select(DeckConfigTable))
        rows = result.scalars().all()
        return [DeckConfig.model_validate(row.data) for row in rows]

    # ── Rules Configs ─────────────────────────────────────────────

    async def save_rules_config(self, config: RulesConfig) -> None:
        data = config.model_dump()
        existing = await self._session.get(RulesConfigTable, config.id)
        if existing:
            existing.format_version = config.format_version
            existing.name = config.name
            existing.data = data
            self._session.add(existing)
        else:
            row = RulesConfigTable(
                id=config.id,
                format_version=config.format_version,
                name=config.name,
                data=data,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_rules_config(self, config_id: str) -> RulesConfig | None:
        row = await self._session.get(RulesConfigTable, config_id)
        if row is None:
            return None
        return RulesConfig.model_validate(row.data)

    async def list_rules_configs(self) -> list[RulesConfig]:
        result = await self._session.execute(select(RulesConfigTable))
        rows = result.scalars().all()
        return [RulesConfig.model_validate(row.data) for row in rows]

    # ── Battlefield Configs ───────────────────────────────────────

    async def save_battlefield_config(self, config: BattlefieldConfig) -> None:
        data = config.model_dump()
        existing = await self._session.get(BattlefieldConfigTable, config.id)
        if existing:
            existing.format_version = config.format_version
            existing.name = config.name
            existing.data = data
            self._session.add(existing)
        else:
            row = BattlefieldConfigTable(
                id=config.id,
                format_version=config.format_version,
                name=config.name,
                data=data,
            )
            self._session.add(row)
        await self._session.commit()

    async def get_battlefield_config(self, config_id: str) -> BattlefieldConfig | None:
        row = await self._session.get(BattlefieldConfigTable, config_id)
        if row is None:
            return None
        return BattlefieldConfig.model_validate(row.data)

    async def list_battlefield_configs(self) -> list[BattlefieldConfig]:
        result = await self._session.execute(select(BattlefieldConfigTable))
        rows = result.scalars().all()
        return [BattlefieldConfig.model_validate(row.data) for row in rows]
