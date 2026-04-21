"""Integration tests for SqlModelCardRepository."""

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_card_repository import (
    SqlModelCardRepository,
)
from forge_core.domain.entities.card import (
    CardInstance,
    HeroCardInstance,
    TroopCardDefinition,
)
from forge_core.domain.entities.enums import CardClass, CardType, Faction


@pytest.fixture
def repo(async_session):
    return SqlModelCardRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelCardRepository(pg_session)


# ── Troop Definitions ────────────────────────────────────────────


def _make_troop_def() -> TroopCardDefinition:
    return TroopCardDefinition(
        definition_id="troop-001",
        card_type=CardType.TROOP,
        name="Elven Archer",
        faction=Faction.ELF,
        card_class=CardClass.ARCHER,
        base_power=15,
    )


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


# ── Card Instances ────────────────────────────────────────────────


async def test_save_and_get_card_instance(repo):
    instance = CardInstance(
        instance_id="card-inst-001",
        definition_id="troop-001",
        level=3,
        experience=150,
    )
    await repo.save_card_instance(instance)
    result = await repo.get_card_instance("card-inst-001")

    assert result is not None
    assert result.instance_id == "card-inst-001"
    assert result.definition_id == "troop-001"
    assert result.level == 3
    assert result.experience == 150


async def test_upsert_card_instance(repo):
    instance = CardInstance(
        instance_id="card-inst-001",
        definition_id="troop-001",
        level=1,
        experience=0,
    )
    await repo.save_card_instance(instance)

    leveled_up = CardInstance(
        instance_id="card-inst-001",
        definition_id="troop-001",
        level=2,
        experience=100,
    )
    await repo.save_card_instance(leveled_up)

    result = await repo.get_card_instance("card-inst-001")
    assert result is not None
    assert result.level == 2
    assert result.experience == 100


async def test_get_missing_card_instance(repo):
    assert await repo.get_card_instance("nonexistent") is None


# ── Hero Instances ────────────────────────────────────────────────


async def test_save_and_get_hero_instance(repo):
    hero = HeroCardInstance(
        instance_id="hero-inst-001",
        definition_id="hero-001",
        deployments_remaining=5,
    )
    await repo.save_hero_instance(hero)
    result = await repo.get_hero_instance("hero-inst-001")

    assert result is not None
    assert result.instance_id == "hero-inst-001"
    assert result.definition_id == "hero-001"
    assert result.deployments_remaining == 5


async def test_upsert_hero_instance(repo):
    hero = HeroCardInstance(
        instance_id="hero-inst-001",
        definition_id="hero-001",
        deployments_remaining=5,
    )
    await repo.save_hero_instance(hero)

    used = HeroCardInstance(
        instance_id="hero-inst-001",
        definition_id="hero-001",
        deployments_remaining=3,
    )
    await repo.save_hero_instance(used)

    result = await repo.get_hero_instance("hero-inst-001")
    assert result is not None
    assert result.deployments_remaining == 3


async def test_get_missing_hero_instance(repo):
    assert await repo.get_hero_instance("nonexistent") is None


# ── PostgreSQL Tests ──────────────────────────────────────────────


@pytest.mark.postgres
class TestPostgresCardRepository:
    async def test_save_and_get_troop_definition(self, pg_repo):
        defn = _make_troop_def()
        await pg_repo.save_troop_definition(defn)
        result = await pg_repo.get_troop_definition("troop-001")
        assert result is not None
        assert result.name == "Elven Archer"
        assert result.faction == Faction.ELF
        assert result.base_power == 15

    async def test_save_and_get_card_instance(self, pg_repo):
        instance = CardInstance(
            instance_id="card-inst-001",
            definition_id="troop-001",
            level=3,
            experience=150,
        )
        await pg_repo.save_card_instance(instance)
        result = await pg_repo.get_card_instance("card-inst-001")
        assert result is not None
        assert result.level == 3
        assert result.experience == 150

    async def test_save_and_get_hero_instance(self, pg_repo):
        hero = HeroCardInstance(
            instance_id="hero-inst-001",
            definition_id="hero-001",
            deployments_remaining=5,
        )
        await pg_repo.save_hero_instance(hero)
        result = await pg_repo.get_hero_instance("hero-inst-001")
        assert result is not None
        assert result.deployments_remaining == 5

    async def test_get_missing_card_instance(self, pg_repo):
        assert await pg_repo.get_card_instance("nonexistent") is None
