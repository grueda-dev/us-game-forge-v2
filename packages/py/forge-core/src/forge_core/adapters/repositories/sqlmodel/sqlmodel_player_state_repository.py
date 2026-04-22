"""SQLModel implementation of PlayerStateRepository port."""

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ....domain.entities.player_state import PlayerState
from ....domain.ports.player_state_repository import PlayerStateRepository
from .models import PlayerStateTable


class SqlModelPlayerStateRepository(PlayerStateRepository):
    """Append-only versioned persistence via SQLModel/SQLAlchemy.

    Stores the full PlayerState as a JSON blob in the `data` column.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, state: PlayerState) -> PlayerState:
        # Determine next version
        result = await self._session.execute(
            select(PlayerStateTable.version)
            .where(PlayerStateTable.player_id == state.player_id)
            .order_by(PlayerStateTable.version.desc())  # type: ignore[attr-defined]
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        next_version = (latest or 0) + 1
        now = datetime.now(UTC)

        saved = state.model_copy(
            update={
                "version": next_version,
                "timestamp": now,
            }
        )

        row = PlayerStateTable(
            player_id=saved.player_id,
            version=next_version,
            timestamp=now.isoformat(),
            change_note=saved.change_note,
            data=saved.model_dump(mode="json"),
        )
        self._session.add(row)
        await self._session.commit()
        return saved

    async def load(
        self, player_id: str, version: int | None = None
    ) -> PlayerState | None:
        if version is None:
            # Get latest version
            result = await self._session.execute(
                select(PlayerStateTable)
                .where(PlayerStateTable.player_id == player_id)
                .order_by(PlayerStateTable.version.desc())  # type: ignore[attr-defined]
                .limit(1)
            )
            row = result.scalar_one_or_none()
        else:
            row = await self._session.get(
                PlayerStateTable, (player_id, version)
            )

        if row is None:
            return None

        return PlayerState.model_validate(row.data)

    async def list_versions(self, player_id: str) -> list[int]:
        result = await self._session.execute(
            select(PlayerStateTable.version)
            .where(PlayerStateTable.player_id == player_id)
            .order_by(PlayerStateTable.version.asc())  # type: ignore[attr-defined]
        )
        return list(result.scalars().all())
