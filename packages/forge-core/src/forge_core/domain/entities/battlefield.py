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


class BattlefieldConfig(BaseModel):
    id: str
    format_version: str
    name: str
    rows: int
    cols: int
    slots: list[BattlefieldSlot]
