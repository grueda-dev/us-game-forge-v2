let counter = 0;

export class CardInstanceId {
  private constructor(public readonly value: string) {}

  static generate(): CardInstanceId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const seq = (counter++).toString(36);
    return new CardInstanceId(`ci_${timestamp}_${random}_${seq}`);
  }

  static from(value: string): CardInstanceId {
    return new CardInstanceId(value);
  }

  equals(other: CardInstanceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
