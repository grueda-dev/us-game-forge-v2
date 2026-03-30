from pydantic import BaseModel, Field

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


class HeroCardDefinition(BaseModel):
    definition_id: str
    card_type: CardType = CardType.HERO
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


class CardInstance(BaseModel):
    instance_id: str
    definition_id: str
    level: int = 1
    experience: int = 0


class HeroCardInstance(BaseModel):
    instance_id: str
    definition_id: str
    deployments_remaining: int
