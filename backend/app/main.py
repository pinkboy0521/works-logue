from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import follows, logs, louges, notifications, profiles, seeds, tags
from app.utils.logging import setup_logger

logger = setup_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Works Logue API starting up")
    yield
    logger.info("Works Logue API shutting down")


app = FastAPI(
    title="Works Logue API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://works-logue.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(seeds.router, prefix="/api/v1")
app.include_router(logs.router, prefix="/api/v1")
app.include_router(logs.reactions_router, prefix="/api/v1")
app.include_router(louges.router, prefix="/api/v1")
app.include_router(profiles.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(tags.router, prefix="/api/v1")
app.include_router(follows.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
