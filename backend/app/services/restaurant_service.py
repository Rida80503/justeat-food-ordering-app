"""
Restaurant business logic service.

WHY: Handles restaurant related business logic.
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.crud.restaurant import (
    get_restaurant_by_id,
    get_restaurants_by_owner,
    get_restaurants_by_city,
    get_restaurants_by_cuisine,
    search_restaurants as db_search_restaurants,
    create_restaurant as db_create_restaurant,
    update_restaurant as db_update_restaurant,
)
from app.core.exceptions import PermissionDeniedException
from app.models.menu import Menu
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.restaurant import RestaurantResponse


class RestaurantService:
    """Restaurant service."""

    @staticmethod
    def create_restaurant(
        db: Session,
        owner: User,
        name: str,
        description: str,
        address: str,
        city: str,
        cuisine_type: str,
        delivery_fee: float,
        delivery_time_minutes: int,
    ) -> RestaurantResponse:
        """Create restaurant."""

        if owner.role != "OWNER":
            raise PermissionDeniedException("Only restaurant owners can create restaurants")

        restaurant = db_create_restaurant(
            db=db,
            owner_id=owner.id,
            name=name,
            description=description,
            address=address,
            city=city,
            cuisine_type=cuisine_type,
            delivery_fee=delivery_fee,
            delivery_time_minutes=delivery_time_minutes,
        )

        return RestaurantResponse.from_orm(restaurant)

    @staticmethod
    def get_restaurant(db: Session, restaurant_id: int) -> RestaurantResponse:
        """Get restaurant."""

        restaurant = get_restaurant_by_id(db, restaurant_id)

        if not restaurant or not restaurant.is_active:
            raise PermissionDeniedException("Restaurant not found")

        return RestaurantResponse.from_orm(restaurant)

    @staticmethod
    def search_by_city(
        db: Session,
        city: str,
        skip: int = 0,
        limit: int = 10,
    ) -> list[RestaurantResponse]:
        """Search restaurants by city."""

        restaurants = get_restaurants_by_city(db, city, skip, limit)

        return [RestaurantResponse.from_orm(r) for r in restaurants]

    @staticmethod
    def search_by_cuisine(
        db: Session,
        cuisine: str,
        skip: int = 0,
        limit: int = 10,
    ) -> list[RestaurantResponse]:
        """Search restaurants by cuisine."""

        restaurants = get_restaurants_by_cuisine(db, cuisine, skip, limit)

        return [RestaurantResponse.from_orm(r) for r in restaurants]

    @staticmethod
    def search_and_filter(
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
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """Search restaurants."""

        skip = (page - 1) * page_size

        restaurants, total = db_search_restaurants(
            db,
            search=search,
            cuisine=cuisine,
            location=location,
            food_item=food_item,
            min_rating=min_rating,
            price_range=price_range,
            open_now=open_now,
            has_todays_special=has_todays_special,
            sort=sort,
            skip=skip,
            limit=page_size,
        )

        return {
            "restaurants": [RestaurantResponse.from_orm(r).model_dump() for r in restaurants],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def get_owner_restaurants(
        db: Session,
        owner: User,
        skip: int = 0,
        limit: int = 10,
    ) -> list[RestaurantResponse]:
        """Get owner's restaurants."""

        if owner.role != "OWNER":
            raise PermissionDeniedException("Only owners can view their restaurants")

        restaurants = get_restaurants_by_owner(db, owner.id, skip, limit)

        return [RestaurantResponse.from_orm(r) for r in restaurants]

    @staticmethod
    def update_restaurant(
        db: Session,
        restaurant: Restaurant,
        owner: User,
        **update_data,
    ) -> RestaurantResponse:
        """Update restaurant."""

        if restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only update your own restaurants")

        restaurant = db_update_restaurant(db, restaurant, **update_data)

        return RestaurantResponse.from_orm(restaurant)