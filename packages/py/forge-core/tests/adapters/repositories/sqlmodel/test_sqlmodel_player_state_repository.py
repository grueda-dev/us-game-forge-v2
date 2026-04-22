"""Integration tests for SqlModelPlayerStateRepository."""

from datetime import UTC, datetime

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_player_state_repository import (
    SqlModelPlayerStateRepository,
)
from forge_core.domain.entities.enums import CardType
from forge_core.domain.entities.player_state import (
    CardCollection,
    OwnedCard,
    PlayerState,
    Wallet,
)


@pytest.fixture
def repo(async_session):
    return SqlModelPlayerStateRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelPlayerStateRepository(pg_session)


def _make_state(
    player_id: str = "p1",
    gold: int = 100,
    change_note: str | None = None,
) -> PlayerState:
    return PlayerState(
        player_id=player_id,
        timestamp=datetime.now(UTC),
        change_note=change_note,
        collection=CardCollection(
            cards=[
                OwnedCard(
                    instance_id="oc-1",
                    definition_id="troop-01",
                    card_type=CardType.TROOP,
                    level=3,
                    experience=250,
                ),
                OwnedCard(
                    instance_id="oc-2",
                    definition_id="hero-01",
                    card_type=CardType.HERO,
                    deployments_remaining=2,
                ),
            ]
        ),
        active_general_definition_id="general-01",
        equipped_relic_ids=["relic-01", "relic-02"],
        wallet=Wallet(gold=gold),
    )


# ── Save and Load ────────────────────────────────────────────────


async def test_save_assigns_version(repo):
    state = _make_state()
    saved = await repo.save(state)
    assert saved.version == 1
    assert saved.timestamp is not None


async def test_save_increments_version(repo):
    state = _make_state()
    v1 = await repo.save(state)
    v2 = await repo.save(state)
    v3 = await repo.save(state)
    assert v1.version == 1
    assert v2.version == 2
    assert v3.version == 3


async def test_save_preserves_change_note(repo):
    state = _make_state(change_note="Battle #42 completed")
    await repo.save(state)
    loaded = await repo.load("p1")
    assert loaded is not None
    assert loaded.change_note == "Battle #42 completed"


async def test_load_latest_version(repo):
    await repo.save(_make_state(gold=100))
    await repo.save(_make_state(gold=200))
    await repo.save(_make_state(gold=300))

    latest = await repo.load("p1")
    assert latest is not None
    assert latest.version == 3
    assert latest.wallet.gold == 300


async def test_load_specific_version(repo):
    await repo.save(_make_state(gold=100, change_note="Initial state"))
    await repo.save(_make_state(gold=200, change_note="Won battle"))
    await repo.save(_make_state(gold=300, change_note="Purchased card"))

    v1 = await repo.load("p1", version=1)
    v2 = await repo.load("p1", version=2)
    assert v1 is not None
    assert v1.wallet.gold == 100
    assert v1.change_note == "Initial state"
    assert v2 is not None
    assert v2.wallet.gold == 200
    assert v2.change_note == "Won battle"


async def test_load_preserves_all_fields(repo):
    state = _make_state(gold=100)
    await repo.save(state)
    loaded = await repo.load("p1")

    assert loaded is not None
    assert loaded.player_id == "p1"
    assert len(loaded.collection.cards) == 2
    assert loaded.collection.cards[0].instance_id == "oc-1"
    assert loaded.collection.cards[0].level == 3
    assert loaded.collection.cards[0].experience == 250
    assert loaded.collection.cards[1].deployments_remaining == 2
    assert loaded.active_general_definition_id == "general-01"
    assert loaded.equipped_relic_ids == ["relic-01", "relic-02"]
    assert loaded.wallet.gold == 100


async def test_load_missing_player(repo):
    assert await repo.load("nonexistent") is None


async def test_load_missing_version(repo):
    await repo.save(_make_state())
    assert await repo.load("p1", version=999) is None


# ── Version History ──────────────────────────────────────────────


async def test_list_versions(repo):
    await repo.save(_make_state())
    await repo.save(_make_state())
    await repo.save(_make_state())

    versions = await repo.list_versions("p1")
    assert versions == [1, 2, 3]


async def test_list_versions_empty(repo):
    assert await repo.list_versions("nonexistent") == []


# ── Immutability ─────────────────────────────────────────────────


async def test_historical_versions_immutable(repo):
    """SC-008: Loading version 1 after further saves returns the original unchanged."""
    await repo.save(_make_state(gold=100, change_note="Initial"))
    await repo.save(_make_state(gold=200, change_note="Won battle"))
    await repo.save(_make_state(gold=300, change_note="Purchased card"))

    v1 = await repo.load("p1", version=1)
    assert v1 is not None
    assert v1.wallet.gold == 100
    assert v1.change_note == "Initial"


# ── Multi-player isolation ───────────────────────────────────────


async def test_multiple_players(repo):
    await repo.save(_make_state(player_id="p1", gold=100))
    await repo.save(_make_state(player_id="p2", gold=200))

    p1 = await repo.load("p1")
    p2 = await repo.load("p2")
    assert p1 is not None and p1.wallet.gold == 100
    assert p2 is not None and p2.wallet.gold == 200


# ── Empty collection edge case ───────────────────────────────────


async def test_save_empty_collection(repo):
    state = PlayerState(
        player_id="p1",
        timestamp=datetime.now(UTC),
    )
    await repo.save(state)
    loaded = await repo.load("p1")
    assert loaded is not None
    assert loaded.collection.cards == []
    assert loaded.wallet.gold == 0


# ── PostgreSQL Tests ──────────────────────────────────────────────


@pytest.mark.postgres
class TestPostgresPlayerStateRepository:
    async def test_save_and_load(self, pg_repo):
        state = _make_state(gold=500)
        await pg_repo.save(state)
        loaded = await pg_repo.load("p1")
        assert loaded is not None
        assert loaded.wallet.gold == 500
        assert loaded.version == 1

    async def test_versioning(self, pg_repo):
        await pg_repo.save(_make_state(gold=100))
        await pg_repo.save(_make_state(gold=200))
        latest = await pg_repo.load("p1")
        assert latest is not None
        assert latest.version == 2
        assert latest.wallet.gold == 200

        v1 = await pg_repo.load("p1", version=1)
        assert v1 is not None
        assert v1.wallet.gold == 100

    async def test_list_versions(self, pg_repo):
        await pg_repo.save(_make_state())
        await pg_repo.save(_make_state())
        versions = await pg_repo.list_versions("p1")
        assert versions == [1, 2]
