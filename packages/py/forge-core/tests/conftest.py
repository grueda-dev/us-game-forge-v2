"""Shared fixtures for SQLModel repository integration tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

# Import all table models so metadata is populated
from forge_core.adapters.repositories.sqlmodel.models import (  # noqa: F401
    BattleDefinitionTable,
    BattlefieldConfigTable,
    CardInstanceTable,
    DeckConfigTable,
    HeroCardInstanceTable,
    RulesConfigTable,
    TroopCardDefinitionTable,
)


@pytest.fixture
async def async_session():
    """Provide an async session backed by an in-memory SQLite database.

    Creates all tables before each test and drops them after.
    Each test gets a clean database.
    """
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        echo=False,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

    await engine.dispose()
