"""Dependency injection for forge-api.

Provides SQLModel-backed repository instances using async database sessions.
"""

from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from forge_core.adapters.repositories import (
    SqlModelBattleRepository,
    SqlModelCardRepository,
    SqlModelConfigurationRepository,
)
from forge_core.domain.ports import BattleRepository, CardRepository, ConfigurationRepository
from forge_core.infrastructure.database import create_engine, create_session_factory

# Module-level engine and session factory — created once at import time
_engine = create_engine()
_session_factory = create_session_factory(_engine)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for a single request."""
    async with _session_factory() as session:
        yield session


async def get_config_repo(
    session: AsyncSession = Depends(get_async_session),
) -> ConfigurationRepository:
    return SqlModelConfigurationRepository(session)


async def get_battle_repo(
    session: AsyncSession = Depends(get_async_session),
) -> BattleRepository:
    return SqlModelBattleRepository(session)


async def get_card_repo(
    session: AsyncSession = Depends(get_async_session),
) -> CardRepository:
    return SqlModelCardRepository(session)
