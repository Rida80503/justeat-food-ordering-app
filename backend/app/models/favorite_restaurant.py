"""
Favorite restaurant model.

Stores restaurants marked as favorite by customers.
"""

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class FavoriteRestaurant(BaseModel):
    """Favorite restaurant."""

    __tablename__ = "favorite_restaurants"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Foreign Keys
    customer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    restaurant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    customer = relationship(
        "User",
        back_populates="favorite_restaurants",
    )

    restaurant = relationship(
        "Restaurant",
        back_populates="favorites",
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint(
            "customer_id",
            "restaurant_id",
            name="unique_favorite",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<FavoriteRestaurant "
            f"customer={self.customer_id} "
            f"restaurant={self.restaurant_id}>"
        )


__all__ = ["FavoriteRestaurant"]