"""Integration tests for SqlModelCardDefinitionRepository."""

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_card_definition_repository import (
    SqlModelCardDefinitionRepository,
)
from forge_core.domain.entities.card import TroopCardDefinition
from forge_core.domain.entities.enums import CardClass, CardType, Faction


@pytest.fixture
def repo(async_session):
    return SqlModelCardDefinitionRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelCardDefinitionRepository(pg_session)


def _make_troop_def() -> TroopCardDefinition:
    return TroopCardDefinition(
        definition_id="troop-001",
        card_type=CardType.TROOP,
        name="Elven Archer",
        faction=Faction.ELF,
        card_class=CardClass.ARCHER,
        base_power=15,
    )


# ── Troop Definitions ────────────────────────────────────────────


async def test_save_and_get_troop_definition(repo):
    defn = _make_troop_def()
    await repo.save_troop_definition(defn)
    result = await repo.get_troop_definition("troop-001")

    assert result is not None
    assert result.definition_id == "troop-001"
    assert result.name == "Elven Archer"
    assert result.faction == Faction.ELF
    assert result.card_class == CardClass.ARCHER
    assert result.base_power == 15


async def test_get_missing_troop_definition(repo):
    assert await repo.get_troop_definition("nonexistent") is None


async def test_list_troop_definitions_empty(repo):
    result = await repo.list_troop_definitions()
    assert result == []


async def test_list_troop_definitions_with_data(repo):
    await repo.save_troop_definition(_make_troop_def())
    await repo.save_troop_definition(
        TroopCardDefinition(
            definition_id="troop-002",
            card_type=CardType.TROOP,
            name="Dwarf Warrior",
            faction=Faction.DWARF,
            card_class=CardClass.WARRIOR,
            base_power=20,
        )
    )
    result = await repo.list_troop_definitions()
    assert len(result) == 2


# ── Stub methods ─────────────────────────────────────────────────


async def test_mercenary_stub_returns_none(repo):
    assert await repo.get_mercenary_definition("mercenary-001") is None
    assert await repo.list_mercenary_definitions() == []


async def test_general_stub_returns_none(repo):
    assert await repo.get_general_definition("gen-001") is None
    assert await repo.list_general_definitions() == []


async def test_relic_stub_returns_none(repo):
    assert await repo.get_relic_definition("relic-001") is None
    assert await repo.list_relic_definitions() == []


# ── PostgreSQL Tests ──────────────────────────────────────────────


@pytest.mark.postgres
class TestPostgresCardDefinitionRepository:
    async def test_save_and_get_troop_definition(self, pg_repo):
        defn = _make_troop_def()
        await pg_repo.save_troop_definition(defn)
        result = await pg_repo.get_troop_definition("troop-001")
        assert result is not None
        assert result.name == "Elven Archer"
        assert result.faction == Faction.ELF
        assert result.base_power == 15

    async def test_list_troop_definitions(self, pg_repo):
        await pg_repo.save_troop_definition(_make_troop_def())
        result = await pg_repo.list_troop_definitions()
        assert len(result) == 1
