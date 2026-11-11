"""
Main application entry point and startup script.

WHY: This script starts the FastAPI server using Uvicorn.
Can be run locally or in Docker container.

Usage:
    python app/run.py          # Local development
    docker build ...           # Docker production
"""

import uvicorn
import os

if __name__ == "__main__":
    # Get settings from environment or use defaults
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", 8000))
    reload = os.getenv("APP_RELOAD", "False").lower() == "true"
    workers = int(os.getenv("APP_WORKERS", 4))
    
    # Run server
    if reload:
        # Development mode (single worker with auto-reload)
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
    else:
        # Production mode (multiple workers)
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            workers=workers,
            log_level="info"
        )
