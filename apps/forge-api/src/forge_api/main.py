from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, configurations, battles

app = FastAPI(
    title="Game Forge API",
    description="Backend API for Game Forge — army-building card game design tool",
    version="0.1.0",
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
