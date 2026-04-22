from datetime import UTC, datetime

from forge_core.domain.entities import (
    BattleDefinition,
    BattleEndCondition,
    BattlefieldConfig,
    BattlefieldSlot,
    CardClass,
    CardCollection,
    CardType,
    DeckConfig,
    Faction,
    GeneralCardDefinition,
    GlobalEffect,
    GridPosition,
    MercenaryCardDefinition,
    OwnedCard,
    Player,
    PlayerState,
    PowerCalculationConfig,
    PowerCalculationStep,
    RelicCardDefinition,
    RulesConfig,
    TerrainModifier,
    TerrainType,
    TroopCardDefinition,
    TurnConfig,
    Wallet,
    XpConfig,
)


class TestEnums:
    def test_faction_values(self):
        assert Faction.HUMAN == "HUMAN"
        assert Faction.DWARF == "DWARF"

    def test_card_class_values(self):
        assert CardClass.ARCHER == "ARCHER"
        assert CardClass.CAVALRY == "CAVALRY"

    def test_card_type_values(self):
        assert CardType.TROOP == "TROOP"
        assert CardType.MERCENARY == "MERCENARY"
        assert CardType.GENERAL == "GENERAL"
        assert CardType.RELIC == "RELIC"

    def test_power_calculation_step_values(self):
        assert PowerCalculationStep.BASE_POWER == "BASE_POWER"
        assert PowerCalculationStep.AOE_BONUS == "AOE_BONUS"


class TestTroopCardDefinition:
    def test_create(self):
        troop = TroopCardDefinition(
            definition_id="troop-archer-01",
            name="Human Archers",
            faction=Faction.HUMAN,
            card_class=CardClass.ARCHER,
            base_power=10,
        )
        assert troop.card_type == CardType.TROOP
        assert troop.faction == Faction.HUMAN
        assert troop.card_class == CardClass.ARCHER
        assert troop.base_power == 10

    def test_serialization_roundtrip(self):
        troop = TroopCardDefinition(
            definition_id="troop-01",
            name="Test",
            faction=Faction.DWARF,
            card_class=CardClass.WARRIOR,
            base_power=15,
        )
        data = troop.model_dump()
        restored = TroopCardDefinition.model_validate(data)
        assert restored == troop


class TestMercenaryCardDefinition:
    def test_create(self):
        mercenary = MercenaryCardDefinition(
            definition_id="mercenary-01",
            name="Iron Commander",
            faction=Faction.HUMAN,
            card_class=CardClass.INFANTRY,
            base_power=25,
            max_deployments=3,
        )
        assert mercenary.card_type == CardType.MERCENARY
        assert mercenary.max_deployments == 3


class TestGeneralCardDefinition:
    def test_create_with_global_effect(self):
        general = GeneralCardDefinition(
            definition_id="general-01",
            name="War Chief",
            faction=Faction.ORC,
            card_class=CardClass.WARRIOR,
            base_power=5,
            global_effect=GlobalEffect(
                target_class=CardClass.INFANTRY,
                multiplier=2.0,
            ),
        )
        assert general.card_type == CardType.GENERAL
        assert general.global_effect.target_class == CardClass.INFANTRY
        assert general.global_effect.multiplier == 2.0


class TestRelicCardDefinition:
    def test_create_minimal(self):
        relic = RelicCardDefinition(
            definition_id="relic-01",
            name="War Banner",
        )
        assert relic.card_type == CardType.RELIC
        assert relic.passive_effect is None
        assert relic.active_effect is None


class TestPlayer:
    def test_create(self):
        now = datetime.now(UTC)
        player = Player(player_id="p1", name="Test Player", created_at=now)
        assert player.player_id == "p1"
        assert player.name == "Test Player"
        assert player.created_at == now

    def test_serialization_roundtrip(self):
        now = datetime.now(UTC)
        player = Player(player_id="p1", name="Test Player", created_at=now)
        data = player.model_dump()
        restored = Player.model_validate(data)
        assert restored == player


class TestOwnedCard:
    def test_create_troop_defaults(self):
        card = OwnedCard(
            instance_id="oc-001",
            definition_id="troop-01",
            card_type=CardType.TROOP,
        )
        assert card.level == 1
        assert card.experience == 0
        assert card.deployments_remaining is None

    def test_create_mercenary_with_deployments(self):
        card = OwnedCard(
            instance_id="oc-002",
            definition_id="mercenary-01",
            card_type=CardType.MERCENARY,
            level=3,
            experience=250,
            deployments_remaining=2,
        )
        assert card.card_type == CardType.MERCENARY
        assert card.level == 3
        assert card.experience == 250
        assert card.deployments_remaining == 2

    def test_serialization_roundtrip(self):
        card = OwnedCard(
            instance_id="oc-003",
            definition_id="mercenary-01",
            card_type=CardType.MERCENARY,
            level=3,
            experience=250,
            deployments_remaining=1,
        )
        data = card.model_dump()
        restored = OwnedCard.model_validate(data)
        assert restored == card


class TestCardCollection:
    def test_empty_default(self):
        collection = CardCollection()
        assert collection.cards == []

    def test_with_cards(self):
        cards = [
            OwnedCard(
                instance_id="oc-1", definition_id="troop-01",
                card_type=CardType.TROOP,
            ),
            OwnedCard(
                instance_id="oc-2", definition_id="mercenary-01",
                card_type=CardType.MERCENARY, deployments_remaining=3,
            ),
        ]
        collection = CardCollection(cards=cards)
        assert len(collection.cards) == 2


class TestWallet:
    def test_defaults(self):
        wallet = Wallet()
        assert wallet.gold == 0

    def test_with_gold(self):
        wallet = Wallet(gold=500)
        assert wallet.gold == 500


class TestPlayerState:
    def test_create_defaults(self):
        now = datetime.now(UTC)
        state = PlayerState(player_id="p1", timestamp=now)
        assert state.player_id == "p1"
        assert state.state_type == "progression"
        assert state.version == 1
        assert state.timestamp == now
        assert state.change_note is None
        assert state.collection.cards == []
        assert state.active_general_definition_id is None
        assert state.equipped_relic_ids == []
        assert state.wallet.gold == 0

    def test_battle_preset_type(self):
        now = datetime.now(UTC)
        state = PlayerState(
            player_id="p1",
            state_type="battle_preset",
            timestamp=now,
        )
        assert state.state_type == "battle_preset"


    def test_create_with_data(self):
        now = datetime.now(UTC)
        state = PlayerState(
            player_id="p1",
            version=3,
            timestamp=now,
            change_note="Battle #42 completed",
            collection=CardCollection(
                cards=[
                    OwnedCard(
                        instance_id="oc-1", definition_id="troop-01",
                        card_type=CardType.TROOP, level=5, experience=450,
                    ),
                    OwnedCard(
                        instance_id="oc-2", definition_id="mercenary-01",
                        card_type=CardType.MERCENARY, deployments_remaining=2,
                    ),
                ]
            ),
            active_general_definition_id="general-01",
            equipped_relic_ids=["relic-01", "relic-02"],
            wallet=Wallet(gold=100),
        )
        assert state.version == 3
        assert state.change_note == "Battle #42 completed"
        assert len(state.collection.cards) == 2
        assert state.active_general_definition_id == "general-01"
        assert len(state.equipped_relic_ids) == 2
        assert state.wallet.gold == 100

    def test_serialization_roundtrip(self):
        now = datetime.now(UTC)
        state = PlayerState(
            player_id="p1",
            version=2,
            timestamp=now,
            change_note="Card troop-01 gained 50 XP",
            collection=CardCollection(
                cards=[
                    OwnedCard(
                        instance_id="oc-1", definition_id="troop-01",
                        card_type=CardType.TROOP, level=3, experience=250,
                    ),
                ]
            ),
            active_general_definition_id="general-01",
            equipped_relic_ids=["relic-01"],
            wallet=Wallet(gold=75),
        )
        data = state.model_dump()
        restored = PlayerState.model_validate(data)
        assert restored == state
        assert restored.change_note == "Card troop-01 gained 50 XP"
        assert restored.timestamp == now

    def test_empty_collection_valid(self):
        """Edge case: a new player starts with nothing."""
        now = datetime.now(UTC)
        state = PlayerState(player_id="p1", timestamp=now)
        data = state.model_dump()
        restored = PlayerState.model_validate(data)
        assert restored.collection.cards == []

    def test_duplicate_definition_ids_valid(self):
        """Edge case: player can own multiple copies of same card type."""
        now = datetime.now(UTC)
        state = PlayerState(
            player_id="p1",
            timestamp=now,
            collection=CardCollection(
                cards=[
                    OwnedCard(
                        instance_id="oc-1", definition_id="troop-01",
                        card_type=CardType.TROOP,
                    ),
                    OwnedCard(
                        instance_id="oc-2", definition_id="troop-01",
                        card_type=CardType.TROOP,
                    ),
                ]
            ),
        )
        assert len(state.collection.cards) == 2
        assert state.collection.cards[0].definition_id == state.collection.cards[1].definition_id


class TestBattlefieldConfig:
    def test_create(self):
        from forge_core.domain.entities import BattlefieldGrid

        config = BattlefieldConfig(
            id="bf-01",
            format_version="1.0",
            name="Highland Grid",
            grid=BattlefieldGrid(rows=3, cols=4),
            slots=[
                BattlefieldSlot(
                    slot_id="slot-0-0",
                    position=GridPosition(row=0, col=0),
                    terrain_type=TerrainType.HILL,
                    modifiers=[
                        TerrainModifier(target_class=CardClass.ARCHER, multiplier=2.0),
                    ],
                ),
            ],
        )
        assert config.grid.rows == 3
        assert config.grid.cols == 4
        assert len(config.slots) == 1
        assert config.slots[0].terrain_type == TerrainType.HILL


class TestBattleDefinition:
    def test_create(self):
        battle = BattleDefinition(
            id="battle-01",
            format_version="1.0",
            name="Hill Siege",
            battlefield_config_id="bf-01",
            player_deck_config_id="deck-01",
            opponent_deck_config_id="deck-02",
            rules_config_id="rules-01",
            end_condition=BattleEndCondition(type="ALL_SLOTS_FILLED"),
        )
        assert battle.end_condition.type == "ALL_SLOTS_FILLED"
        assert battle.end_condition.turn_limit is None

    def test_turn_limit_condition(self):
        battle = BattleDefinition(
            id="battle-02",
            format_version="1.0",
            name="Quick Battle",
            battlefield_config_id="bf-01",
            player_deck_config_id="deck-01",
            opponent_deck_config_id="deck-02",
            rules_config_id="rules-01",
            end_condition=BattleEndCondition(type="TURN_LIMIT", turn_limit=10),
        )
        assert battle.end_condition.turn_limit == 10


class TestRulesConfig:
    def test_create(self):
        rules = RulesConfig(
            id="rules-01",
            format_version="1.0",
            name="Standard Rules",
            power_calculation=PowerCalculationConfig(
                step_order=[
                    PowerCalculationStep.BASE_POWER,
                    PowerCalculationStep.AOE_BONUS,
                    PowerCalculationStep.SLOT_MODIFIER,
                    PowerCalculationStep.GENERAL_BONUS,
                ],
            ),
            xp_config=XpConfig(
                base_xp_per_battle=10,
                bonus_xp_for_win=5,
                level_thresholds=[0, 100, 250, 500],
            ),
            turn_config=TurnConfig(cards_drawn_per_turn=3),
        )
        assert len(rules.power_calculation.step_order) == 4
        assert rules.xp_config.base_xp_per_battle == 10
        assert rules.turn_config.cards_drawn_per_turn == 3

    def test_serialization_roundtrip(self):
        rules = RulesConfig(
            id="rules-01",
            format_version="1.0",
            name="Test Rules",
            power_calculation=PowerCalculationConfig(
                step_order=[PowerCalculationStep.BASE_POWER],
                step_multipliers={PowerCalculationStep.BASE_POWER: 1.5},
            ),
            xp_config=XpConfig(
                base_xp_per_battle=10,
                bonus_xp_for_win=5,
                level_thresholds=[0, 100],
            ),
            turn_config=TurnConfig(),
        )
        data = rules.model_dump()
        restored = RulesConfig.model_validate(data)
        assert restored == rules


class TestDeckConfig:
    def test_create(self):
        from forge_core.domain.entities.configuration import DeckMercenaryEntry, DeckTroopEntry

        deck = DeckConfig(
            id="deck-01",
            format_version="1.0",
            name="Cavalry Rush",
            general_definition_id="general-01",
            troop_entries=[
                DeckTroopEntry(definition_id="troop-cavalry-01", quantity=3),
                DeckTroopEntry(definition_id="troop-archer-01", quantity=2),
            ],
            mercenary_entries=[DeckMercenaryEntry(definition_id="mercenary-01")],
            relic_definition_ids=["relic-01"],
        )
        assert len(deck.troop_entries) == 2
        assert deck.troop_entries[0].quantity == 3
        assert len(deck.mercenary_entries) == 1
