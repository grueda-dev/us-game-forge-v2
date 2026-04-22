import { Observable } from 'rxjs';
import type { CardInstance, MercenaryCardInstance } from '@game-forge/shared-schema';

export abstract class CardRepositoryPort {
  abstract saveCardInstance(instance: CardInstance): Observable<void>;
  abstract getCardInstance(instanceId: string): Observable<CardInstance | null>;

  abstract saveMercenaryInstance(instance: MercenaryCardInstance): Observable<void>;
  abstract getMercenaryInstance(instanceId: string): Observable<MercenaryCardInstance | null>;
}
