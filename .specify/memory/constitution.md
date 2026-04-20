<!--
  === Sync Impact Report ===
  Version change: 0.0.0 (template) → 1.0.0 (initial ratification)
  Modified principles: N/A (first ratification)
  Added sections:
    - Core Principles (5 principles)
    - Technology Stack & Constraints
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ reviewed — Constitution Check
      section references constitution gates; compatible as-is
    - .specify/templates/spec-template.md ✅ reviewed — no constitution
      references requiring update
    - .specify/templates/tasks-template.md ✅ reviewed — task phasing
      aligns with principles; no update needed
  Follow-up TODOs: None
  ===========================
-->

# Game Forge Constitution

## Core Principles

### I. Clean Architecture (Hexagonal / Ports & Adapters)

All applications in this monorepo MUST follow a layered
architecture with strict dependency direction:

```
Domain → Application → Adapters → Infrastructure → UI
```

- **Domain layer**: Entities, value objects, domain rules, and
  port interfaces. MUST have zero framework imports (no Angular,
  no FastAPI, no PixiJS, no DuckDB).
- **Application layer**: Use cases, DTOs, and orchestration
  services. MUST depend only on domain-layer ports.
- **Adapters layer**: Repository implementations (local + remote),
  presenters, mappers, and API controllers. MUST implement
  domain-layer port interfaces.
- **Infrastructure layer**: Framework bootstrap, DI wiring,
  DuckDB-WASM setup, HTTP client configuration, FastAPI app
  setup. MUST NOT contain business logic.
- **UI layer**: Angular feature components and templates. MUST
  delegate all logic to application-layer use cases.

**Rationale**: The same domain rules power both the design tool
and the final game. Coupling domain logic to any framework
makes it non-portable.

### II. Dual Persistence via Port Abstraction

Every data access operation MUST be defined as an abstract port
in the domain layer with two concrete implementations:

- `local/` — DuckDB-WASM in-browser persistence (offline-capable)
- `remote/` — HTTP calls to the FastAPI backend

A single `PersistenceStrategyProvider` MUST wire the correct
implementation set based on environment configuration. Both
implementations MUST satisfy the same port contract. New
repositories MUST always provide both local and remote
implementations.

**Rationale**: The final game will be fully local (no backend).
Game Forge MUST prove out offline abstractions so the final game
can reuse them directly.

### III. Shared Domain — Single Source of Truth

Domain rules that govern gameplay (power calculation, XP
calculation, adjacency resolution, card/entity definitions)
MUST exist in exactly one canonical location per language:

- **TypeScript**: `packages/ts/shared-domain/`
- **Python**: `packages/py/forge-core/`

Configuration format contracts (schemas, interfaces, enums)
MUST live in `packages/ts/shared-schema/`.

Applications (`apps/forge`, `apps/forge-api`, future `apps/game`)
MUST import domain logic from shared packages — they MUST NOT
duplicate or redefine domain rules locally.

**Rationale**: If the Forge tool and the final game calculate
power differently, game designers cannot trust Forge's output.
A single source eliminates divergence.

### IV. Test-Driven Development

All domain rules and use cases MUST have automated tests:

- Domain entities and pure functions: unit tests (Jest for TS,
  pytest for Python)
- Use cases: tested against mock repository implementations
- Port implementations: integration tests verifying contract
  satisfaction

Tests MUST be written before or alongside implementation.
Untested domain logic MUST NOT be merged.

**Rationale**: Game balance depends on calculation correctness.
A bug in power calculation can silently invalidate all design
decisions made in Forge.

### V. Configuration-Driven Design

All game mechanics MUST be expressed as portable JSON
configurations, not hardcoded logic:

- Power calculation step order
- XP thresholds and level caps
- Card limits and turn rules
- Battlefield terrain modifiers
- Campaign structure and unlock conditions

Every configuration type MUST include a `formatVersion` and
`id` envelope. Game Forge authors these configs; the final game
reads them. Configuration schemas MUST be defined in
`packages/ts/shared-schema/`.

**Rationale**: The entire purpose of Game Forge is to let
designers iterate on configurations. Hardcoded mechanics
defeat this purpose and block the export-to-game workflow.

## Technology Stack & Constraints

### Languages & Runtimes
- **TypeScript** (frontend, shared packages): Node.js 22+
- **Python** 3.12+ (backend, forge-core)
- **Package management**: npm workspaces + Turborepo (JS/TS),
  uv (Python)

### Frontend (apps/forge)
- **Framework**: Angular (standalone components, signals)
- **Rendering**: PixiJS for canvas surfaces (future); Angular
  for app shell, forms, routing
- **Local DB**: DuckDB-WASM
- **Styling**: SCSS

### Backend (apps/forge-api)
- **Framework**: FastAPI
- **Role**: Delivery layer ONLY — all business logic MUST
  reside in `packages/py/forge-core`
- **Remote DB**: To be determined (Supabase, Firebase, or
  custom)

### Shared Packages
| Package | Consumers | Purpose |
|---------|-----------|---------|
| `shared-schema` | Forge, Game, forge-core | Format contracts |
| `shared-domain` | Forge, Game | TS domain rules |
| `forge-core` | forge-api, forge-cli | Python domain rules |

### Monorepo Rules
- Turborepo orchestrates build/test/lint/dev tasks
- `apps/*` and `packages/ts/*` are npm workspace members
- Python packages use `uv` with independent virtual
  environments
- Cross-package dependencies MUST use workspace references
  (e.g., `"@game-forge/shared-domain": "*"`)

## Development Workflow

### Feature Development
1. Create a feature branch from `main`
2. Write or update the feature spec under `specs/`
3. Implement domain logic in shared packages first
4. Implement adapters (both local and remote) second
5. Implement UI components last
6. Verify both persistence strategies work
7. Open a pull request for review

### Build Order Priority
Build and test local persistence (DuckDB-WASM) BEFORE building
remote persistence (FastAPI). This forces port interfaces to
remain genuinely abstract — not contaminated by HTTP concerns.

### Code Review Expectations
- Every PR MUST verify compliance with these principles
- Domain logic changes MUST include test updates
- New entities MUST have both local and remote repository
  implementations
- Configuration format changes MUST update shared-schema

## Governance

This constitution supersedes all other development practices
for the Game Forge project. Amendments require:

1. Documentation of the proposed change and rationale
2. Update to this file with incremented version number
3. A consistency propagation check across all dependent
   templates (plan, spec, tasks)
4. A commit message referencing the version change

**Versioning policy**: MAJOR for principle removals/redefinitions,
MINOR for new principles or materially expanded guidance,
PATCH for clarifications and wording fixes.

**Compliance review**: All pull requests and code reviews MUST
verify adherence to these principles. Complexity that violates
a principle MUST be explicitly justified in the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
