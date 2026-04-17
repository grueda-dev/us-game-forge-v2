from ...domain.entities.battle import BattleDefinition
from ...domain.ports.battle_repository import BattleRepository


class MemoryBattleRepository(BattleRepository):
    def __init__(self) -> None:
        self._battles: dict[str, BattleDefinition] = {}

    async def save_battle(self, battle: BattleDefinition) -> None:
        self._battles[battle.id] = battle

    async def get_battle(self, battle_id: str) -> BattleDefinition | None:
        return self._battles.get(battle_id)

    async def list_battles(self) -> list[BattleDefinition]:
        return list(self._battles.values())
