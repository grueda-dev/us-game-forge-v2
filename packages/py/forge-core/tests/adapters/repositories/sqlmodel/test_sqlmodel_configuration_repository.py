"""Integration tests for SqlModelConfigurationRepository."""

import pytest

from forge_core.adapters.repositories.sqlmodel.sqlmodel_configuration_repository import (
    SqlModelConfigurationRepository,
)
from forge_core.domain.entities.battlefield import (
    BattlefieldConfig,
    BattlefieldGrid,
    BattlefieldSlot,
    GridPosition,
    TerrainModifier,
)
from forge_core.domain.entities.configuration import (
    DeckConfig,
    DeckHeroEntry,
    DeckTroopEntry,
    PowerCalculationConfig,
    RulesConfig,
    TurnConfig,
    XpConfig,
)
from forge_core.domain.entities.enums import CardClass, PowerCalculationStep, TerrainType


@pytest.fixture
def repo(async_session):
    return SqlModelConfigurationRepository(async_session)


@pytest.fixture
def pg_repo(pg_session):
    return SqlModelConfigurationRepository(pg_session)


# ── Deck Config ───────────────────────────────────────────────────


def _make_deck(deck_id: str = "deck-1", name: str = "Test Deck") -> DeckConfig:
    return DeckConfig(
        id=deck_id,
        format_version="1.0",
        name=name,
        general_definition_id="general-001",
        troop_entries=[
            DeckTroopEntry(definition_id="troop-001", quantity=3),
            DeckTroopEntry(definition_id="troop-002", quantity=2),
        ],
        hero_entries=[DeckHeroEntry(definition_id="hero-001")],
        relic_definition_ids=["relic-001"],
    )


async def test_save_and_get_deck_config(repo):
    deck = _make_deck()
    await repo.save_deck_config(deck)
    result = await repo.get_deck_config("deck-1")

    assert result is not None
    assert result.id == "deck-1"
    assert result.name == "Test Deck"
    assert result.general_definition_id == "general-001"
    assert len(result.troop_entries) == 2
    assert result.troop_entries[0].definition_id == "troop-001"
    assert result.troop_entries[0].quantity == 3
    assert len(result.hero_entries) == 1
    assert result.relic_definition_ids == ["relic-001"]


async def test_upsert_deck_config(repo):
    deck = _make_deck()
    await repo.save_deck_config(deck)

    updated = _make_deck(name="Updated Deck")
    await repo.save_deck_config(updated)

    result = await repo.get_deck_config("deck-1")
    assert result is not None
    assert result.name == "Updated Deck"


async def test_list_deck_configs(repo):
    await repo.save_deck_config(_make_deck("deck-1", "Deck One"))
    await repo.save_deck_config(_make_deck("deck-2", "Deck Two"))

    results = await repo.list_deck_configs()
    assert len(results) == 2
    names = {r.name for r in results}
    assert names == {"Deck One", "Deck Two"}


async def test_get_missing_deck_config(repo):
    result = await repo.get_deck_config("nonexistent")
    assert result is None


# ── Rules Config ──────────────────────────────────────────────────


def _make_rules(rules_id: str = "rules-1", name: str = "Test Rules") -> RulesConfig:
    return RulesConfig(
        id=rules_id,
        format_version="1.0",
        name=name,
        power_calculation=PowerCalculationConfig(
            step_order=[
                PowerCalculationStep.BASE_POWER,
                PowerCalculationStep.SLOT_MODIFIER,
                PowerCalculationStep.GENERAL_BONUS,
            ],
            step_multipliers={PowerCalculationStep.SLOT_MODIFIER: 1.5},
        ),
        xp_config=XpConfig(
            base_xp_per_battle=10,
            bonus_xp_for_win=5,
            level_thresholds=[100, 250, 500],
        ),
        turn_config=TurnConfig(cards_drawn_per_turn=3, turn_limit_if_applicable=20),
    )


async def test_save_and_get_rules_config(repo):
    rules = _make_rules()
    await repo.save_rules_config(rules)
    result = await repo.get_rules_config("rules-1")

    assert result is not None
    assert result.name == "Test Rules"
    assert len(result.power_calculation.step_order) == 3
    assert result.power_calculation.step_multipliers[PowerCalculationStep.SLOT_MODIFIER] == 1.5
    assert result.xp_config.level_thresholds == [100, 250, 500]
    assert result.turn_config.turn_limit_if_applicable == 20


async def test_upsert_rules_config(repo):
    await repo.save_rules_config(_make_rules())
    await repo.save_rules_config(_make_rules(name="Updated Rules"))

    result = await repo.get_rules_config("rules-1")
    assert result is not None
    assert result.name == "Updated Rules"


async def test_list_rules_configs(repo):
    await repo.save_rules_config(_make_rules("r1", "Rules One"))
    await repo.save_rules_config(_make_rules("r2", "Rules Two"))

    results = await repo.list_rules_configs()
    assert len(results) == 2


async def test_get_missing_rules_config(repo):
    assert await repo.get_rules_config("nonexistent") is None


# ── Battlefield Config ────────────────────────────────────────────


def _make_battlefield(
    bf_id: str = "bf-1", name: str = "Test Battlefield"
) -> BattlefieldConfig:
    return BattlefieldConfig(
        id=bf_id,
        format_version="1.0",
        name=name,
        grid=BattlefieldGrid(rows=3, cols=3),
        slots=[
            BattlefieldSlot(
                slot_id="slot-0-0",
                position=GridPosition(row=0, col=0),
                terrain_type=TerrainType.HILL,
                modifiers=[
                    TerrainModifier(target_class=CardClass.ARCHER, multiplier=1.3),
                ],
            ),
            BattlefieldSlot(
                slot_id="slot-1-1",
                position=GridPosition(row=1, col=1),
                terrain_type=TerrainType.FOREST,
                modifiers=[],
            ),
        ],
    )


async def test_save_and_get_battlefield_config(repo):
    bf = _make_battlefield()
    await repo.save_battlefield_config(bf)
    result = await repo.get_battlefield_config("bf-1")

    assert result is not None
    assert result.name == "Test Battlefield"
    assert result.grid.rows == 3
    assert result.grid.cols == 3
    assert len(result.slots) == 2
    assert result.slots[0].terrain_type == TerrainType.HILL
    assert result.slots[0].modifiers[0].target_class == CardClass.ARCHER
    assert result.slots[0].modifiers[0].multiplier == 1.3


async def test_upsert_battlefield_config(repo):
    await repo.save_battlefield_config(_make_battlefield())
    await repo.save_battlefield_config(_make_battlefield(name="Updated BF"))

    result = await repo.get_battlefield_config("bf-1")
    assert result is not None
    assert result.name == "Updated BF"


async def test_list_battlefield_configs(repo):
    await repo.save_battlefield_config(_make_battlefield("bf-1"))
    await repo.save_battlefield_config(_make_battlefield("bf-2"))

    results = await repo.list_battlefield_configs()
    assert len(results) == 2


async def test_get_missing_battlefield_config(repo):
    assert await repo.get_battlefield_config("nonexistent") is None


# ── PostgreSQL Tests ──────────────────────────────────────────────
# Same tests, running against live PostgreSQL via pg_repo fixture


@pytest.mark.postgres
class TestPostgresConfigurationRepository:
    async def test_save_and_get_deck_config(self, pg_repo):
        deck = _make_deck()
        await pg_repo.save_deck_config(deck)
        result = await pg_repo.get_deck_config("deck-1")
        assert result is not None
        assert result.id == "deck-1"
        assert result.name == "Test Deck"
        assert len(result.troop_entries) == 2
        assert result.relic_definition_ids == ["relic-001"]

    async def test_upsert_deck_config(self, pg_repo):
        await pg_repo.save_deck_config(_make_deck())
        await pg_repo.save_deck_config(_make_deck(name="Updated Deck"))
        result = await pg_repo.get_deck_config("deck-1")
        assert result is not None
        assert result.name == "Updated Deck"

    async def test_list_deck_configs(self, pg_repo):
        await pg_repo.save_deck_config(_make_deck("deck-1", "Deck One"))
        await pg_repo.save_deck_config(_make_deck("deck-2", "Deck Two"))
        results = await pg_repo.list_deck_configs()
        assert len(results) == 2

    async def test_get_missing_deck_config(self, pg_repo):
        assert await pg_repo.get_deck_config("nonexistent") is None

    async def test_save_and_get_rules_config(self, pg_repo):
        rules = _make_rules()
        await pg_repo.save_rules_config(rules)
        result = await pg_repo.get_rules_config("rules-1")
        assert result is not None
        assert result.name == "Test Rules"
        assert len(result.power_calculation.step_order) == 3
        assert result.xp_config.level_thresholds == [100, 250, 500]

    async def test_save_and_get_battlefield_config(self, pg_repo):
        bf = _make_battlefield()
        await pg_repo.save_battlefield_config(bf)
        result = await pg_repo.get_battlefield_config("bf-1")
        assert result is not None
        assert result.grid.rows == 3
        assert result.slots[0].terrain_type == TerrainType.HILL
        assert result.slots[0].modifiers[0].multiplier == 1.3
