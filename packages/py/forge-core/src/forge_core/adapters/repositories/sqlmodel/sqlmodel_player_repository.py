"""SQLModel implementation of PlayerRepository port."""

from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from ....domain.entities.player_state import Player
from ....domain.ports.player_repository import PlayerRepository
from .models import PlayerTable


class SqlModelPlayerRepository(PlayerRepository):
    """Persists Player entities via SQLModel/SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, player: Player) -> Player:
        existing = await self._session.get(PlayerTable, player.player_id)
        if existing:
            raise ValueError(f"Player with id '{player.player_id}' already exists")

        row = PlayerTable(
            player_id=player.player_id,
            name=player.name,
            created_at=player.created_at.isoformat(),
        )
        self._session.add(row)
        await self._session.commit()
        return player

    async def get(self, player_id: str) -> Player | None:
        row = await self._session.get(PlayerTable, player_id)
        if row is None:
            return None
        return Player(
            player_id=row.player_id,
            name=row.name,
            created_at=datetime.fromisoformat(row.created_at),
        )

    async def list(self) -> list[Player]:
        result = await self._session.execute(select(PlayerTable))
        rows = result.scalars().all()
        return [
            Player(
                player_id=row.player_id,
                name=row.name,
                created_at=datetime.fromisoformat(row.created_at),
            )
            for row in rows
        ]

    async def delete(self, player_id: str) -> bool:
        row = await self._session.get(PlayerTable, player_id)
        if row is None:
            return False
        await self._session.delete(row)
        await self._session.commit()
        return True
