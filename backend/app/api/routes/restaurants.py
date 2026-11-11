"""
Restaurant API routes.

WHY: REST endpoints for restaurant operations (search, create, manage).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_owner
from app.services.restaurant_service import RestaurantService
from app.crud.restaurant import get_restaurant_by_id
from app.models.menu import Menu
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantUpdateRequest,
    RestaurantResponse,
)
from app.schemas.common import BaseResponse, PaginatedResponse

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


@router.get(
    "",
    response_model=BaseResponse[dict],
    summary="Search/filter restaurants"
)
async def search_and_filter_restaurants(
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
    page_size: int = 9,
    db: Session = Depends(get_db),
):
    """Search restaurants by name, cuisine, food item, location, and rating/price filters."""
    data = RestaurantService.search_and_filter(
        db=db,
        search=search,
        cuisine=cuisine,
        location=location,
        food_item=food_item,
        min_rating=min_rating,
        price_range=price_range,
        open_now=open_now,
        has_todays_special=has_todays_special,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    return BaseResponse(
        success=True,
        message="Search results retrieved",
        data=data,
    )


@router.post(
    "",
    response_model=BaseResponse[RestaurantResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create new restaurant"
)
async def create_restaurant(
    request: RestaurantCreateRequest,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Create new restaurant (owner-only operation).
    
    WHY: Only users with OWNER role can create restaurants.
    """
    restaurant = RestaurantService.create_restaurant(
        db=db,
        owner=current_user,
        name=request.name,
        description=request.description,
        address=request.address,
        city=request.city,
        cuisine_type=request.cuisine_type,
        delivery_fee=request.delivery_fee,
        delivery_time_minutes=request.delivery_time_minutes,
    )
    
    return BaseResponse(
        success=True,
        message="Restaurant created successfully",
        data=restaurant
    )


@router.get(
    "/search/city/{city}",
    response_model=BaseResponse[list[RestaurantResponse]],
    summary="Search restaurants by city"
)
async def search_by_city(
    city: str,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Search restaurants by city (public operation).
    """
    restaurants = RestaurantService.search_by_city(db, city, skip, limit)
    
    return BaseResponse(
        success=True,
        message=f"Found {len(restaurants)} restaurants in {city}",
        data=restaurants
    )


@router.get(
    "/search/cuisine/{cuisine}",
    response_model=BaseResponse[list[RestaurantResponse]],
    summary="Search restaurants by cuisine"
)
async def search_by_cuisine(
    cuisine: str,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Search restaurants by cuisine type (public operation).
    """
    restaurants = RestaurantService.search_by_cuisine(db, cuisine, skip, limit)
    
    return BaseResponse(
        success=True,
        message=f"Found {len(restaurants)} {cuisine} restaurants",
        data=restaurants
    )


@router.get(
    "/{restaurant_id}",
    response_model=BaseResponse[RestaurantResponse],
    summary="Get restaurant details"
)
async def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
 ):
    """
    Get restaurant details by ID (public operation).
    """
    restaurant = RestaurantService.get_restaurant(db, restaurant_id)
    
    return BaseResponse(
        success=True,
        message="Restaurant details retrieved",
        data=restaurant
    )


@router.get(
    "/my/restaurants",
    response_model=BaseResponse[list[RestaurantResponse]],
    summary="Get my restaurants"
)
async def get_my_restaurants(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Get all restaurants owned by current user (owner-only).
    """
    restaurants = RestaurantService.get_owner_restaurants(
        db, current_user, skip, limit
    )
    
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(restaurants)} restaurants",
        data=restaurants
    )


@router.put(
    "/{restaurant_id}",
    response_model=BaseResponse[RestaurantResponse],
    summary="Update restaurant"
)
async def update_restaurant(
    restaurant_id: int,
    request: RestaurantUpdateRequest,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Update restaurant details (owner-only, must own restaurant).
    """
    restaurant = get_restaurant_by_id(db, restaurant_id)
    from app.core.exceptions import UserNotFoundException
    if not restaurant:
        raise UserNotFoundException("Restaurant")
    
    updated = RestaurantService.update_restaurant(
        db=db,
        restaurant=restaurant,
        owner=current_user,
        name=request.name,
        description=request.description,
        address=request.address,
        delivery_fee=request.delivery_fee,
        delivery_time_minutes=request.delivery_time_minutes,
    )
    
    return BaseResponse(
        success=True,
        message="Restaurant updated successfully",
        data=updated
    )
