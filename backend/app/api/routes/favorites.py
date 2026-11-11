"""
Favorite restaurant API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_customer
from app.db.database import get_db
from app.models.favorite_restaurant import FavoriteRestaurant
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import BaseResponse


router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.post(
    "/{restaurant_id}",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Add restaurant to favorites",
)
async def add_to_favorites(
    restaurant_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    restaurant = db.execute(
        select(Restaurant).where(Restaurant.id == restaurant_id, Restaurant.is_active == True)
    ).scalar_one_or_none()
    if not restaurant:
        from app.core.exceptions import UserNotFoundException

        raise UserNotFoundException("Restaurant")

    existing = db.execute(
        select(FavoriteRestaurant).where(
            FavoriteRestaurant.customer_id == current_user.id,
            FavoriteRestaurant.restaurant_id == restaurant_id,
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Restaurant already in favorites")

    favorite = FavoriteRestaurant(customer_id=current_user.id, restaurant_id=restaurant_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return BaseResponse(
        success=True,
        message="Restaurant added to favorites",
        data={
            "id": favorite.id,
            "restaurant_id": restaurant.id,
            "restaurant_name": restaurant.name,
        },
    )


@router.get("", response_model=BaseResponse[dict], summary="Get favorite restaurants")
async def get_favorites(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size
    favorites = db.execute(
        select(FavoriteRestaurant, Restaurant)
        .join(Restaurant, Restaurant.id == FavoriteRestaurant.restaurant_id)
        .where(FavoriteRestaurant.customer_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    ).all()

    total = len(
        db.execute(
            select(FavoriteRestaurant).where(FavoriteRestaurant.customer_id == current_user.id)
        ).scalars().all()
    )

    payload = [
        {
            "id": fav.id,
            "restaurant_id": restaurant.id,
            "restaurant_name": restaurant.name,
            "cuisine_type": restaurant.cuisine_type,
        }
        for fav, restaurant in favorites
    ]

    return BaseResponse(
        success=True,
        message="Favorites retrieved",
        data={"favorites": payload, "total": total},
    )


@router.delete(
    "/{restaurant_id}",
    response_model=BaseResponse[dict],
    summary="Remove restaurant from favorites",
)
async def remove_from_favorites(
    restaurant_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    favorite = db.execute(
        select(FavoriteRestaurant).where(
            FavoriteRestaurant.customer_id == current_user.id,
            FavoriteRestaurant.restaurant_id == restaurant_id,
        )
    ).scalar_one_or_none()

    if not favorite:
        from app.core.exceptions import UserNotFoundException

        raise UserNotFoundException("Favorite")

    db.delete(favorite)
    db.commit()

    return BaseResponse(success=True, message="Restaurant removed from favorites", data={})
