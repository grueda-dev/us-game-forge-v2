from typing import Literal

from .base import CamelModel as BaseModel


class BattleEndCondition(BaseModel):
    type: Literal["ALL_SLOTS_FILLED", "TURN_LIMIT"]
    turn_limit: int | None = None


class BattleDefinition(BaseModel):
    id: str
    format_version: str
    name: str
    battlefield_config_id: str
    player_deck_config_id: str
    opponent_deck_config_id: str
    rules_config_id: str
    end_condition: BattleEndCondition
