"""Shared fixtures for SQLModel repository integration tests."""

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

# Import all table models so metadata is populated
from forge_core.adapters.repositories.sqlmodel.models import (  # noqa: F401
    BattleDefinitionTable,
    BattlefieldConfigTable,
    DeckConfigTable,
    PlayerStateTable,
    PlayerTable,
    RulesConfigTable,
    TroopCardDefinitionTable,
)

# PostgreSQL test URL from environment (matches docker-compose)
TEST_POSTGRES_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://forge:forge@localhost:5432/forge",
)


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "postgres: mark test to run against PostgreSQL")


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


@pytest.fixture
async def pg_session():
    """Provide an async session backed by a live PostgreSQL database.

    Requires PostgreSQL to be running (via docker-compose).
    Tables are truncated before each test for isolation.
    Automatically skips if PostgreSQL is not reachable.
    """
    engine = create_async_engine(TEST_POSTGRES_URL, echo=False)

    # Try to connect — skip gracefully if PG is not available
    try:
        async with engine.begin() as conn:
            for table in reversed(SQLModel.metadata.sorted_tables):
                await conn.execute(table.delete())
    except OSError:
        await engine.dispose()
        pytest.skip("PostgreSQL is not available")

    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        yield session

    await engine.dispose()
