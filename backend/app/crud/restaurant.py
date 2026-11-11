"""
CRUD operations for Restaurant model.

WHY: Repository pattern isolates database operations for restaurants.
Service layer calls these functions (not directly querying).
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.menu import Menu
from app.models.restaurant import Restaurant


def get_restaurant_by_id(db: Session, restaurant_id: int) -> Restaurant | None:
    """Get restaurant by ID."""
    return db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()


def get_restaurants_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 10) -> list[Restaurant]:
    """Get all restaurants owned by user."""
    return db.query(Restaurant).filter(Restaurant.owner_id == owner_id).offset(skip).limit(limit).all()


def get_restaurants_by_city(db: Session, city: str, skip: int = 0, limit: int = 10) -> list[Restaurant]:
    """Get restaurants in a specific city."""
    return db.query(Restaurant).filter(Restaurant.city == city, Restaurant.is_active == True).offset(skip).limit(limit).all()


def get_restaurants_by_cuisine(db: Session, cuisine: str, skip: int = 0, limit: int = 10) -> list[Restaurant]:
    """Get restaurants by cuisine type."""
    return db.query(Restaurant).filter(Restaurant.cuisine_type == cuisine, Restaurant.is_active == True).offset(skip).limit(limit).all()


def search_restaurants(
    db: Session,
    search: str | None = None,
    cuisine: str | None = None,
    location: str | None = None,
    food_item: str | None = None,
    min_rating: float | None = None,
    price_range: str | None = None,
    open_now: bool | None = None,
    has_todays_special: bool | None = None,
    sort: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Restaurant], int]:
    """Search restaurants."""

    query = db.query(Restaurant).filter(Restaurant.is_active == True)

    if search:
        query = query.filter(
            or_(
                Restaurant.name.ilike(f"%{search}%"),
                Restaurant.city.ilike(f"%{search}%"),
                Restaurant.cuisine_type.ilike(f"%{search}%"),
            )
        )

    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(cuisine))

    if location:
        query = query.filter(Restaurant.city.ilike(f"%{location}%"))

    if food_item:
        query = query.join(Menu, Menu.restaurant_id == Restaurant.id).filter(Menu.name.ilike(f"%{food_item}%"))

    if min_rating is not None:
        query = query.filter(Restaurant.average_rating >= min_rating)

    if price_range == "low":
        query = query.filter(Restaurant.delivery_fee <= 2.99)
    elif price_range == "medium":
        query = query.filter(Restaurant.delivery_fee > 2.99, Restaurant.delivery_fee <= 4.99)
    elif price_range == "high":
        query = query.filter(Restaurant.delivery_fee > 4.99)

    if open_now is not None:
        query = query.filter(Restaurant.is_active == open_now)

    if has_todays_special:
        query = (
            query.join(Menu, Menu.restaurant_id == Restaurant.id)
            .filter(Menu.is_todays_special == True, Menu.is_available == True)
            .distinct()
        )

    if sort == "popularity":
        query = query.order_by(Restaurant.average_rating.desc())
    elif sort == "rating":
        query = query.order_by(Restaurant.average_rating.desc())
    elif sort == "delivery_time":
        query = query.order_by(Restaurant.delivery_time_minutes.asc())
    elif sort == "price_low":
        query = query.order_by(Restaurant.delivery_fee.asc())
    elif sort == "price_high":
        query = query.order_by(Restaurant.delivery_fee.desc())
    else:
        query = query.order_by(Restaurant.average_rating.desc(), Restaurant.delivery_fee.asc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return items, total


def create_restaurant(
    db: Session,
    owner_id: int,
    name: str,
    description: str,
    address: str,
    city: str,
    cuisine_type: str,
    delivery_fee: float,
    delivery_time_minutes: int,
) -> Restaurant:
    """Create new restaurant."""

    restaurant = Restaurant(
        owner_id=owner_id,
        name=name,
        description=description,
        address=address,
        city=city,
        cuisine_type=cuisine_type,
        delivery_fee=delivery_fee,
        delivery_time_minutes=delivery_time_minutes,
        is_active=True,
        average_rating=0.0,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return restaurant


def update_restaurant(db: Session, restaurant: Restaurant, **kwargs) -> Restaurant:
    """Update restaurant details."""

    for key, value in kwargs.items():
        if value is not None and hasattr(restaurant, key):
            setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)

    return restaurant


def deactivate_restaurant(db: Session, restaurant: Restaurant) -> Restaurant:
    """Deactivate restaurant."""

    restaurant.is_active = False

    db.commit()
    db.refresh(restaurant)

    return restaurant


def activate_restaurant(db: Session, restaurant: Restaurant) -> Restaurant:
    """Activate restaurant."""

    restaurant.is_active = True

    db.commit()
    db.refresh(restaurant)

    return restaurant