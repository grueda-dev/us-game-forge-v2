from enum import StrEnum


class Faction(StrEnum):
    HUMAN = "HUMAN"
    DWARF = "DWARF"
    ELF = "ELF"
    ORC = "ORC"
    UNDEAD = "UNDEAD"


class CardClass(StrEnum):
    ARCHER = "ARCHER"
    WARRIOR = "WARRIOR"
    CAVALRY = "CAVALRY"
    INFANTRY = "INFANTRY"
    MAGE = "MAGE"


class TerrainType(StrEnum):
    PLAINS = "PLAINS"
    HILL = "HILL"
    FOREST = "FOREST"
    SWAMP = "SWAMP"
    MOUNTAIN = "MOUNTAIN"


class CardType(StrEnum):
    TROOP = "TROOP"
    MERCENARY = "MERCENARY"
    GENERAL = "GENERAL"
    RELIC = "RELIC"


class PowerCalculationStep(StrEnum):
    BASE_POWER = "BASE_POWER"
    AOE_BONUS = "AOE_BONUS"
    SLOT_MODIFIER = "SLOT_MODIFIER"
    GENERAL_BONUS = "GENERAL_BONUS"
