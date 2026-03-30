# Game Forge - Army Building Card Game Designer

## Overview
**Game Forge** is a design and testing tool for game designers and developers to iterate on army-building card game mechanics and configurations. The tool allows:
- Testing different game rules and mechanics
- Configuring card decks and their attributes
- Simulating battles with various configurations
- Exporting final configurations for the actual game implementation

Game Forge is distinct from the final game app, but shares domain logic and configuration formats with it.

## Core Mechanics
*To be defined*

## Platform & Technology

### Game Forge (Designer Tool)
- Frontend: Angular + TypeScript
- Backend: *To be determined*
  - FastAPI (Python) with serverless database (Supabase, Firebase, or custom)
  - Or: Traditional FastAPI + database approach
- Deployment: Progressive Web App (PWA) with offline support
- Persistance: Dual implementation strategy
  - Backend service: Remote database (when connected)
  - Local service: DuckDB-WASM (offline/local)
  - DuckDB chosen for:
    - SQL querying for simulation analytics
    - WASM support in browser
    - Consistent abstraction with backend DuckDB (if used)
    - Better than IndexedDB for analytics workloads
  - Allows testing abstraction boundaries early
  - Ensures Forge works without internet connection

### Architecture: Clean Architecture (Uncle Bob)
Game Forge will follow clean architecture principles:
- **Domain Layer:** Game rules, battle mechanics, card logic (shareable with final game)
- **Application Layer:** Use cases, service interfaces (abstracted persistance)
- **Interface Adapters:** API controllers (FastAPI), UI components (Angular)
- **Framework/Driver Layer:** Database, web framework details

### Final Game App
- Will be local-only (no backend required)
- Possible platforms: Web (PWA), Unity, Unreal Engine
- Will reuse domain logic and configuration formats from Game Forge
- Local persistance only (IndexedDB or local file system)

## Gameplay

### Players
- Single player campaign mode vs computer opponent

### Battle Loop
- Campaign: A series of battles
- Battle: Build your army vs opponent's army, compare power to determine winner

### Win Conditions
- Win a battle: Your army's total power > opponent's army power
- Win a campaign: *To be defined* (defeat all opponents? reach final boss?)

### Turn Structure
*To be defined:*
- Simultaneous play or alternating turns?
- Turn limits?
- Card play mechanics?

### Card Types
#### Troop Cards
- Base attributes: faction, class, base power value
- Every troop card has all three attributes
- Represents a military unit (e.g., Human Archers, Dwarf Warriors)
- Deck can have duplicates: e.g., 3x Human Archer in same deck
- Only ability type for troops: level-based bonuses to adjacent units (e.g., level 5 archer gives +3 power to adjacent archers)

### Card Progression & State
- Individual card tracking: Each card instance is tracked separately throughout all campaigns/battles
- Experience & leveling:
  - Cards gain experience when they participate in battles
  - Upon level up: base power increases
  - Leveled cards unlock abilities: e.g., level 5 archer provides +3 power to all adjacent archers
- *To be defined:*
  - Experience gain formula (flat per battle? based on opponent power?)
  - Level cap and power scaling
  - When/how abilities unlock at each level
  - Which cards have which abilities at which levels

### Battlefield
- Predefined slots for card placement
- Cards are placed into these slots during play

### Turn Structure
- Consecutive turns (alternating player/opponent)
- Each turn: player/opponent draws 3 cards, chooses 1 to place on battlefield
- Real-time power feedback: when placing a card, see updated army power immediately
- Battle end condition: *CONFIGURABLE*
  - Option A: Battle ends when all battlefield slots are filled
  - Option B: Battle ends after a fixed number of turns
  - Need to support testing both configurations
- Final scoring: happens at end of battle, highest army power wins

### Battlefield Slots
- Predefined slots with optional modifiers
- Slot modifiers apply bonuses to specific card types:
  - Example: Hill slot → Archers get 2x power
  - Example: Plains slot → Cavalry get 2x power
  - *To be defined:* all slot types and their modifiers

### Army Power Calculation
- Base power: Sum of all troop card power values on battlefield
- Modified power: Apply slot modifiers based on card type/class placement
- Final calculation: Happens at end of battle
- Card interactions: *To be defined* (synergies, buffs between units?)

### Opponent AI
- Behavior: *To be defined* (also draws 3, chooses 1? random selection? strategic?)
- Strategy level: *To be defined* (difficulty scaling?)
- UI Challenge: Fitting both player and opponent battlefields on screen needs exploration

### Progression Between Battles
- Deck building approach: *STILL DEBATING*
  - Option A: Start with full army from battle 1, level them up through campaigns
  - Option B: Start with few cards, unlock new cards by winning battles/completing campaigns
  - Prototype should support testing both approaches
- Card acquisition/unlocking: *To be defined* (if Option B selected)

## Configuration & Testing

### Testing Engine Requirements

#### Phase 1: Battle Balance Testing (Initial Focus)
- Configure individual battles with specific parameters
- Choose battlefield layout
- Choose player deck configuration
- Choose opponent deck configuration
- Run single battles and observe outcomes
- Goal: Find balanced battle configurations

#### Phase 2: Campaign/Journey Testing (Later)
- Define sequence of battles (campaign path)
- Test multiple difficulty paths
- Simulate progression through campaign with different decks/rules
- Goal: Balance overall game progression

#### Simulation & Analytics (Ongoing)
- Run hundreds/thousands of battle simulations
- Collect metrics: win rates, difficulty measurements, balance indicators
- Export statistics for analysis
- Enable data-driven decision making on balance

### Configurable Elements
- Deck composition (which cards, how many copies, starting levels)
- Card attributes (faction, class, base power)
- Battle rules (turn limit vs slots-filled end condition)
- Battlefield layout and slot modifiers
- Card leveling/progression mechanics

### Configuration Format
- File format: *To be defined*
- Storage/sharing mechanism: *To be defined*

### Target Users
- Core partners: *Number and roles*
- Broader testing group: *Yes/No*

### Testing Cadence
*To be defined* (daily, weekly, ad-hoc)

## Architecture

### Clean Architecture Approach
*To be defined*
- Domain layer
- Application layer
- Interface adapters
- Framework/driver layer

### Key Design Patterns
*To be defined*

## Iteration & Workflow

### Design Decision Log
*Decisions and rationale to be captured here as we iterate*

### Known Unknowns / Open Questions
*To be tracked and resolved*
