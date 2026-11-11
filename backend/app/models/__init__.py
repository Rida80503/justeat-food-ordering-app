"""
SQLAlchemy models for JustEat application.

WHY: Centralized exports make imports clean across application.
Instead of: from app.models.user import User, from app.models.restaurant import Restaurant
Can do:     from app.models import User, Restaurant
"""

from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu import Menu
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.preference import CustomerPreference
from app.models.favorite_restaurant import FavoriteRestaurant
from app.models.password_reset_token import PasswordResetToken


__all__ = [
    "User",
    "Restaurant",
    "Menu",
    "Order",
    "OrderItem",
    "Cart",
    "CartItem",
    "CustomerPreference",
    "FavoriteRestaurant",
    "PasswordResetToken",
]
