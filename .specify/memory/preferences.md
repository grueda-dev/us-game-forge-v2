<!--
  CANONICAL LOCATION for workspace preferences and session learnings.
  Referenced by AGENTS.md — every new session reads this file.
  Update in-place; do not create duplicates.
  Last updated: 2026-04-22
-->

# Workspace Preferences & Session Learnings

## Communication Style

- Present options as clear comparison tables with pros/cons — the user makes decisions quickly when tradeoffs are visible.
- Keep explanations concise but don't skip rationale. The user values *why* over *how*.
- When the user says "yes, let's go with X", execute immediately — don't ask for further confirmation.
- Use "Continue" as a signal that context was truncated; resume seamlessly without repeating.

## Workflow Patterns

- **Speckit is the standard workflow**: Features go through `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. Follow this pipeline unless the user explicitly skips steps.
- **The user iterates on specs conversationally**: Expect multiple rounds of refinement during the spec/plan phase. The user reads generated documents carefully and will raise design concerns (e.g., deployment tracking, entity separation, timestamp redundancy). Incorporate feedback into *all affected artifacts* — spec, data-model, research, contracts, plan — in a single pass.
- **Small, conversational requests can skip planning**: Adding a single field, fixing a lint issue, or running tests doesn't need a full speckit cycle. Use judgment.
- **Clean breaks over backward compatibility**: The project is early-stage. The user prefers clean renames/removals over aliases or dual-value backward compatibility. Don't hedge with migration paths unless explicitly asked.
- **The user manually fixes lint-style issues**: When Ruff or IDE suggests `timezone.utc` → `UTC` style changes, the user may fix them directly in the editor. Watch for these code actions and don't overwrite them.
- **PRs via `gh` CLI**: The GitHub MCP token may not have PR creation permissions. Fall back to `gh pr create` via the CLI when the MCP tool fails.

## Code Style

- **Python**: Use `datetime.UTC` (not `timezone.utc`), use `from datetime import UTC, datetime` import style.
- **Python**: Follow existing Ruff + Mypy strictness — fix all lint/type errors before marking tasks complete.
- **TypeScript/Angular**: The frontend uses standalone components, signals, and SCSS.
- **Naming**: Domain entities are PascalCase classes. Python files use snake_case. TypeScript files use kebab-case.
- **Docstrings**: Add meaningful docstrings to domain entities and ports. Include rationale, not just "what it is".
- **Relative imports**: Memory adapters (in `adapters/repositories/`) use 3-dot relative imports (`...domain`). SQLModel adapters (in `adapters/repositories/sqlmodel/`) use 4-dot imports (`....domain`).

## Architecture & Design Preferences

- **Think ahead, model minimally**: The user likes to add extensibility fields now (e.g., `state_type` on `PlayerState`) even before the use case is implemented. But keep the scope to the field — don't build the full feature prematurely.
- **Prefer composed aggregates over flat god-objects**: The user chose Option C (single aggregate with typed sub-models) for `PlayerState` over flat or fully-split approaches.
- **Immutable snapshots for state versioning**: `PlayerState` uses append-only versioned snapshots with `timestamp` and `change_note` — not mutable `updated_at` fields.
- **Separate identity from state**: The user values having a `Player` entity distinct from `PlayerState`, even if the initial implementation is minimal. This was an important design decision.
- **Always update all related artifacts together**: When a spec change is made, update spec, data-model, research, contracts, plan, and quickstart in a single pass. Don't leave artifacts inconsistent.

## Testing & Verification

- **Run tests after every domain change**: Always verify with `uv run pytest` after entity or adapter changes.
- **Exclude Postgres tests locally**: Use `-k "not postgres"` or `-m "not postgres"` when running tests locally. Postgres CI failures are expected without Docker.
- **Angular cache gotcha**: After renaming shared-domain or shared-schema exports, clear `.angular/cache` and restart `ng serve`. The Vite dependency cache causes stale export errors.
- **Full verification before completion**: Run tests, linting (Ruff), and type checking (Mypy) before declaring tasks complete.

## Environment & Tooling

- **Python**: `uv` for package management, `uv run pytest` for tests, `uv run ruff` for linting, `uv run mypy` for type checking.
- **Frontend**: `ng serve` for Angular dev server (port 4200), `npx turbo test` for TS package tests.
- **Backend**: `uv run uvicorn forge_api.main:app --reload` for FastAPI dev server.
- **Monorepo**: Turborepo for JS/TS orchestration, npm workspaces for package linking.
- **OS**: Windows with PowerShell. Use PowerShell syntax for scripts.

## Common Gotchas

- **Alembic migrations are historical**: Never modify existing migration files in `alembic/versions/`. They are read-only history.
- **Stale Vite cache**: After shared package renames, the Angular dev server serves cached exports. Fix: `Remove-Item -Recurse -Force "apps/forge/.angular/cache"` + restart `ng serve`.
- **Import depth matters**: Memory adapters at `adapters/repositories/` level use `...domain`, SQLModel adapters at `adapters/repositories/sqlmodel/` use `....domain`. Getting this wrong causes immediate `ImportError`.
- **SQLModel type: ignore comments**: Use `# type: ignore[attr-defined]` for `.desc()` / `.asc()` on SQLModel columns, not `[union-attr]`.
