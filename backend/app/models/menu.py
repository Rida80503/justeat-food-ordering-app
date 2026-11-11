"""
Menu model for restaurant menu items.

WHY: Stores individual menu items for each restaurant.
Links to Restaurant to show which restaurant has this item.
Customers see these items and add them to cart.
"""
from sqlalchemy import Boolean, DECIMAL, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Menu(BaseModel):
    """Menu model."""

    __tablename__ = "menus"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text)

    price: Mapped[float] = mapped_column(
        DECIMAL(10, 2),
        nullable=False,
    )

    cuisine: Mapped[str | None] = mapped_column(String(100))

    image_url: Mapped[str | None] = mapped_column(String(500))

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    is_todays_special: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_deal_of_day: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # Relationships
    restaurant = relationship(
        "Restaurant",
        back_populates="menus",
    )

    cart_items = relationship(
        "CartItem",
        back_populates="menu",
    )

    order_items = relationship(
        "OrderItem",
        back_populates="menu",
    )