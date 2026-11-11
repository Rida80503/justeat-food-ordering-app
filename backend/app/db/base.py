"""
Base model for all database tables.

Every model in the project inherits from this class.
It provides common fields like created_at and updated_at.
"""

from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


class BaseModel(Base):
    """
    Base class for all database models.

    Common fields are defined here so every model
    automatically gets them.
    """

    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def __repr__(self) -> str:
        """
        Return a readable string representation of the model.
        """

        return f"<{self.__class__.__name__}>"