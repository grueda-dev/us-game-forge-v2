"""Player state domain entities.

Domain entities for player identity and versioned game state.
These are pure Pydantic models — no framework imports allowed
(Constitution Principle I).
"""

from datetime import datetime

from .base import CamelModel as BaseModel
from .enums import CardType


class Player(BaseModel):
    """Identity anchor for a player or simulation profile.

    All player-related aggregates (PlayerState, future billing, stats)
    reference this entity via player_id.
    """

    player_id: str
    name: str
    created_at: datetime


class OwnedCard(BaseModel):
    """A card instance owned by a player.

    Replaces the former CardInstance and HeroCardInstance entities.
    Uses card_type discriminator + optional deployments_remaining
    for hero-specific cross-battle state.
    """

    instance_id: str
    definition_id: str
    card_type: CardType
    level: int = 1
    experience: int = 0
    deployments_remaining: int | None = None


class CardCollection(BaseModel):
    """Value object holding the player's collection of owned cards."""

    cards: list[OwnedCard] = []


class Wallet(BaseModel):
    """Value object tracking the player's currency balances."""

    gold: int = 0


class PlayerState(BaseModel):
    """Root aggregate for a player's versioned game state.

    Stored as immutable snapshots with append-only versioning.
    References a Player via player_id.

    The ``state_type`` field allows future discrimination between
    live progression states (default ``"progression"``) and
    designer-authored battle presets (e.g. ``"battle_preset"``).
    """

    player_id: str
    state_type: str = "progression"
    version: int = 1
    timestamp: datetime
    change_note: str | None = None
    collection: CardCollection = CardCollection()
    active_general_definition_id: str | None = None
    equipped_relic_ids: list[str] = []
    wallet: Wallet = Wallet()

