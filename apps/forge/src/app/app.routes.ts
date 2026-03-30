import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'battle', pathMatch: 'full' },
  {
    path: 'deck-builder',
    loadComponent: () =>
      import('./ui/deck-builder/deck-builder.component').then((m) => m.DeckBuilderComponent),
  },
  {
    path: 'battle',
    loadComponent: () =>
      import('./ui/battle-configurator/battle-configurator.component').then(
        (m) => m.BattleConfiguratorComponent,
      ),
  },
  {
    path: 'battle/play',
    loadComponent: () =>
      import('./ui/battle-player/battle-player.component').then((m) => m.BattlePlayerComponent),
  },
  {
    path: 'battle/result',
    loadComponent: () =>
      import('./ui/battle-result/battle-result.component').then((m) => m.BattleResultComponent),
  },
];
