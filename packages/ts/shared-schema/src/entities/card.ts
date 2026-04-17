import { Faction } from '../enums/faction';
import { CardClass } from '../enums/card-class';
import { CardType } from '../enums/card-type';

/** Base card definition — shared attributes across all card types */
export interface CardDefinition {
  definitionId: string;
  cardType: CardType;
  name: string;
  faction: Faction;
  cardClass: CardClass;
  basePower: number;
}

/** A troop card definition */
export interface TroopCardDefinition extends CardDefinition {
  cardType: CardType.TROOP;
}

/** A hero card definition */
export interface HeroCardDefinition extends CardDefinition {
  cardType: CardType.HERO;
  maxDeployments: number;
}

/** A general card definition */
export interface GeneralCardDefinition extends CardDefinition {
  cardType: CardType.GENERAL;
  globalEffect: GlobalEffect;
}

/** A relic card definition */
export interface RelicCardDefinition {
  definitionId: string;
  cardType: CardType.RELIC;
  name: string;
  passiveEffect: PassiveEffect | null;
  activeEffect: ActiveEffect | null;
}

/** Effect applied globally by a general */
export interface GlobalEffect {
  targetClass: CardClass | null;
  targetFaction: Faction | null;
  multiplier: number;
}

/** Passive relic effect active for the entire battle */
export interface PassiveEffect {
  type: string;
  value: number;
}

/** Active relic effect with limited uses per battle */
export interface ActiveEffect {
  type: string;
  usesPerBattle: number;
}

/** A card instance — a specific copy of a card in a player's collection */
export interface CardInstance {
  instanceId: string;
  definitionId: string;
  level: number;
  experience: number;
}

/** A hero card instance with deployment tracking */
export interface HeroCardInstance {
  instanceId: string;
  definitionId: string;
  deploymentsRemaining: number;
}
