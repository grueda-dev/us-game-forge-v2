"""Alembic migration environment for forge-core.

Reads DATABASE_URL from environment, imports SQLModel table models
so metadata is populated, and runs migrations offline or online.
"""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection

from sqlmodel import SQLModel

# Import all table models so SQLModel.metadata is populated
from forge_core.adapters.repositories.sqlmodel.models import (  # noqa: F401
    BattleDefinitionTable,
    BattlefieldConfigTable,
    CardInstanceTable,
    DeckConfigTable,
    HeroCardInstanceTable,
    RulesConfigTable,
    TroopCardDefinitionTable,
)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from environment if set
database_url = os.environ.get("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# Use SQLModel metadata for autogenerate support
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    from sqlalchemy import create_engine

    url = config.get_main_option("sqlalchemy.url")

    # For Alembic migrations we use synchronous engines.
    # Convert async URLs to sync equivalents.
    sync_url = url
    if sync_url:
        sync_url = sync_url.replace("sqlite+aiosqlite", "sqlite")
        sync_url = sync_url.replace("postgresql+asyncpg", "postgresql")

    connectable = create_engine(
        sync_url,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
