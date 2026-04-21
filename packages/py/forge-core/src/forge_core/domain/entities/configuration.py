from .base import CamelModel as BaseModel
from .enums import PowerCalculationStep


class PowerCalculationConfig(BaseModel):
    step_order: list[PowerCalculationStep]
    step_multipliers: dict[PowerCalculationStep, float] = {}


class XpConfig(BaseModel):
    base_xp_per_battle: int
    bonus_xp_for_win: int
    level_thresholds: list[int]


class TurnConfig(BaseModel):
    cards_drawn_per_turn: int = 3
    turn_limit_if_applicable: int | None = None


class DeckTroopEntry(BaseModel):
    definition_id: str
    quantity: int


class DeckHeroEntry(BaseModel):
    definition_id: str


class DeckConfig(BaseModel):
    id: str
    format_version: str
    name: str
    general_definition_id: str
    troop_entries: list[DeckTroopEntry]
    hero_entries: list[DeckHeroEntry] = []
    relic_definition_ids: list[str] = []


class RulesConfig(BaseModel):
    id: str
    format_version: str
    name: str
    power_calculation: PowerCalculationConfig
    xp_config: XpConfig
    turn_config: TurnConfig
