"""Integration tests for SqlModelBattleRepository."""

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_battle_repository import (
    SqlModelBattleRepository,
)
from forge_core.domain.entities.battle import BattleDefinition, BattleEndCondition


@pytest.fixture
def repo(async_session):
    return SqlModelBattleRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelBattleRepository(pg_session)


def _make_battle(
    battle_id: str = "battle-1", name: str = "Test Battle"
) -> BattleDefinition:
    return BattleDefinition(
        id=battle_id,
        format_version="1.0",
        name=name,
        battlefield_config_id="bf-001",
        player_deck_config_id="deck-001",
        opponent_deck_config_id="deck-002",
        rules_config_id="rules-001",
        end_condition=BattleEndCondition(type="TURN_LIMIT", turn_limit=25),
    )


async def test_save_and_get_battle(repo):
    battle = _make_battle()
    await repo.save_battle(battle)
    result = await repo.get_battle("battle-1")

    assert result is not None
    assert result.id == "battle-1"
    assert result.name == "Test Battle"
    assert result.battlefield_config_id == "bf-001"
    assert result.player_deck_config_id == "deck-001"
    assert result.opponent_deck_config_id == "deck-002"
    assert result.rules_config_id == "rules-001"
    assert result.end_condition.type == "TURN_LIMIT"
    assert result.end_condition.turn_limit == 25


async def test_upsert_battle(repo):
    await repo.save_battle(_make_battle())
    await repo.save_battle(_make_battle(name="Updated Battle"))

    result = await repo.get_battle("battle-1")
    assert result is not None
    assert result.name == "Updated Battle"


async def test_list_battles(repo):
    await repo.save_battle(_make_battle("b1", "Battle One"))
    await repo.save_battle(_make_battle("b2", "Battle Two"))

    results = await repo.list_battles()
    assert len(results) == 2
    names = {r.name for r in results}
    assert names == {"Battle One", "Battle Two"}


async def test_get_missing_battle(repo):
    assert await repo.get_battle("nonexistent") is None


async def test_all_slots_filled_end_condition(repo):
    """Verify ALL_SLOTS_FILLED end condition with no turn_limit round-trips."""
    battle = BattleDefinition(
        id="battle-asf",
        format_version="1.0",
        name="All Slots Battle",
        battlefield_config_id="bf-002",
        player_deck_config_id="deck-003",
        opponent_deck_config_id="deck-004",
        rules_config_id="rules-002",
        end_condition=BattleEndCondition(type="ALL_SLOTS_FILLED"),
    )
    await repo.save_battle(battle)
    result = await repo.get_battle("battle-asf")

    assert result is not None
    assert result.end_condition.type == "ALL_SLOTS_FILLED"
    assert result.end_condition.turn_limit is None


# ── PostgreSQL Tests ──────────────────────────────────────────────


@pytest.mark.postgres
class TestPostgresBattleRepository:
    async def test_save_and_get_battle(self, pg_repo):
        battle = _make_battle()
        await pg_repo.save_battle(battle)
        result = await pg_repo.get_battle("battle-1")
        assert result is not None
        assert result.id == "battle-1"
        assert result.end_condition.type == "TURN_LIMIT"
        assert result.end_condition.turn_limit == 25

    async def test_upsert_battle(self, pg_repo):
        await pg_repo.save_battle(_make_battle())
        await pg_repo.save_battle(_make_battle(name="Updated Battle"))
        result = await pg_repo.get_battle("battle-1")
        assert result is not None
        assert result.name == "Updated Battle"

    async def test_list_battles(self, pg_repo):
        await pg_repo.save_battle(_make_battle("b1", "Battle One"))
        await pg_repo.save_battle(_make_battle("b2", "Battle Two"))
        results = await pg_repo.list_battles()
        assert len(results) == 2

    async def test_get_missing_battle(self, pg_repo):
        assert await pg_repo.get_battle("nonexistent") is None
