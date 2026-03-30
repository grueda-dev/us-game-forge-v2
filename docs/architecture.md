# Game Forge — Architecture & Implementation Plan

## Context
Game Forge is a game design and testing tool for an army-building card game. It is distinct from the final game but shares domain logic and configuration formats. The goal is to allow game designers to iterate rapidly on card/battle/rule configurations and run simulations. The final game will be fully local (no backend), so Game Forge must also prove out offline abstractions.

---

## Repository Structure

Monorepo with npm workspaces (Turborepo recommended):

```
game-forge/
├── apps/
│   ├── forge/              # Game Forge design tool (Angular + PixiJS PWA)
│   ├── forge-api/          # Game Forge backend (FastAPI)
│   ├── forge-cli/          # Python CLI for headless batch simulations
│   │                       # Reuses forge-core domain + use cases directly (no browser needed)
│   │                       # Scriptable, CI-friendly, outputs to JSON/CSV for analysis
│   └── game/               # Final web game (PixiJS / Phaser) — if web route chosen
└── packages/
    ├── shared-schema/      # JSON schemas + TypeScript interfaces (no logic)
    │   └── src/
    │       ├── entities/   # Raw data interfaces
    │       ├── enums/      # Faction, CardClass, TerrainType
    │       └── schemas/    # JSON Schema files (deck, battle, battlefield, rules)
    ├── shared-domain/      # Pure TS domain rules — power calc, XP calc, adjacency resolver
    │                       # No Angular, no PixiJS — portable to any JS runtime
    ├── shared-renderer/    # PixiJS rendering components shared between Forge and final game
    │                       # Card rendering, battlefield grid, animations, particle effects
    │                       # Forge's battle preview and final game use identical visuals
    └── forge-core/         # Shared Python library (installable package)
                            # Contains: domain entities, domain rules, port interfaces,
                            # use cases, and repository implementations
                            # forge-api and forge-cli are pure delivery projects that
                            # import from here — no business logic lives in them
```

### What Each Package Shares
| Package | Forge | Final Game | Why |
|---|---|---|---|
| `shared-schema` | Yes | Yes | Config format contract |
| `shared-domain` | Yes | Yes | Game rules must be identical in both |
| `shared-renderer` | Yes | Yes | Designers preview exactly what players see |
| `forge-core` | No | No | Python backend only — final game is local-only |
| `apps/forge` UI components | No | No | Design tool UI serves a different purpose than the game UI |

---

## Clean Architecture Layers (both frontend and backend mirror this)

```
Domain           → entities, value objects, domain rules, port interfaces
Application      → use cases, DTOs, orchestration services
Adapters         → repositories (remote + local), presenters, mappers, API controllers
Infrastructure   → DuckDB-WASM bootstrap, HTTP client, FastAPI setup, DI wiring
UI               → Angular feature modules (no business logic)
```

---

## Key Architectural Decisions

### 1. Dual Persistence via Port Abstraction
All repositories are abstract classes (ports) in the domain layer.
Two implementations exist side by side:
- `remote/` — fetches via HTTP from FastAPI backend
- `local/` — queries DuckDB-WASM in the browser

A single provider file (`persistence-strategy.provider.ts`) wires the correct implementation based on `navigator.onLine` / environment flags.

### 2. Configurable Power Calculation
The `PowerCalculator` is a pure function that takes a `PowerCalculationConfig` with a `stepOrder` array. Designers can reorder steps (BASE_POWER, AOE_BONUS, SLOT_MODIFIER, GENERAL_BONUS) and compare outcomes. This is a first-class feature, not an afterthought.

### 3. Local-First Build Order
Build and test local persistence (DuckDB-WASM) BEFORE building the FastAPI backend. This forces port interfaces to remain genuinely abstract — not contaminated by HTTP concerns.

### 4. Card Instance Identity
A `CardInstanceId` value object is generated for each card placed in a deck. The same card definition can appear multiple times in a deck (no fixed limit — this is a configurable rule); each copy is independently tracked (level, XP, deployments remaining).

---

## Shared Configuration Format (portable to final game)
All config types share a `formatVersion` + `id` envelope. Game Forge exports these; the final game reads them.

### Game Mechanics Configs
- **rules-config** — power calculation step order, XP thresholds, card limits, turn rules
- **battlefield-config** — grid slots with terrain modifiers
- **card-definition-catalog** — master list of all card definitions (troops, heroes, generals, relics) with their attributes

### Deck Configs
- **deck-config** — troop/hero/general/relic selections for a specific deck
- **initial-deck-config** — the starting deck a player receives at game start (links to a deck-config + starting card levels)

### Campaign & Progression Configs
- **campaign-catalog** — ordered list of campaigns, each with:
  - Campaign name, description, implicit difficulty level
  - Ordered list of battles
  - Unlock conditions (e.g., requires completing another campaign)
- **battle-definition** — links deck + battlefield + rules configs; defines opponent deck; specifies end condition
- **reward-config** — rewards granted upon completing a battle or campaign:
  - Currency amount
  - Hero card unlocks
  - Relic card unlocks
  - New campaign/battle unlocks
  - XP bonuses

### What Game Forge Authors
Designers use Game Forge to create and test all of the above, then export the full set as a game content bundle the final game can load.

---

## Game Forge Feature Areas

### 1. Battle Testing (Phase 1)
Configure and play/simulate individual battles. See per-layer power breakdowns.

### 2. Campaign Designer (Phase 2)
Define campaign sequences, battle ordering, unlock conditions, reward structures. Test multiple progression paths.

### 3. Simulation & Analytics (Phase 1+)
Run N headless battle simulations. Collect win rates, power distributions, difficulty metrics.

### 4. Visual Layout Editor (Phase 2+) — integrated into Game Forge
Not a separate app. Layout is part of the configuration context — a battle config can include a layout variant, allowing designers to A/B test "Battle X with Layout A" vs "Battle X with Layout B" within the same tool.

- Drag, rotate, and scale UI elements (battlefield grid, hand area, general display, relic slots, score panel)
- Preview how different layouts fit on screen, including showing both player and opponent battlefields simultaneously
- Layout settings saved as part of the battlefield/battle configuration
- **Rendering: PixiJS** embedded within Game Forge — Angular manages app shell, routing, forms; PixiJS renders the canvas areas (battlefield, battle player view, layout editor)
- Same PixiJS renderer used in Forge and the final web game → design fidelity guaranteed
- TBD: whether layout configs export as position/size JSON or serve as visual reference only

### Rendering Architecture
- **Angular** — app shell, navigation, forms, configuration panels, data management
- **PixiJS** — all canvas-rendered views: battlefield grid, card placement, battle animations, layout editor canvas
- These coexist in one app; Angular components host PixiJS canvases as infrastructure-layer elements
- Domain and application layers remain framework-agnostic (no PixiJS or Angular imports)

### Final Web Game Rendering (if web route is chosen)
- Reuses same PixiJS setup from Forge
- **Phaser** (built on PixiJS) is an option if scene management, physics, or input pipeline is needed
- Enables: GPU-accelerated sprites, particle effects, shader filters, skeletal animations

### 5. Configuration Management
Save, load, tag, and share named configurations (decks, battlefields, rules, campaigns).

### 6. Game Content Export
Export a complete game content bundle (all configs) that the final game loads.

---

## Core Domain Entities
- `TroopCardEntity` — faction, class, basePower, level, experience; adjacency AoE at high levels; N copies allowed per deck (configurable)
- `HeroCardEntity` — faction, class, basePower, deploymentsRemaining; AoE always active; no leveling
- `GeneralCardEntity` — faction, class; global battlefield effects
- `RelicCardEntity` — passive effect + limited active effects per battle
- `BattlefieldEntity` — grid of `BattlefieldSlotEntity` (each slot has optional terrain modifiers)
- `BattleEntity` — tracks turn state, placed cards, end condition, score

---

## Phase 1 Use Cases (Battle Balance Testing)
1. `ConfigureBattleUseCase` — load deck/battlefield/rules configs, instantiate card entities, persist initial battle state
2. `PlayBattleTurnUseCase` — draw 3 cards, place chosen card, return power breakdown per layer
3. `ResolveBattleEndUseCase` — calculate final power, determine winner, award XP
4. `SimulateBattleUseCase` — headless version of above (N iterations)
5. `SaveDeckConfigUseCase` / `LoadDeckConfigUseCase`

---

## Implementation Milestones

### Milestone 0 — Repo Scaffolding
- npm workspaces monorepo with Turborepo
- `packages/shared-schema` with placeholder schemas
- `apps/forge` via `ng new` (standalone, routing, scss)
- `apps/forge-api` FastAPI skeleton with ruff + mypy
- `packages/forge-core` Python package skeleton
- CI stubs (GitHub Actions)

### Milestone 1 — Domain Layer (no external deps)
- All card entities + battlefield entities (TypeScript in `shared-domain`, Python in `forge-core`)
- `PowerCalculator` (configurable step order)
- `XpCalculator`, `AdjacencyResolver`
- Full unit tests (Jest + pytest)

### Milestone 2 — Local Persistence (DuckDB-WASM)
- `DuckDBService` bootstrapped via `APP_INITIALIZER`
- Schema migrations for all entity tables
- `LocalCardRepository`, `LocalBattleRepository`, `LocalConfigurationRepository`
- `PersistenceStrategyProvider` defaulting to `local`

### Milestone 3 — Phase 1 Use Cases
- All 5 use cases above
- Tested against mock repository implementations

### Milestone 4 — Phase 1 UI
- `BattleConfiguratorComponent` — pick decks, battlefield, rules
- `BattlePlayerComponent` — grid, hand, place card, live power display
- `BattleResultComponent` — winner + per-layer power breakdown
- `DeckBuilderComponent` — create/save deck configs

### Milestone 5 — FastAPI Backend + forge-cli
- `forge-core` use cases exposed via `forge-api` (FastAPI routers + DI only)
- `forge-cli` batch simulation commands importing from `forge-core` directly
- `RemoteCardRepository`, `RemoteBattleRepository`, `RemoteConfigurationRepository` in `forge`
- Online/offline switching via `PersistenceStrategyProvider`
- Backend database TBD (Supabase, Firebase, or traditional)

---

## Critical Files (first things to create)
1. `packages/shared-schema/src/schemas/rules-config.schema.json` — all other configs reference this
2. `packages/shared-domain/src/rules/power-calculator.ts` — central domain rule
3. `apps/forge/src/app/infrastructure/providers/persistence-strategy.provider.ts` — dual persistence wiring
4. `apps/forge/src/app/infrastructure/persistence/duckdb/duckdb.service.ts` — DuckDB-WASM bootstrap
5. `apps/forge/src/app/application/use-cases/battle/configure-battle.use-case.ts` — first integration of all layers

---

## Open Questions (carry into implementation)
- Backend: Supabase vs Firebase vs custom FastAPI + DB
- General selection: all owned generals vs random N presented
- Relic selection: deck vs fixed slots
- Deck building: start full vs unlock through progression
- Currency system mechanics
- Opponent AI strategy
- Battle end condition default
