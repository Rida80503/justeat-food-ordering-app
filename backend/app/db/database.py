"""
Database connection and session management.

This file creates the database engine and provides
database sessions for the application.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool

from app.core.config import settings


# Create the database engine.
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQLALCHEMY_ECHO,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10},
)


# Create a session factory.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    """
    Create a new database session.

    A new session is created for every request and
    automatically closed after the request finishes.

    Yields:
        Session: Database session.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def close_db() -> None:
    """
    Close all database connections.
    """

    engine.dispose()