"""
Restaurant model.

Stores restaurant details managed by restaurant owners.
"""
from sqlalchemy import Boolean, DECIMAL, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Restaurant(BaseModel):
    """Restaurant model."""

    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[str | None] = mapped_column(Text)

    address: Mapped[str] = mapped_column(String(500), nullable=False)

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    cuisine_type: Mapped[str | None] = mapped_column(String(100))

    average_rating: Mapped[float] = mapped_column(
        DECIMAL(3, 2),
        default=0.0,
    )

    delivery_time_minutes: Mapped[int] = mapped_column(default=30)

    delivery_fee: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        default=0.0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    # Relationships
    owner = relationship(
        "User",
        back_populates="restaurants",
    )

    menus = relationship(
        "Menu",
        back_populates="restaurant",
        cascade="all, delete-orphan",
    )

    orders = relationship(
        "Order",
        back_populates="restaurant",
    )

    favorites = relationship(
        "FavoriteRestaurant",
        back_populates="restaurant",
        cascade="all, delete-orphan",
    )