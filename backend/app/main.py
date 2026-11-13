
"""
JustEat FastAPI Application Entry Point

WHY: This is the main application file that starts the FastAPI server.
FastAPI will automatically discover routes and generate Swagger docs.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from app.core.config import settings
from app.db.database import engine, close_db
from app.db.base import Base
from app.models import (
    User,
    Restaurant,
    Menu,
    Order,
    OrderItem,
    Cart,
    CartItem,
    CustomerPreference,
    FavoriteRestaurant,
    PasswordResetToken,
)
from app.api.routes import (
    auth,
    restaurants,
    menus,
    carts,
    orders,
    users,
    preferences,
    favorites,
    recommendations,
)


# ============================================================================
# Logging Configuration
# ============================================================================

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
)

logger = logging.getLogger(__name__)

logs_dir = Path(__file__).resolve().parents[1] / "logs"
logs_dir.mkdir(parents=True, exist_ok=True)

file_handler = RotatingFileHandler(
    logs_dir / "app.log",
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8",
)

file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(LOG_FORMAT))

root_logger = logging.getLogger()

if not any(
    isinstance(handler, RotatingFileHandler)
    for handler in root_logger.handlers
):
    root_logger.addHandler(file_handler)


# ============================================================================
# Lifespan Events
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown.
    """

    logger.info("🚀 Starting JustEat Application...")

    # Database tables are managed through Alembic migrations.
    # Base.metadata.create_all(bind=engine)

    logger.info("✅ Database tables initialized")

    yield

    logger.info("🛑 Shutting down JustEat Application...")

    close_db()

    logger.info("✅ Database connections closed")


# ============================================================================
# FastAPI Application Creation
# ============================================================================

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan,
)


# ============================================================================
# CORS Middleware
# ============================================================================

# Preserve configured origins and explicitly allow local development origins.
# Never pair wildcard origins with credentials; keep the list explicit.

def normalize_origin(origin: str) -> str:
    """Normalize origin strings to a consistent, comparable form."""

    return origin.strip().rstrip("/") if origin else ""


allowed_origins = [
    normalize_origin(origin)
    for origin in settings.ALLOWED_ORIGINS_LIST
    if normalize_origin(origin)
]

logger.info("Allowed CORS origins: %s", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Disposition"],
)


# ============================================================================
# Request Logging Middleware
# ============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests/responses."""

    response = await call_next(request)

    logger.info(
        "%s %s -> %s",
        request.method,
        request.url.path,
        response.status_code,
    )

    return response


# ============================================================================
# Error Handling Middleware
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    """
    Return consistent JSON for expected HTTP errors.
    """

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "error_code": "HTTP_ERROR",
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    """
    Catch unhandled errors and return consistent JSON.
    """

    logger.error(
        "Unhandled exception: %s",
        exc,
        exc_info=True,
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred",
            "error_code": "INTERNAL_ERROR",
            "status_code": 500,
        },
    )


# ============================================================================
# Health Check Endpoints
# ============================================================================

@app.get("/", tags=["Health"])
def read_root():
    """Verify that the API is running."""

    return {
        "success": True,
        "message": "JustEat API is running",
        "version": settings.API_VERSION,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Verify API health."""

    return {
        "success": True,
        "message": "API is healthy",
        "environment": settings.APP_ENV,
        "debug": settings.DEBUG,
    }


# ============================================================================
# API Routes Registration
# ============================================================================

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(menus.router)
app.include_router(carts.router)
app.include_router(orders.router)
app.include_router(preferences.router)
app.include_router(favorites.router)
app.include_router(recommendations.router)


# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
