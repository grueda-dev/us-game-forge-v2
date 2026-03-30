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

#### Hero Cards
- Special limited-use troop cards
- Behave like normal troops: drawn and placed on battlefield just like regular troops
- Attributes: faction, class, base power value (like troops)
- Limited deployments: each hero has a deployment counter
  - Example: Hero with 3 deployments can be played in 3 different battles
  - After final deployment is used, hero is removed from deck permanently
- Power & acquisition:
  - Higher power than regular troops for their acquisition level
  - Campaign-specific rewards or purchasable (see currency system below)
  - Hero power scales with implicit campaign difficulty
- Abilities: Area effects for adjacent cards (like high-level troops)
- Leveling: Heroes do NOT level up (unlike regular troops)
- *To be defined:*
  - Exact power scaling formula
  - Exact area effect mechanics
  - Can you get multiple copies of same hero?

#### General Cards
- Not part of the deck — separate collection
- Selected at battle start (selection method TBD):
  - Option A: Choose from all generals you own
  - Option B: Randomly presented with choice of N generals
- Applied to entire battlefield (global effects)
- Example abilities: "All Infantry x2 power", "All units +1 power"
- Display: TBD (side panel or below battlefield)
- Each battle has exactly one active general (player and opponent both have one)
- Attributes: faction, class (like troops)
- Leveling/experience: *To be defined*
- Unlocking mechanics: *To be defined*

#### Relic Cards
- Don't occupy battlefield slots
- Can have passive effects: e.g., "+25% XP gained this battle"
- Can have active effects (limited use per battle):
  - Move a card to another slot (e.g., 1x per battle)
  - Change terrain type of a slot (e.g., 1x per battle)
  - Draw extra card (e.g., 2x per battle)
  - Other: *To be defined*
- Selection method: *STILL DEBATING*
  - Option A: Build a relic deck, choose which relics to use before battle
  - Option B: Fixed relic slots that are always active, with ability to swap relics at certain progression points
- Opponent also has relics: *To be defined* (same rules as player or different?)
- Attributes: *To be defined* (faction? class? or different attributes?)

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
Components (no distinction between troops and heroes at calculation level):
1. **Base card power:** Each card (troop or hero) has a base power value
2. **Area of effect:** Cards can provide bonuses to nearby cards based on:
   - Card level (if leveled)
   - Card type (if it's a hero with area effects)
   - Proximity to other cards
   - Example: A level 5 archer OR a hero both provide "+3 to adjacent archers"
3. **Slot modifiers:** Terrain/position bonuses (e.g., archers on hill get 2x power)
4. **General bonuses:** Global battlefield effects (e.g., "all infantry x2 power")

Power calculation formula and order of operations: *CONFIGURABLE*
- Different orderings will have different strategic implications
- Game Forge must support testing multiple calculation orders
- Example configurations:
  - Apply slot modifiers first, then area effects
  - Apply general bonuses first, then slot modifiers
  - Other orderings TBD through testing

*To be defined:*
- Specific area of effect mechanics (adjacency rules, stacking rules)
- Interaction/stacking rules for overlapping effects
- Rounding/tie-breaking rules

### Opponent AI
- Behavior: *To be defined* (also draws 3, chooses 1? random selection? strategic?)
- Strategy level: *To be defined* (difficulty scaling?)
- UI Challenge: Fitting both player and opponent battlefields on screen needs exploration

### Progression Between Battles & Campaigns
- Deck building approach: *STILL DEBATING*
  - Option A: Start with full army from battle 1, level them up through campaigns
  - Option B: Start with few cards, unlock new cards by winning battles/completing campaigns
  - Prototype should support testing both approaches
- Card acquisition/unlocking: *To be defined* (if Option B selected)
- Campaign paths: Multiple sequences of battles, each with implicit difficulty level

### Currency System (Money)
- Mechanics: *STILL DEBATING* but likely includes:
  - Earn money from battle wins
  - Spend money to purchase heroes during campaigns
  - Spend money to unlock new relic slots or relic cards
  - Spend money to unlock new battles or campaigns
- *To be defined:*
  - Exact earning rates
  - Cost structure for hero/relic/campaign purchases
  - Role in progression and game balance

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
