"""Player repository port — CRUD operations on player identity/profile."""

from abc import ABC, abstractmethod

from ..entities.player_state import Player


class PlayerRepository(ABC):
    """CRUD operations on player identity/profile.

    The Player entity is the identity anchor for all player-related
    data. Other aggregates (PlayerState, future billing, stats)
    reference Player via player_id.
    """

    @abstractmethod
    async def create(self, player: Player) -> Player:
        """Create a new player.

        The player_id must be unique. Raises ValueError if a player
        with the same player_id already exists.
        Returns the created player.
        """
        ...

    @abstractmethod
    async def get(self, player_id: str) -> Player | None:
        """Get a player by ID. Returns None if not found."""
        ...

    @abstractmethod
    async def list(self) -> list[Player]:
        """List all players."""
        ...

    @abstractmethod
    async def delete(self, player_id: str) -> bool:
        """Delete a player by ID.

        Returns True if the player was deleted, False if not found.
        Does NOT cascade-delete associated PlayerState snapshots.
        """
        ...
