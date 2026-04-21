import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

DEFAULT_DATABASE_URL = "sqlite+aiosqlite:///./forge.db"


def _load_dotenv() -> None:
    """Attempt to load .env file if python-dotenv is available."""
    try:
        from dotenv import load_dotenv

        # Walk up from cwd looking for .env
        load_dotenv()
    except ImportError:
        pass


_load_dotenv()


def get_database_url() -> str:
    """Return the database URL from environment or default to SQLite."""
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)


def create_engine(database_url: str | None = None):
    """Create an async database engine.

    Args:
        database_url: Database connection string. If None, reads from
            DATABASE_URL env var or defaults to local SQLite.
    """
    url = database_url or get_database_url()

    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    return create_async_engine(url, echo=False, connect_args=connect_args)


def create_session_factory(engine) -> async_sessionmaker[AsyncSession]:
    """Create an async session factory bound to the given engine."""
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session."""
    async with session_factory() as session:
        yield session


# Convenience: module-level metadata reference for Alembic
metadata = SQLModel.metadata
