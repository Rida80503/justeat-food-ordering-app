"""
Customer preference model.

Stores customer food preferences.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class CustomerPreference(BaseModel):
    """Customer preference."""

    __tablename__ = "customer_preferences"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Foreign Key
    customer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Preference Fields
    dietary_restriction: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    favorite_cuisine: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    spice_level: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    veg_non_veg: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    budget_range: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    delivery_preference: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    dietary_preference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    # Relationships
    customer = relationship(
        "User",
        back_populates="preferences",
    )

    def __repr__(self) -> str:
        return (
            f"<CustomerPreference "
            f"id={self.id} "
            f"customer={self.customer_id}>"
        )


__all__ = ["CustomerPreference"]