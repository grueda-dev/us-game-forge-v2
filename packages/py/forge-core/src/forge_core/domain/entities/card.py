
from .base import CamelModel as BaseModel
from .enums import CardClass, CardType, Faction


class GlobalEffect(BaseModel):
    target_class: CardClass | None = None
    target_faction: Faction | None = None
    multiplier: float


class PassiveEffect(BaseModel):
    type: str
    value: float


class ActiveEffect(BaseModel):
    type: str
    uses_per_battle: int


class TroopCardDefinition(BaseModel):
    definition_id: str
    card_type: CardType = CardType.TROOP
    name: str
    faction: Faction
    card_class: CardClass
    base_power: int


class MercenaryCardDefinition(BaseModel):
    """A mercenary card definition — limited deployments, no leveling."""

    definition_id: str
    card_type: CardType = CardType.MERCENARY
    name: str
    faction: Faction
    card_class: CardClass
    base_power: int
    max_deployments: int


class GeneralCardDefinition(BaseModel):
    definition_id: str
    card_type: CardType = CardType.GENERAL
    name: str
    faction: Faction
    card_class: CardClass
    base_power: int
    global_effect: GlobalEffect


class RelicCardDefinition(BaseModel):
    definition_id: str
    card_type: CardType = CardType.RELIC
    name: str
    passive_effect: PassiveEffect | None = None
    active_effect: ActiveEffect | None = None

