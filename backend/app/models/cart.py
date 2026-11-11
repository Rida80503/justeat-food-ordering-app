"""
Cart model for shopping carts.

WHY: Each customer has one active shopping cart per restaurant.
Stores cart totals for quick display (denormalized for performance).
Links to CartItem for individual items.
"""
from sqlalchemy import DECIMAL, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Cart(BaseModel):
    """Shopping cart."""

    __tablename__ = "cart"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    restaurant_id: Mapped[int | None] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=True,
        index=True,
    )

    total_items: Mapped[int] = mapped_column(default=0)

    total_price: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        default=0.0,
    )

    # Relationships
    customer = relationship(
        "User",
        back_populates="cart",
    )

    restaurant = relationship("Restaurant")

    items = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
    )