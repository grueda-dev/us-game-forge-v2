import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Faction, CardClass,
  type DeckConfig,
  type DeckTroopEntry,
} from '@game-forge/shared-schema';
import { ConfigurationRepositoryPort } from '../../domain/ports/configuration-repository.port';

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './deck-builder.component.html',
  styleUrl: './deck-builder.component.scss',
})
export class DeckBuilderComponent {
  readonly factions = Object.values(Faction);
  readonly cardClasses = Object.values(CardClass);

  savedDecks = signal<DeckConfig[]>([]);

  deckName = '';
  troopEntries = signal<{ definitionId: string; faction: string; cardClass: string; quantity: number }[]>([]);

  constructor(private configRepo: ConfigurationRepositoryPort) {
    this.loadDecks();
  }

  addTroopEntry(): void {
    this.troopEntries.update((entries) => [
      ...entries,
      { definitionId: '', faction: Faction.HUMAN, cardClass: CardClass.INFANTRY, quantity: 1 },
    ]);
  }

  removeTroopEntry(index: number): void {
    this.troopEntries.update((entries) => entries.filter((_, i) => i !== index));
  }

  updateEntry(index: number, field: string, value: string | number): void {
    this.troopEntries.update((entries) => {
      const updated = [...entries];
      updated[index] = { ...updated[index], [field]: value };
      // Auto-generate definitionId from faction + class
      const e = updated[index];
      e.definitionId = `troop-${e.faction.toLowerCase()}-${e.cardClass.toLowerCase()}`;
      return updated;
    });
  }

  saveDeck(): void {
    if (!this.deckName.trim()) return;

    const deck: DeckConfig = {
      id: `deck_${Date.now().toString(36)}`,
      formatVersion: '1.0',
      name: this.deckName,
      generalDefinitionId: '',
      troopEntries: this.troopEntries().map((e) => ({
        definitionId: e.definitionId,
        quantity: e.quantity,
      })),
      heroEntries: [],
      relicDefinitionIds: [],
    };

    this.configRepo.saveDeckConfig(deck).subscribe(() => {
      this.deckName = '';
      this.troopEntries.set([]);
      this.loadDecks();
    });
  }

  private loadDecks(): void {
    this.configRepo.listDeckConfigs().subscribe((decks) => {
      this.savedDecks.set(decks);
    });
  }

  totalCards(): number {
    return this.troopEntries().reduce((sum, e) => sum + e.quantity, 0);
  }
}
