from forge_core.domain.entities import (
    BattleDefinition,
    BattleEndCondition,
    BattlefieldConfig,
    BattlefieldSlot,
    CardClass,
    CardType,
    DeckConfig,
    Faction,
    GeneralCardDefinition,
    GlobalEffect,
    GridPosition,
    HeroCardDefinition,
    HeroCardInstance,
    CardInstance,
    PowerCalculationConfig,
    PowerCalculationStep,
    RelicCardDefinition,
    RulesConfig,
    TerrainModifier,
    TerrainType,
    TroopCardDefinition,
    TurnConfig,
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
        assert CardType.HERO == "HERO"
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


class TestHeroCardDefinition:
    def test_create(self):
        hero = HeroCardDefinition(
            definition_id="hero-01",
            name="Iron Commander",
            faction=Faction.HUMAN,
            card_class=CardClass.INFANTRY,
            base_power=25,
            max_deployments=3,
        )
        assert hero.card_type == CardType.HERO
        assert hero.max_deployments == 3


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


class TestCardInstance:
    def test_create_defaults(self):
        instance = CardInstance(instance_id="ci_001", definition_id="troop-01")
        assert instance.level == 1
        assert instance.experience == 0

    def test_create_with_state(self):
        instance = CardInstance(
            instance_id="ci_002",
            definition_id="troop-01",
            level=5,
            experience=450,
        )
        assert instance.level == 5
        assert instance.experience == 450


class TestHeroCardInstance:
    def test_create(self):
        instance = HeroCardInstance(
            instance_id="hi_001",
            definition_id="hero-01",
            deployments_remaining=2,
        )
        assert instance.deployments_remaining == 2


class TestBattlefieldConfig:
    def test_create(self):
        config = BattlefieldConfig(
            id="bf-01",
            format_version="1.0",
            name="Highland Grid",
            rows=3,
            cols=4,
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
        assert config.rows == 3
        assert config.cols == 4
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
        from forge_core.domain.entities.configuration import DeckTroopEntry, DeckHeroEntry

        deck = DeckConfig(
            id="deck-01",
            format_version="1.0",
            name="Cavalry Rush",
            general_definition_id="general-01",
            troop_entries=[
                DeckTroopEntry(definition_id="troop-cavalry-01", quantity=3),
                DeckTroopEntry(definition_id="troop-archer-01", quantity=2),
            ],
            hero_entries=[DeckHeroEntry(definition_id="hero-01")],
            relic_definition_ids=["relic-01"],
        )
        assert len(deck.troop_entries) == 2
        assert deck.troop_entries[0].quantity == 3
        assert len(deck.hero_entries) == 1
