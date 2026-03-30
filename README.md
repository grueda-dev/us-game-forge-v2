# Game Forge

A design and testing tool for an army-building card game. See `docs/` for detailed design and architecture documentation.

## Prerequisites

- **Node.js** 22+
- **Python** 3.12+
- **uv** (Python package manager) — [install](https://docs.astral.sh/uv/getting-started/installation/)
- **Angular CLI** — `npm install -g @angular/cli`

## Setup

From the repository root:

```bash
# Install all Node.js dependencies (monorepo workspaces)
npm install

# Build shared TypeScript packages
npx turbo run build --filter=@game-forge/shared-schema --filter=@game-forge/shared-domain

# Install Python dependencies for forge-core
cd packages/forge-core
uv venv
uv pip install -e ".[dev]"
cd ../..

# Install Python dependencies for forge-api
cd apps/forge-api
uv venv
uv pip install -e ".[dev]"
cd ../..
```

## Development Servers

### Forge (Angular frontend)

```bash
cd apps/forge
ng serve
```

Runs at **http://localhost:4200**

### Forge API (FastAPI backend)

```bash
cd apps/forge-api
uv run uvicorn forge_api.main:app --reload --port 8000
```

Runs at **http://localhost:8000**

API docs available at **http://localhost:8000/docs**

## Project Structure

```
game-forge/
├── apps/
│   ├── forge/           # Angular + TypeScript PWA (design tool frontend)
│   ├── forge-api/       # FastAPI (backend delivery layer)
│   └── game/            # Final web game (future)
├── packages/
│   ├── shared-schema/   # TypeScript interfaces, enums, JSON schemas
│   ├── shared-domain/   # Pure TypeScript domain rules (power calc, XP, adjacency)
│   ├── shared-renderer/ # Shared PixiJS rendering components (future)
│   └── forge-core/      # Shared Python domain library (entities, rules, ports, use cases)
└── docs/
    ├── game_design.md   # Game mechanics design
    ├── forge_design.md  # Forge tool design
    └── architecture.md  # Architecture and implementation plan
```
