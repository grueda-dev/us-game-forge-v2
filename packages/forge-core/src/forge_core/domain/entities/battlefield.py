from .base import CamelModel as BaseModel

from .enums import CardClass, TerrainType


class GridPosition(BaseModel):
    row: int
    col: int


class TerrainModifier(BaseModel):
    target_class: CardClass
    multiplier: float


class BattlefieldSlot(BaseModel):
    slot_id: str
    position: GridPosition
    terrain_type: TerrainType | None = None
    modifiers: list[TerrainModifier] = []


class BattlefieldGrid(BaseModel):
    rows: int
    cols: int


class BattlefieldConfig(BaseModel):
    id: str
    format_version: str
    name: str
    grid: BattlefieldGrid
    slots: list[BattlefieldSlot]
