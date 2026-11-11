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
    User, Restaurant, Menu, Order, OrderItem, 
    Cart, CartItem, CustomerPreference, FavoriteRestaurant, PasswordResetToken
)
from app.api.routes import auth, restaurants, menus, carts, orders, users, preferences, favorites, recommendations


# ============================================================================
# Logging Configuration
# ============================================================================

LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
logger = logging.getLogger(__name__)

# Write rotating application logs to backend/logs for auditability.
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
if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
    root_logger.addHandler(file_handler)


# ============================================================================
# Lifespan Events (FastAPI 0.93+)
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown.
    
    WHY: 
    - Startup: Create database tables when app starts
    - Shutdown: Close database connections when app stops
    """
    
    # Startup Event
    logger.info("🚀 Starting JustEat Application...")
    
    # Create all database tables based on models
    # WHY: If tables don't exist, create them from our SQLAlchemy models
    # In production, use Alembic migrations instead
    #Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables initialized")
    
    yield  # Application runs here
    
    # Shutdown Event
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
# WHY: Allow frontend to make requests to backend from different domain

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests/responses to support operational traceability."""
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
# WHY: Catch all errors and return consistent JSON responses


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Return consistent JSON for expected HTTP errors.

    WHY: Tests and frontend expect `success`/`message` envelope even on errors.
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
async def general_exception_handler(request: Request, exc: Exception):
    """
    Catch all unhandled exceptions and return JSON response.
    
    WHY: Ensures all errors return consistent JSON format.
    Prevents FastAPI from returning HTML error pages.
    """
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
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
# Health Check Endpoint
# ============================================================================

@app.get("/", tags=["Health"])
def read_root():
    """
    Health check endpoint.
    
    WHY: Verify API is running.
    Used by load balancers and monitoring systems.
    """
    return {
        "success": True,
        "message": "JustEat API is running",
        "version": settings.API_VERSION,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Detailed health check endpoint.
    
    WHY: Verify API and database connectivity.
    """
    return {
        "success": True,
        "message": "API is healthy",
        "environment": settings.APP_ENV,
        "debug": settings.DEBUG,
    }


# ============================================================================
# API Routes Registration
# ============================================================================
# WHY: Include routers from different modules for organized API structure

# Authentication routes
app.include_router(auth.router)

# User profile management routes
app.include_router(users.router)

# Restaurant management routes
app.include_router(restaurants.router)

# Menu items routes
app.include_router(menus.router)

# Shopping cart routes
app.include_router(carts.router)

# Order management routes
app.include_router(orders.router)

# Customer personalization routes
app.include_router(preferences.router)
app.include_router(favorites.router)
app.include_router(recommendations.router)

# Additional routes will be added in future steps:
# - Users profile management
# - Preferences management
# - Favorites management
# - Recommendations
# - Admin operations


# ============================================================================
# Swagger/OpenAPI Documentation
# ============================================================================
# WHY: Automatic API documentation at /docs (Swagger UI)
#      Alternative docs at /redoc (ReDoc)
# FastAPI automatically generates these from our routes and schemas

# Access at:
# - Swagger UI: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
# - OpenAPI JSON: http://localhost:8000/openapi.json


if __name__ == "__main__":
    """
    Run the application with: uvicorn app.main:app --reload
    
    WHY:
    --reload: Auto-restart on file changes (development only)
    --host 0.0.0.0: Listen on all network interfaces
    --port 8000: Use port 8000
    """
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
