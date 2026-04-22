"""In-memory implementation of PlayerStateRepository."""

from copy import deepcopy
from datetime import UTC, datetime

from ...domain.entities.player_state import PlayerState
from ...domain.ports.player_state_repository import PlayerStateRepository


class MemoryPlayerStateRepository(PlayerStateRepository):
    """In-memory append-only versioned player state store for testing."""

    def __init__(self) -> None:
        # {player_id: {version: PlayerState}}
        self._states: dict[str, dict[int, PlayerState]] = {}

    async def save(self, state: PlayerState) -> PlayerState:
        player_id = state.player_id
        if player_id not in self._states:
            self._states[player_id] = {}

        next_version = max(self._states[player_id].keys(), default=0) + 1
        now = datetime.now(UTC)

        saved = state.model_copy(
            update={
                "version": next_version,
                "timestamp": now,
            }
        )
        self._states[player_id][next_version] = deepcopy(saved)
        return saved

    async def load(
        self, player_id: str, version: int | None = None
    ) -> PlayerState | None:
        player_versions = self._states.get(player_id)
        if not player_versions:
            return None

        if version is None:
            latest_version = max(player_versions.keys())
            return deepcopy(player_versions[latest_version])

        snapshot = player_versions.get(version)
        return deepcopy(snapshot) if snapshot else None

    async def list_versions(self, player_id: str) -> list[int]:
        player_versions = self._states.get(player_id)
        if not player_versions:
            return []
        return sorted(player_versions.keys())
