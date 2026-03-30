from abc import ABC, abstractmethod

from ..entities.battle import BattleDefinition


class BattleRepository(ABC):
    @abstractmethod
    async def save_battle(self, battle: BattleDefinition) -> None: ...

    @abstractmethod
    async def get_battle(self, battle_id: str) -> BattleDefinition | None: ...

    @abstractmethod
    async def list_battles(self) -> list[BattleDefinition]: ...
