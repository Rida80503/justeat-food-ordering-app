"""
OrderItem model for individual items in an order.

WHY: One order can have multiple items.
Stores quantity and price at time of order (historical accuracy).
Links Order to Menu items.
"""

from sqlalchemy import CheckConstraint, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.db.base import BaseModel


class OrderItem(BaseModel):
    """
    OrderItem model representing a single item in an order.

    WHY: Order → OrderItem → Menu (many-to-many relationship)
    Separates order header from line items.
    Stores 'price_at_order' for historical accuracy (prices may change).

    Fields:
        id: Unique identifier
        order_id: Foreign key to Order
        menu_id: Foreign key to Menu item ordered
        quantity: How many of this item
        price_at_order: Price at time of order (not current menu price)
        created_at: When this item was added to order
    """

    __tablename__ = "order_items"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Foreign Keys
    order_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    menu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("menus.id"),
        nullable=False,
        index=True,
    )

    # Item Details
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Price - Store price at time of order, not current menu price
    # WHY: Menu prices may change. We need historical record of what customer paid.
    price_at_order: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
    )

    # Relationships
    order = relationship(
        "Order",
        back_populates="items",
    )

    menu = relationship(
        "Menu",
        back_populates="order_items",
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="positive_quantity",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<OrderItem id={self.id} "
            f"menu_id={self.menu_id} "
            f"qty={self.quantity}>"
        )


__all__ = ["OrderItem"]