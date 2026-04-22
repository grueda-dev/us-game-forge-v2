# Feature Specification: Rename Hero Cards to Mercenary Cards

**Feature Branch**: `003-rename-hero-mercenary`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "rename hero cards for mercenary cards across the whole project, front end, backend and packages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Consistent Domain Vocabulary (Priority: P1)

As a game designer working in Game Forge, I need all references to the "hero" card type to use the term "mercenary" instead, so that the game's lore and mechanical identity accurately reflect the design intent — mercenary cards represent hired fighters with limited deployments, not epic heroes.

**Why this priority**: The domain vocabulary is the foundation of the entire system. Every entity, interface, enum value, repository method, test, and documentation file depends on this name. Inconsistent terminology between code layers (frontend, backend, shared packages) would cause confusion for developers and break cross-layer contracts.

**Independent Test**: Can be verified by searching the entire codebase for the term "hero" in a card-type context and confirming zero remaining occurrences (excluding historical references in migration files and changelogs).

**Acceptance Scenarios**:

1. **Given** the current codebase uses `HERO` as a `CardType` enum value, **When** the rename is complete, **Then** all `CardType` enums (Python `StrEnum`, TypeScript `enum`) use `MERCENARY` as the value.
2. **Given** entities named `HeroCardDefinition` (Python/TypeScript) and `HeroCardEntity` (TypeScript), **When** the rename is complete, **Then** they are named `MercenaryCardDefinition` and `MercenaryCardEntity` respectively, with all imports, exports, and usages updated.
3. **Given** repository port methods like `get_hero_definition` and `list_hero_definitions`, **When** the rename is complete, **Then** these are renamed to `get_mercenary_definition` and `list_mercenary_definitions` across ports and all adapter implementations.
4. **Given** the shared-schema defines `HeroCardInstance` and `DeckHeroEntry`, **When** the rename is complete, **Then** these are renamed to `MercenaryCardInstance` and `DeckMercenaryEntry`.
5. **Given** the TypeScript domain file is `hero-card.entity.ts`, **When** the rename is complete, **Then** the file is renamed to `mercenary-card.entity.ts` and the test file to `mercenary-card.entity.test.ts`.

---

### User Story 2 — Updated Documentation (Priority: P2)

As a game designer or contributor reading the project documentation, I need all design documents, architecture docs, and spec references to use "mercenary" instead of "hero" when referring to this card type, so that documentation matches the codebase.

**Why this priority**: Documentation drives onboarding and design decisions. Mismatched terminology between docs and code creates friction, but docs are a secondary concern after the code itself compiles and passes tests.

**Independent Test**: Can be verified by searching all `.md` files under `docs/` for "hero" in a card-type context and confirming the term has been replaced with "mercenary".

**Acceptance Scenarios**:

1. **Given** the game design document describes "Hero Cards" as a card type, **When** the rename is complete, **Then** the section is titled "Mercenary Cards" and all behavioral descriptions use "mercenary" instead of "hero".
2. **Given** the architecture document references `HeroCardEntity`, **When** the rename is complete, **Then** it references `MercenaryCardEntity`.
3. **Given** the forge design document mentions "heroes" in card catalogs and deck configs, **When** the rename is complete, **Then** it uses "mercenaries" instead.

---

### User Story 3 — Frontend Alignment (Priority: P2)

As a frontend developer, I need the Angular app's card repository ports and adapter implementations to use "mercenary" naming, so that the frontend remains consistent with the shared packages it depends on.

**Why this priority**: The frontend consumes `@game-forge/shared-schema` and `@game-forge/shared-domain`. Once those packages rename their exports, the frontend must update its imports and usages to compile. This is tightly coupled with User Story 1.

**Independent Test**: Can be verified by running `ng build` successfully and confirming the frontend compiles without errors after the rename.

**Acceptance Scenarios**:

1. **Given** the Angular app's `card-repository.port.ts` defines `saveHeroInstance` and `getHeroInstance`, **When** the rename is complete, **Then** these methods are renamed to `saveMercenaryInstance` and `getMercenaryInstance`.
2. **Given** the local and remote card repository adapters implement hero-related methods, **When** the rename is complete, **Then** all implementations use "mercenary" naming.
3. **Given** the deck configuration UI references `heroEntries`, **When** the rename is complete, **Then** it references `mercenaryEntries`.

---

### Edge Cases

- **Database migrations**: Existing Alembic migration files that reference `hero_card_instances` table names MUST NOT be modified — they are historical records. Only future migrations should use the new naming.
- **Serialized data**: Any persisted JSON or database records using the `HERO` enum string value will need a data migration or backward-compatibility mapping to read as `MERCENARY`.
- **Error messages**: String literals in error messages (e.g., `Hero "X" has no deployments remaining`) must be updated to use "Mercenary".
- **Comments and docstrings**: Internal references to "hero" in code comments that describe the card type must be updated. Comments describing historical context (e.g., "Replaces the former HeroCardInstance") may be left or updated at the implementor's discretion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `CardType` enum MUST replace the `HERO` value with `MERCENARY` in both the Python `StrEnum` (`packages/py/forge-core`) and TypeScript `enum` (`packages/ts/shared-schema`).
- **FR-002**: All entity classes/interfaces containing "Hero" in their name MUST be renamed to use "Mercenary" (e.g., `HeroCardDefinition` → `MercenaryCardDefinition`, `HeroCardEntity` → `MercenaryCardEntity`, `HeroCardInstance` → `MercenaryCardInstance`, `DeckHeroEntry` → `DeckMercenaryEntry`).
- **FR-003**: All repository port methods and adapter implementations containing "hero" MUST be renamed to use "mercenary" (e.g., `get_hero_definition` → `get_mercenary_definition`, `list_hero_definitions` → `list_mercenary_definitions`, `saveHeroInstance` → `saveMercenaryInstance`).
- **FR-004**: All source file names containing "hero" MUST be renamed (e.g., `hero-card.entity.ts` → `mercenary-card.entity.ts`, `hero-card.entity.test.ts` → `mercenary-card.entity.test.ts`).
- **FR-005**: All import/export statements referencing renamed entities MUST be updated across the entire monorepo.
- **FR-006**: All unit and integration test files MUST be updated to use the new names and MUST continue to pass.
- **FR-007**: The `DeckConfig` interface field `heroEntries` MUST be renamed to `mercenaryEntries`.
- **FR-008**: All project documentation (`docs/game_design.md`, `docs/architecture.md`, `docs/forge_design.md`) MUST replace "hero" card-type references with "mercenary".
- **FR-009**: Existing Alembic migration files MUST NOT be modified. A new migration MUST be created if database table or column names need updating.
- **FR-010**: The frontend application (`apps/forge`) MUST compile and function correctly after all renames.

### Key Entities

- **MercenaryCardDefinition** (formerly HeroCardDefinition): A card blueprint defining a mercenary's attributes — faction, class, base power, and maximum deployments. Exists in both Python and TypeScript shared packages.
- **MercenaryCardEntity** (formerly HeroCardEntity): The TypeScript domain entity representing a mercenary card with deployment tracking, area-of-effect capabilities, and exhaustion logic.
- **MercenaryCardInstance** (formerly HeroCardInstance): The TypeScript schema interface for a persisted mercenary card instance with deployment remaining count.
- **DeckMercenaryEntry** (formerly DeckHeroEntry): A deck configuration entry referencing a mercenary card definition by ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero occurrences of "hero" as a card-type identifier remain in any source code file (`.py`, `.ts`, `.html`, `.scss`) — excluding historical migration files and changelogs.
- **SC-002**: All existing unit tests pass after the rename, with updated class/method names.
- **SC-003**: The Python backend (`apps/forge-api`) starts successfully after the rename.
- **SC-004**: The Angular frontend (`apps/forge`) compiles and serves successfully after the rename.
- **SC-005**: All documentation files consistently use "mercenary" where "hero" was previously used in a card-type context.
- **SC-006**: No new [NEEDS CLARIFICATION] items exist — the rename is a straightforward mechanical refactor with no ambiguity.

## Assumptions

- This is a purely mechanical rename with no behavioral or gameplay logic changes. The mercenary card type retains all existing hero card mechanics (limited deployments, no leveling, area-of-effect bonuses).
- The existing `OwnedCard` entity in `player_state.py` uses a `card_type` discriminator field with `CardType.HERO` — this will become `CardType.MERCENARY`. Any persisted player state data using the old value will need attention during implementation (data migration or backward-compatible deserialization).
- The word "hero" in non-card-type contexts (e.g., CSS class `.hero-section`, HTML elements, or unrelated variable names) is NOT in scope for this rename. Only card-type-specific usages are affected.
- All downstream consumers of the shared packages within this monorepo will be updated in the same changeset to avoid broken cross-package references.
