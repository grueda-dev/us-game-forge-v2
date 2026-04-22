"""In-memory implementation of PlayerRepository."""

from ...domain.entities.player_state import Player
from ...domain.ports.player_repository import PlayerRepository


class MemoryPlayerRepository(PlayerRepository):
    """In-memory player identity store for testing."""

    def __init__(self) -> None:
        self._players: dict[str, Player] = {}

    async def create(self, player: Player) -> Player:
        if player.player_id in self._players:
            raise ValueError(f"Player with id '{player.player_id}' already exists")
        self._players[player.player_id] = player
        return player

    async def get(self, player_id: str) -> Player | None:
        return self._players.get(player_id)

    async def list(self) -> list[Player]:
        return list(self._players.values())

    async def delete(self, player_id: str) -> bool:
        if player_id in self._players:
            del self._players[player_id]
            return True
        return False
