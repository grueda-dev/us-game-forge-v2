"""Integration tests for SqlModelPlayerRepository."""

from datetime import UTC, datetime

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_player_repository import (
    SqlModelPlayerRepository,
)
from forge_core.domain.entities.player_state import Player


@pytest.fixture
def repo(async_session):
    return SqlModelPlayerRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelPlayerRepository(pg_session)


def _make_player(player_id: str = "p1", name: str = "Test Player") -> Player:
    return Player(
        player_id=player_id,
        name=name,
        created_at=datetime.now(UTC),
    )


# ── Create ────────────────────────────────────────────────────────


async def test_create_player(repo):
    player = _make_player()
    result = await repo.create(player)
    assert result.player_id == "p1"
    assert result.name == "Test Player"


async def test_create_duplicate_player_raises(repo):
    player = _make_player()
    await repo.create(player)
    with pytest.raises(ValueError, match="already exists"):
        await repo.create(player)


# ── Get ───────────────────────────────────────────────────────────


async def test_get_player(repo):
    player = _make_player()
    await repo.create(player)
    result = await repo.get("p1")
    assert result is not None
    assert result.player_id == "p1"
    assert result.name == "Test Player"


async def test_get_missing_player(repo):
    assert await repo.get("nonexistent") is None


# ── List ──────────────────────────────────────────────────────────


async def test_list_empty(repo):
    result = await repo.list()
    assert result == []


async def test_list_multiple(repo):
    await repo.create(_make_player("p1", "Alice"))
    await repo.create(_make_player("p2", "Bob"))
    result = await repo.list()
    assert len(result) == 2
    ids = {p.player_id for p in result}
    assert ids == {"p1", "p2"}


# ── Delete ────────────────────────────────────────────────────────


async def test_delete_player(repo):
    await repo.create(_make_player())
    assert await repo.delete("p1") is True
    assert await repo.get("p1") is None


async def test_delete_missing_player(repo):
    assert await repo.delete("nonexistent") is False


# ── PostgreSQL Tests ──────────────────────────────────────────────


@pytest.mark.postgres
class TestPostgresPlayerRepository:
    async def test_create_and_get(self, pg_repo):
        player = _make_player()
        await pg_repo.create(player)
        result = await pg_repo.get("p1")
        assert result is not None
        assert result.name == "Test Player"

    async def test_list_players(self, pg_repo):
        await pg_repo.create(_make_player("p1", "Alice"))
        await pg_repo.create(_make_player("p2", "Bob"))
        result = await pg_repo.list()
        assert len(result) == 2

    async def test_delete_player(self, pg_repo):
        await pg_repo.create(_make_player())
        assert await pg_repo.delete("p1") is True
        assert await pg_repo.get("p1") is None
