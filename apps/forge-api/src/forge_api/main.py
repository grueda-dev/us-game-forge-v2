from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .dependencies import _engine
from .routers import health, configurations, battles


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database engine lifecycle."""
    yield
    await _engine.dispose()


app = FastAPI(
    title="Game Forge API",
    description="Backend API for Game Forge — army-building card game design tool",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(configurations.router)
app.include_router(battles.router)
