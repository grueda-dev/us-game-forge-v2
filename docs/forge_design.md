# Game Forge — Tool Design

## Overview
**Game Forge** is a design and testing application for game designers and developers to iterate on game mechanics, configurations, and layouts. It is distinct from the final game but shares domain logic and configuration formats with it.

Game Forge allows designers to:
- Create and test card definitions and deck configurations
- Design battlefields and test different terrain layouts
- Configure game rules and compare their effects
- Run battles manually or simulate them in bulk
- Design and test campaign progression paths
- Explore and preview UI layouts for the final game
- Export a complete game content bundle for the final game to load

---

## Target Users
- Game designers and developers (not players)
- Core partners collaborating on game design
- *To be defined:* number of collaborators, access model

---

## Platform & Technology

### Stack
- **Frontend:** Angular + TypeScript
- **Rendering:** PixiJS (for battlefield, card, and layout canvas views)
- **Backend:** FastAPI (Python) — delivery only, no business logic
- **Local persistence:** DuckDB-WASM (offline / analytics)
- **Remote persistence:** *To be determined* (Supabase, Firebase, or custom)
- **Deployment:** Progressive Web App (PWA) with offline support

### Rendering Architecture
- **Angular** manages app shell, routing, navigation, forms, and configuration panels
- **PixiJS** renders all canvas surfaces: battlefield grid, card placement, battle animations, layout editor
- Angular components host PixiJS canvases as infrastructure-layer elements
- Domain and application layers are framework-agnostic (no Angular or PixiJS imports)

### Persistence Strategy
- Dual implementation: all repository ports have both a `remote/` and `local/` implementation
- `remote/` — fetches via HTTP from `forge-api`
- `local/` — queries DuckDB-WASM in the browser
- A single provider file swaps implementations based on `navigator.onLine` / environment flags
- DuckDB chosen over IndexedDB for: SQL querying, WASM browser support, analytics workloads

### Final Game Compatibility
- The final game will be local-only (no backend)
- Game Forge proves out the local persistence abstractions that the final game will rely on
- The `shared-renderer` PixiJS package is reused in the final web game (if web route is chosen)
- Final game possible platforms: Web PWA, Unity, Unreal Engine

---

## Feature Areas

### 1. Battle Testing (Phase 1)
Configure and run individual battles with specific parameters:
- Select player deck, opponent deck, battlefield, and rules configurations
- Play through a battle manually turn by turn
- Simulate a battle headlessly and view results
- View per-layer power breakdown (base power, AoE, slot modifiers, general bonus)
- Goal: find balanced battle configurations

### 2. Campaign Designer (Phase 2)
Define the full campaign structure:
- Create campaigns with ordered battle sequences
- Set implicit difficulty levels per campaign
- Define unlock conditions between campaigns
- Define rewards per battle and campaign (currency, heroes, relics, unlocks)
- Test multiple campaign paths and progression flows
- Goal: balance overall game progression

### 3. Simulation & Analytics (Phase 1+)
Run headless batch simulations to gather balance data:
- Simulate N battles with given configurations
- Collect metrics: win rates, average power, difficulty indicators
- Export results to JSON/CSV for analysis
- Also available via `forge-cli` for large batch runs without a browser

### 4. Visual Layout Editor (Phase 2+)
A canvas-based design sandbox integrated into Game Forge (not a separate app):
- Drag, rotate, and scale UI elements (battlefield grid, hand area, general panel, relic slots, score display)
- Preview how different layouts handle fitting player and opponent battlefields on screen simultaneously
- Layout settings are saved as part of the battlefield/battle configuration, enabling A/B comparison
- Rendered in PixiJS — same visuals as the final game
- *To be defined:* whether layout configs export as position/size JSON for the final game to consume

### 5. Configuration Management
- Save, load, tag, and version named configurations (decks, battlefields, rules, campaigns)
- Share configurations between team members
- Import/export individual configs or full game content bundles

### 6. Game Content Export
Export a complete game content bundle — all configs packaged together — for the final game to load.

---

## Configuration Types
All configs share a `formatVersion` + `id` envelope and are stored as JSON.

| Config | Description |
|---|---|
| `card-definition-catalog` | Master list of all card definitions (troops, heroes, generals, relics) |
| `deck-config` | A named deck (troop/hero/general/relic selections) |
| `initial-deck-config` | Starting deck for a new player (links to deck-config + starting levels) |
| `battlefield-config` | Grid layout with slot terrain modifiers; optionally includes layout settings |
| `rules-config` | Power calculation step order, XP thresholds, card limits, turn rules |
| `battle-definition` | Links deck + battlefield + rules; defines opponent deck and end condition |
| `reward-config` | Rewards on battle/campaign completion (currency, unlocks) |
| `campaign-catalog` | Ordered list of campaigns with battles, unlock conditions, and difficulty |

---

## Testing Cadence
*To be defined* (daily, weekly, ad-hoc)

---

## Open Questions
- Backend: Supabase vs Firebase vs custom FastAPI + DB
- Whether layout configs are exported for final game consumption
- Configuration sharing model (link sharing, export files, team accounts?)
- Access control and collaboration model
