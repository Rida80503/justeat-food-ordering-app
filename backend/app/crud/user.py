"""
CRUD operations for User model.
"""

from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.favorite_restaurant import FavoriteRestaurant
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.preference import CustomerPreference
from app.models.user import User
from app.schemas.user import UserProfileUpdateRequest


def get_user_by_email(db: Session, email: str) -> User | None:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Get user by id."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    password_hash: str,
    first_name: str,
    last_name: str,
    phone: str | None = None,
    role: str = "CUSTOMER",
) -> User:
    """Create new user."""

    user = User(
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user_profile(
    db: Session,
    user: User,
    profile_update: UserProfileUpdateRequest,
) -> User:
    """Update user profile."""

    if profile_update.first_name is not None:
        user.first_name = profile_update.first_name

    if profile_update.last_name is not None:
        user.last_name = profile_update.last_name

    if profile_update.phone is not None:
        user.phone = profile_update.phone

    db.commit()
    db.refresh(user)

    return user


def update_user_password(
    db: Session,
    user: User,
    new_password_hash: str,
) -> User:
    """Update user password."""

    user.password_hash = new_password_hash

    db.commit()
    db.refresh(user)

    return user


def deactivate_user(db: Session, user: User) -> User:
    """Deactivate user."""

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


def delete_user_account(db: Session, user: User) -> User:
    """Deactivate the user and remove their related account data."""

    db.query(FavoriteRestaurant).filter(FavoriteRestaurant.customer_id == user.id).delete(
        synchronize_session=False
    )
    db.query(CustomerPreference).filter(CustomerPreference.customer_id == user.id).delete(
        synchronize_session=False
    )
    cart_ids = db.query(Cart.id).filter(Cart.customer_id == user.id).subquery()
    db.query(CartItem).filter(CartItem.cart_id.in_(cart_ids)).delete(synchronize_session=False)

    db.query(Cart).filter(Cart.customer_id == user.id).delete(synchronize_session=False)

    order_ids = db.query(Order.id).filter(Order.customer_id == user.id).subquery()
    db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).delete(
        synchronize_session=False
    )
    db.query(Order).filter(Order.customer_id == user.id).delete(synchronize_session=False)

    user.is_active = False
    db.commit()
    db.refresh(user)

    return user


def activate_user(db: Session, user: User) -> User:
    """Activate user."""

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user