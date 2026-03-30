import { Observable } from 'rxjs';
import type { CardInstance, HeroCardInstance } from '@game-forge/shared-schema';

export abstract class CardRepositoryPort {
  abstract saveCardInstance(instance: CardInstance): Observable<void>;
  abstract getCardInstance(instanceId: string): Observable<CardInstance | null>;

  abstract saveHeroInstance(instance: HeroCardInstance): Observable<void>;
  abstract getHeroInstance(instanceId: string): Observable<HeroCardInstance | null>;
}
