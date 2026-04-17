from fastapi import APIRouter, Depends, HTTPException

from forge_core.domain.entities.battlefield import BattlefieldConfig
from forge_core.domain.entities.configuration import DeckConfig, RulesConfig
from forge_core.domain.ports import ConfigurationRepository

from ..dependencies import get_config_repo

router = APIRouter(prefix="/api/v1/configurations", tags=["configurations"])


# --- Deck Configs ---


@router.get("/decks", response_model=list[DeckConfig])
async def list_deck_configs(
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> list[DeckConfig]:
    return await repo.list_deck_configs()


@router.get("/decks/{config_id}", response_model=DeckConfig)
async def get_deck_config(
    config_id: str,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> DeckConfig:
    config = await repo.get_deck_config(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Deck config not found")
    return config


@router.post("/decks", status_code=201)
async def save_deck_config(
    config: DeckConfig,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> dict[str, str]:
    await repo.save_deck_config(config)
    return {"id": config.id}


# --- Rules Configs ---


@router.get("/rules", response_model=list[RulesConfig])
async def list_rules_configs(
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> list[RulesConfig]:
    return await repo.list_rules_configs()


@router.get("/rules/{config_id}", response_model=RulesConfig)
async def get_rules_config(
    config_id: str,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> RulesConfig:
    config = await repo.get_rules_config(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Rules config not found")
    return config


@router.post("/rules", status_code=201)
async def save_rules_config(
    config: RulesConfig,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> dict[str, str]:
    await repo.save_rules_config(config)
    return {"id": config.id}


# --- Battlefield Configs ---


@router.get("/battlefields", response_model=list[BattlefieldConfig])
async def list_battlefield_configs(
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> list[BattlefieldConfig]:
    return await repo.list_battlefield_configs()


@router.get("/battlefields/{config_id}", response_model=BattlefieldConfig)
async def get_battlefield_config(
    config_id: str,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> BattlefieldConfig:
    config = await repo.get_battlefield_config(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Battlefield config not found")
    return config


@router.post("/battlefields", status_code=201)
async def save_battlefield_config(
    config: BattlefieldConfig,
    repo: ConfigurationRepository = Depends(get_config_repo),
) -> dict[str, str]:
    await repo.save_battlefield_config(config)
    return {"id": config.id}
