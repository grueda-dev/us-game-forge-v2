import { Faction, CardClass, CardType } from '@game-forge/shared-schema';
import { CardInstanceId } from '../value-objects/card-instance-id';
import type { AoeEffect } from './troop-card.entity';

export class MercenaryCardEntity {
  readonly cardType = CardType.MERCENARY;
  readonly instanceId: CardInstanceId;

  private _deploymentsRemaining: number;

  constructor(
    public readonly definitionId: string,
    public readonly name: string,
    public readonly faction: Faction,
    public readonly cardClass: CardClass,
    public readonly basePower: number,
    public readonly maxDeployments: number,
    public readonly aoeEffect: AoeEffect | null,
    options?: { instanceId?: CardInstanceId; deploymentsRemaining?: number },
  ) {
    this.instanceId = options?.instanceId ?? CardInstanceId.generate();
    this._deploymentsRemaining = options?.deploymentsRemaining ?? maxDeployments;
  }

  get deploymentsRemaining(): number {
    return this._deploymentsRemaining;
  }

  get isExhausted(): boolean {
    return this._deploymentsRemaining <= 0;
  }

  get effectivePower(): number {
    return this.basePower;
  }

  deploy(): void {
    if (this.isExhausted) {
      throw new Error(`Mercenary "${this.name}" has no deployments remaining`);
    }
    this._deploymentsRemaining--;
  }

  getAoeEffect(): AoeEffect | null {
    return this.aoeEffect;
  }
}
