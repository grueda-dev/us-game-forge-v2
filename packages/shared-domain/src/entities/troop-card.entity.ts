import { Faction, CardClass, CardType } from '@game-forge/shared-schema';
import { CardInstanceId } from '../value-objects/card-instance-id';

export interface AoeEffect {
  targetClass: CardClass;
  bonusPower: number;
}

export class TroopCardEntity {
  readonly cardType = CardType.TROOP;
  readonly instanceId: CardInstanceId;

  private _level: number;
  private _experience: number;

  constructor(
    public readonly definitionId: string,
    public readonly name: string,
    public readonly faction: Faction,
    public readonly cardClass: CardClass,
    public readonly basePower: number,
    options?: { instanceId?: CardInstanceId; level?: number; experience?: number },
  ) {
    this.instanceId = options?.instanceId ?? CardInstanceId.generate();
    this._level = options?.level ?? 1;
    this._experience = options?.experience ?? 0;
  }

  get level(): number {
    return this._level;
  }

  get experience(): number {
    return this._experience;
  }

  get effectivePower(): number {
    return this.basePower + (this._level - 1) * 2;
  }

  gainExperience(xp: number, levelThresholds: number[]): boolean {
    this._experience += xp;
    const nextThreshold = levelThresholds[this._level];
    if (nextThreshold !== undefined && this._experience >= nextThreshold) {
      this._level++;
      return true;
    }
    return false;
  }

  getAoeEffect(aoeUnlockLevel: number): AoeEffect | null {
    if (this._level < aoeUnlockLevel) {
      return null;
    }
    return {
      targetClass: this.cardClass,
      bonusPower: Math.floor((this._level - aoeUnlockLevel + 1) * 1.5),
    };
  }
}
