"""
Recommendation API routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_customer
from app.db.database import get_db
from app.models.favorite_restaurant import FavoriteRestaurant
from app.models.preference import CustomerPreference
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import BaseResponse


router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("", response_model=BaseResponse[dict], summary="Get personalized recommendations")
async def get_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    # --- Priority 1: Favourite restaurants ---
    fav_rows = db.execute(
        select(FavoriteRestaurant).where(FavoriteRestaurant.customer_id == current_user.id)
    ).scalars().all()
    favorite_restaurant_ids = {row.restaurant_id for row in fav_rows}

    fav_restaurants = []
    if favorite_restaurant_ids:
        fav_restaurants = db.execute(
            select(Restaurant).where(
                Restaurant.id.in_(favorite_restaurant_ids),
                Restaurant.is_active == True,
            )
        ).scalars().all()

    # --- Priority 2: Favourite cuisines from preferences ---
    pref_rows = db.execute(
        select(CustomerPreference).where(CustomerPreference.customer_id == current_user.id)
    ).scalars().all()

    cuisine_preferences = []
    for row in pref_rows:
        if row.favorite_cuisine:
            for c in row.favorite_cuisine.split(","):
                c = c.strip()
                if c and c not in cuisine_preferences:
                    cuisine_preferences.append(c)

    # --- Priority 3: Dietary restrictions (exclusion list) ---
    dietary_restrictions = []
    for row in pref_rows:
        if row.dietary_restriction:
            for d in row.dietary_restriction.split(","):
                d = d.strip().lower()
                if d:
                    dietary_restrictions.append(d)

    recommendations = []
    seen_ids = set()

    # Add favourite restaurants first
    for r in fav_restaurants:
        if r.id not in seen_ids:
            recommendations.append({
                "id": r.id,
                "restaurant_id": r.id,
                "restaurant_name": r.name,
                "reason": "Your favourite restaurant",
            })
            seen_ids.add(r.id)

    # Add cuisine-matching restaurants (excluding already added)
    for cuisine in cuisine_preferences:
        if len(recommendations) >= limit:
            break
        matching = db.execute(
            select(Restaurant).where(
                Restaurant.is_active == True,
                Restaurant.cuisine_type.ilike(f"%{cuisine}%"),
                ~Restaurant.id.in_(seen_ids),
            ).order_by(desc(Restaurant.average_rating))
        ).scalars().all()
        for r in matching:
            if len(recommendations) >= limit:
                break
            recommendations.append({
                "id": r.id,
                "restaurant_id": r.id,
                "restaurant_name": r.name,
                "reason": f"Matches your {cuisine} preference",
            })
            seen_ids.add(r.id)

    # If no preferences at all, show all restaurants
    if not favorite_restaurant_ids and not cuisine_preferences:
        all_restaurants = db.execute(
            select(Restaurant).where(Restaurant.is_active == True)
            .order_by(desc(Restaurant.average_rating))
            .limit(limit)
        ).scalars().all()
        for r in all_restaurants:
            if r.id not in seen_ids:
                recommendations.append({
                    "id": r.id,
                    "restaurant_id": r.id,
                    "restaurant_name": r.name,
                    "reason": "Popular restaurant",
                })
                seen_ids.add(r.id)

    return BaseResponse(
        success=True,
        message="Recommendations retrieved",
        data={"recommendations": recommendations[:limit]},
    )


@router.get(
    "/cuisines",
    response_model=BaseResponse[dict],
    summary="Get cuisine-based recommendations",
)
async def get_cuisine_recommendations(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    pref_rows = db.execute(
        select(CustomerPreference).where(CustomerPreference.customer_id == current_user.id)
    ).scalars().all()

    cuisines = []
    for row in pref_rows:
        if row.favorite_cuisine:
            for c in row.favorite_cuisine.split(","):
                c = c.strip()
                if c and c not in cuisines:
                    cuisines.append(c)

    grouped = []
    for cuisine in cuisines[:6]:
        restaurants = db.execute(
            select(Restaurant)
            .where(Restaurant.is_active == True, Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
            .order_by(desc(Restaurant.average_rating))
            .limit(10)
        ).scalars().all()
        if restaurants:
            grouped.append({
                "cuisine": cuisine,
                "restaurants": [{"id": r.id, "name": r.name} for r in restaurants],
            })

    return BaseResponse(
        success=True,
        message="Cuisine recommendations retrieved",
        data={"recommendations": grouped},
    )



@router.get("", response_model=BaseResponse[dict], summary="Get personalized recommendations")
async def get_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference_rows = db.execute(
        select(CustomerPreference).where(CustomerPreference.customer_id == current_user.id)
    ).scalars().all()

    pref_cuisines = [row.favorite_cuisine for row in preference_rows if row.favorite_cuisine]
    ordered_cuisines = [
        cuisine
        for cuisine, _count in db.execute(
            select(Menu.cuisine, func.count(OrderItem.id))
            .join(OrderItem, OrderItem.menu_id == Menu.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.customer_id == current_user.id)
            .group_by(Menu.cuisine)
            .order_by(desc(func.count(OrderItem.id)))
        ).all()
        if cuisine
    ]

    candidate_cuisines = []
    for cuisine in pref_cuisines + ordered_cuisines:
        if cuisine and cuisine not in candidate_cuisines:
            candidate_cuisines.append(cuisine)

    favorite_restaurant_ids = {
        row.restaurant_id
        for row in db.execute(
            select(FavoriteRestaurant).where(FavoriteRestaurant.customer_id == current_user.id)
        ).scalars().all()
    }

    global_popularity = {
        restaurant_id: count
        for restaurant_id, count in db.execute(
            select(Menu.restaurant_id, func.count(OrderItem.id))
            .join(OrderItem, OrderItem.menu_id == Menu.id)
            .group_by(Menu.restaurant_id)
            .order_by(desc(func.count(OrderItem.id)))
        ).all()
    }

    recommendations = []
    for cuisine in candidate_cuisines or ["Italian", "Chinese", "Mexican"]:
        stmt = (
            select(Restaurant)
            .join(Menu, Menu.restaurant_id == Restaurant.id)
            .where(
                Restaurant.is_active == True,
                Restaurant.cuisine_type.is_not(None),
                Restaurant.cuisine_type.ilike(cuisine),
            )
            .distinct()
            .order_by(desc(Restaurant.average_rating), desc(func.coalesce(global_popularity.get(Restaurant.id, 0), 0)))
            .limit(limit)
        )
        if favorite_restaurant_ids:
            stmt = stmt.where(~Restaurant.id.in_(favorite_restaurant_ids))
        restaurants = db.execute(stmt).scalars().all()

        for restaurant in restaurants:
            recommendations.append(
                {
                    "id": restaurant.id,
                    "restaurant_id": restaurant.id,
                    "restaurant_name": restaurant.name,
                    "reason": f"Matches your {cuisine} preference",
                }
            )
            if len(recommendations) >= limit:
                break
        if len(recommendations) >= limit:
            break

    if not recommendations:
        fallback = db.execute(
            select(Restaurant)
            .where(Restaurant.is_active == True)
            .order_by(desc(Restaurant.average_rating), desc(Restaurant.delivery_fee))
            .limit(limit)
        ).scalars().all()
        recommendations = [
            {
                "id": restaurant.id,
                "restaurant_id": restaurant.id,
                "restaurant_name": restaurant.name,
                "reason": "Popular in your area",
            }
            for restaurant in fallback
        ]

    return BaseResponse(
        success=True,
        message="Recommendations retrieved",
        data={"recommendations": recommendations},
    )


@router.get(
    "/cuisines",
    response_model=BaseResponse[dict],
    summary="Get cuisine-based recommendations",
)
async def get_cuisine_recommendations(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference_rows = db.execute(
        select(CustomerPreference).where(CustomerPreference.customer_id == current_user.id)
    ).scalars().all()

    cuisines = []
    for row in preference_rows:
        if row.favorite_cuisine and row.favorite_cuisine not in cuisines:
            cuisines.append(row.favorite_cuisine)

    ordered_cuisines = [
        cuisine
        for cuisine, _count in db.execute(
            select(Menu.cuisine, func.count(OrderItem.id))
            .join(OrderItem, OrderItem.menu_id == Menu.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.customer_id == current_user.id)
            .group_by(Menu.cuisine)
            .order_by(desc(func.count(OrderItem.id)))
        ).all()
        if cuisine
    ]

    for cuisine in ordered_cuisines:
        if cuisine not in cuisines:
            cuisines.append(cuisine)

    if not cuisines:
        cuisines = ["Italian", "Chinese", "Mexican", "Indian"]

    grouped = []
    for cuisine in cuisines[:6]:
        restaurants = db.execute(
            select(Restaurant)
            .where(Restaurant.is_active == True, Restaurant.cuisine_type.ilike(cuisine))
            .order_by(desc(Restaurant.average_rating))
            .limit(10)
        ).scalars().all()
        grouped.append(
            {
                "cuisine": cuisine,
                "restaurants": [{"id": r.id, "name": r.name} for r in restaurants],
            }
        )

    return BaseResponse(
        success=True,
        message="Cuisine recommendations retrieved",
        data={"recommendations": grouped},
    )
