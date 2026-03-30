# Army Building Card Game — Game Design

## Overview
A single-player army-building card game where the player builds and evolves an army across a series of campaigns and battles. The player competes against a computer opponent by building the most powerful army using cards placed on a battlefield.

---

## Core Loop

- **Campaign:** A series of battles with an implicit difficulty level and progression path
- **Battle:** Both player and opponent build armies by placing cards on a battlefield; the army with the highest total power wins

---

## Gameplay

### Players
- Single player vs computer opponent

### Win Conditions
- **Win a battle:** Your army's total power > opponent's army power at end of battle
- **Win a campaign:** *To be defined* (defeat all opponents? reach final boss?)

### Turn Structure
- Consecutive turns alternating between player and opponent
- Each turn: draw 3 cards from deck, choose 1 to place on a battlefield slot
- Real-time power feedback: placing a card shows updated army power immediately
- Battle end condition: *CONFIGURABLE*
  - Option A: Battle ends when all battlefield slots are filled
  - Option B: Battle ends after a fixed number of turns
- Final scoring: at end of battle, highest total army power wins

---

## Card Types

### Troop Cards
- Attributes: faction, class, base power value
- Represents a military unit (e.g., Human Archers, Dwarf Warriors)
- Multiple copies of the same card allowed in a deck (no fixed limit)
- Ability type: level-based area-of-effect bonuses to adjacent units
  - Example: level 5 archer provides +3 power to all adjacent archers

### Hero Cards
- Placed in deck and drawn/played like regular troops
- Attributes: faction, class, base power value
- Higher power than regular troops relative to their acquisition level
- Area-of-effect bonuses for adjacent cards (like high-level troops)
- Limited deployments: each hero has a deployment counter
  - When deployments are exhausted, hero is permanently removed from deck
- Heroes do NOT level up
- Acquisition: campaign rewards or purchasable during campaigns
- Hero power scales with the implicit difficulty of the campaign where acquired
- *To be defined:*
  - Exact power scaling formula
  - Exact area effect mechanics
  - Whether multiple copies of same hero are allowed

### General Cards
- Not part of the deck — separate collection
- Selected at battle start; each battle has exactly one active general per side
- Selection method: *STILL DEBATING*
  - Option A: Choose from all generals you own
  - Option B: Randomly presented N generals to choose from
- Apply global effects across the entire battlefield
  - Example: "All Infantry x2 power", "All units +1 power"
- Attributes: faction, class
- Display position: TBD (side panel or below battlefield)
- Leveling/experience: *To be defined*
- Unlocking mechanics: *To be defined*

### Relic Cards
- Not placed on battlefield slots
- Passive effects: e.g., "+25% XP gained this battle"
- Active effects with limited uses per battle:
  - Move a card to another slot
  - Change terrain type of a slot
  - Draw an extra card
  - Other: *To be defined*
- Selection method: *STILL DEBATING*
  - Option A: Build a relic deck, choose which relics to bring into a battle
  - Option B: Fixed relic slots always active, with ability to swap relics at progression milestones
- Opponent relics: *To be defined*
- Attributes: *To be defined*

---

## Card Progression & State

- Each card instance is tracked individually across all battles and campaigns
- The same card definition can appear multiple times in a deck; each copy has independent state
- **Experience & leveling (Troops only):**
  - Cards gain XP when they participate in battles
  - On level up: base power increases
  - Higher levels unlock area-of-effect abilities
  - *To be defined:* XP gain formula, level cap, ability unlock thresholds
- **Heroes:** Do not level up

---

## Battlefield

- A grid of predefined slots where cards are placed
- Each slot may have a terrain modifier that applies bonuses to specific card classes
  - Example: Hill slot → Archers get 2x power
  - Example: Plains slot → Cavalry get 2x power
  - *To be defined:* all terrain types and their modifiers

---

## Army Power Calculation

No distinction between troops and heroes at the calculation level. All placed cards are treated the same.

**Calculation components:**
1. **Base card power** — each card's base power value
2. **Area of effect** — bonuses provided by adjacent cards (from leveled troops or heroes)
3. **Slot modifiers** — terrain bonuses based on card class and slot terrain type
4. **General bonuses** — global effects applied by the active general

**Order of operations:** *CONFIGURABLE — to be determined through testing*

*To be defined:*
- Adjacency rules (which slots are considered adjacent)
- Stacking rules for overlapping effects
- Rounding and tie-breaking

---

## Opponent AI

- Behavior: *To be defined* (draws 3 cards, chooses 1? random? strategic?)
- Difficulty scaling: *To be defined*
- Opponent also has: a deck, a general, relics

---

## Progression

### Between Battles & Campaigns
- Deck building approach: *STILL DEBATING*
  - Option A: Start with full army from battle 1, level up cards through campaigns
  - Option B: Start with few cards, unlock more by winning battles and completing campaigns
- Card acquisition: *To be defined* (if Option B)
- Campaign paths: multiple sequences of battles with varying difficulty levels

### Currency System
- Mechanics: *STILL DEBATING* but likely includes:
  - Earn currency from battle wins
  - Spend on purchasing heroes during campaigns
  - Spend on new relic slots or relic cards
  - Spend to unlock new battles or campaigns
- *To be defined:* earning rates, cost structure, role in progression

---

## Open Questions

- Win condition for a full campaign
- General leveling and unlock mechanics
- Relic attributes and selection method
- Opponent AI behavior and difficulty scaling
- Exact XP formula and level thresholds
- Adjacency and stacking rules for power calculation
- Deck building progression approach
- Currency system mechanics
- Battle end condition default (slots filled vs turn limit)
