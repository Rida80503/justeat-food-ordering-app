"""
CartItem model for items in shopping carts.

WHY: One cart can have multiple items.
Links Cart to Menu items with quantity.
Similar structure to OrderItem but for active carts.
"""
from sqlalchemy import CheckConstraint, DECIMAL, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class CartItem(BaseModel):
    """Cart item."""

    __tablename__ = "cart_items"

    def __init__(self, **kwargs):
        if "unit_price" in kwargs:
            kwargs["price"] = kwargs.pop("unit_price")
        super().__init__(**kwargs)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("cart.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    menu_id: Mapped[int] = mapped_column(
        ForeignKey("menus.id"),
        nullable=False,
        index=True,
    )

    quantity: Mapped[int] = mapped_column(nullable=False)

    price: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
    )

    # Relationships
    cart = relationship(
        "Cart",
        back_populates="items",
    )

    menu = relationship(
        "Menu",
        back_populates="cart_items",
    )

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="positive_cart_quantity",
        ),
        UniqueConstraint(
            "cart_id",
            "menu_id",
            name="unique_cart_menu_item",
        ),
    )