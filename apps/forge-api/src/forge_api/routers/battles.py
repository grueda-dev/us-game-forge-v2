from fastapi import APIRouter, Depends, HTTPException

from forge_core.domain.entities.battle import BattleDefinition
from forge_core.domain.ports import BattleRepository

from ..dependencies import get_battle_repo

router = APIRouter(prefix="/api/v1/battles", tags=["battles"])


@router.get("/", response_model=list[BattleDefinition])
async def list_battles(
    repo: BattleRepository = Depends(get_battle_repo),
) -> list[BattleDefinition]:
    return await repo.list_battles()


@router.get("/{battle_id}", response_model=BattleDefinition)
async def get_battle(
    battle_id: str,
    repo: BattleRepository = Depends(get_battle_repo),
) -> BattleDefinition:
    battle = await repo.get_battle(battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    return battle


@router.post("/", status_code=201)
async def save_battle(
    battle: BattleDefinition,
    repo: BattleRepository = Depends(get_battle_repo),
) -> dict[str, str]:
    await repo.save_battle(battle)
    return {"id": battle.id}
