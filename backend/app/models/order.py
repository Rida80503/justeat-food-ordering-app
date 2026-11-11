"""
Order model.

Stores customer orders.
"""
from sqlalchemy import CheckConstraint, DECIMAL, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Order(BaseModel):
    """Customer order."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=False,
        index=True,
    )

    total_amount: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False,
        index=True,
    )

    special_instructions: Mapped[str | None] = mapped_column(Text)

    # Relationships
    customer = relationship(
        "User",
        back_populates="orders",
    )

    restaurant = relationship(
        "Restaurant",
        back_populates="orders",
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED')",
            name="valid_order_status",
        ),
    )