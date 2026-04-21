"""SQLModel table models for database persistence.

These are separate from domain entities to keep the domain layer
free of SQLAlchemy/SQLModel imports (Constitution Principle I).
"""

from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class DeckConfigTable(SQLModel, table=True):
    """Persists DeckConfig domain entities."""

    __tablename__ = "deck_configs"

    id: str = Field(primary_key=True)
    format_version: str
    name: str
    general_definition_id: str
    data: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))


class RulesConfigTable(SQLModel, table=True):
    """Persists RulesConfig domain entities."""

    __tablename__ = "rules_configs"

    id: str = Field(primary_key=True)
    format_version: str
    name: str
    data: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))


class BattlefieldConfigTable(SQLModel, table=True):
    """Persists BattlefieldConfig domain entities."""

    __tablename__ = "battlefield_configs"

    id: str = Field(primary_key=True)
    format_version: str
    name: str
    data: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))


class BattleDefinitionTable(SQLModel, table=True):
    """Persists BattleDefinition domain entities."""

    __tablename__ = "battle_definitions"

    id: str = Field(primary_key=True)
    format_version: str
    name: str
    battlefield_config_id: str
    player_deck_config_id: str
    opponent_deck_config_id: str
    rules_config_id: str
    data: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))


class CardInstanceTable(SQLModel, table=True):
    """Persists CardInstance domain entities (all scalar fields)."""

    __tablename__ = "card_instances"

    instance_id: str = Field(primary_key=True)
    definition_id: str
    level: int = 1
    experience: int = 0


class HeroCardInstanceTable(SQLModel, table=True):
    """Persists HeroCardInstance domain entities (all scalar fields)."""

    __tablename__ = "hero_card_instances"

    instance_id: str = Field(primary_key=True)
    definition_id: str
    deployments_remaining: int


class TroopCardDefinitionTable(SQLModel, table=True):
    """Persists TroopCardDefinition domain entities (all scalar fields)."""

    __tablename__ = "troop_card_definitions"

    definition_id: str = Field(primary_key=True)
    card_type: str
    name: str
    faction: str
    card_class: str
    base_power: int
