"""
Customer preference API routes.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_customer
from app.db.database import get_db
from app.models.preference import CustomerPreference
from app.models.user import User
from app.schemas.common import BaseResponse
from app.schemas.preference import (
    CustomerPreferenceUpdateRequest,
    DietaryRestrictionRequest,
    FavoriteCuisineRequest,
)


router = APIRouter(prefix="/api/preferences", tags=["preferences"])


def _get_customer_preferences(db: Session, customer_id: int) -> CustomerPreference | None:
    row = (
        db.execute(
            select(CustomerPreference)
            .where(CustomerPreference.customer_id == customer_id)
            .order_by(CustomerPreference.created_at.desc())
        )
        .scalars()
        .first()
    )
    return row


@router.get("", response_model=BaseResponse[dict], summary="Get user preferences")
async def get_preferences(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference = _get_customer_preferences(db, current_user.id)

    # Parse comma-separated dietary restrictions and cuisines
    dietary_restrictions = []
    if preference and preference.dietary_restriction:
        for idx, r in enumerate([x.strip() for x in preference.dietary_restriction.split(',') if x.strip()]):
            dietary_restrictions.append({"id": preference.id * 1000 + idx, "dietary_restriction": r, "value": r})

    favorite_cuisines = []
    if preference and preference.favorite_cuisine:
        for idx, c in enumerate([x.strip() for x in preference.favorite_cuisine.split(',') if x.strip()]):
            favorite_cuisines.append({"id": preference.id * 1000 + 100 + idx, "favorite_cuisine": c, "value": c})

    response_data = {
        "dietary_restrictions": dietary_restrictions,
        "favorite_cuisines": favorite_cuisines,
        "spice_levels": [value for value in [preference.spice_level if preference else None] if value],
        "veg_non_veg_options": [value for value in [preference.veg_non_veg if preference else None] if value],
        "budget_ranges": [value for value in [preference.budget_range if preference else None] if value],
        "delivery_preferences": [value for value in [preference.delivery_preference if preference else None] if value],
        "dietary_preferences": [value for value in [preference.dietary_preference if preference else None] if value],
    }

    return BaseResponse(
        success=True,
        message="Preferences retrieved",
        data=response_data,
    )


@router.post(
    "",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Save or update customer preferences",
)
async def save_preferences(
    request: CustomerPreferenceUpdateRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference = _get_customer_preferences(db, current_user.id)
    if not preference:
        preference = CustomerPreference(customer_id=current_user.id)
        db.add(preference)

    for field, value in request.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(preference, field, value)

    db.commit()
    db.refresh(preference)

    return BaseResponse(
        success=True,
        message="Preferences saved",
        data={
            "id": preference.id,
            "favorite_cuisine": preference.favorite_cuisine,
            "spice_level": preference.spice_level,
            "veg_non_veg": preference.veg_non_veg,
            "budget_range": preference.budget_range,
            "delivery_preference": preference.delivery_preference,
            "dietary_preference": preference.dietary_preference,
            "dietary_restriction": preference.dietary_restriction,
        },
    )


@router.post(
    "/dietary",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Add dietary restriction",
)
async def add_dietary_restriction(
    request: DietaryRestrictionRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference = _get_customer_preferences(db, current_user.id)
    if not preference:
        preference = CustomerPreference(customer_id=current_user.id)
        db.add(preference)
        db.flush()

    # Handle multiple dietary restrictions as comma-separated values
    current_restrictions = set()
    if preference.dietary_restriction:
        current_restrictions = set(r.strip() for r in preference.dietary_restriction.split(','))
    
    current_restrictions.add(request.dietary_restriction.strip())
    preference.dietary_restriction = ', '.join(sorted(current_restrictions))
    
    db.commit()
    db.refresh(preference)

    return BaseResponse(
        success=True,
        message="Dietary restriction added",
        data={
            "id": preference.id,
            "dietary_restriction": request.dietary_restriction,
        },
    )


@router.post(
    "/cuisine",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Add favorite cuisine",
)
async def add_favorite_cuisine(
    request: FavoriteCuisineRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    preference = _get_customer_preferences(db, current_user.id)
    if not preference:
        preference = CustomerPreference(customer_id=current_user.id)
        db.add(preference)
        db.flush()

    # Handle multiple favorite cuisines as comma-separated values
    current_cuisines = set()
    if preference.favorite_cuisine:
        current_cuisines = set(c.strip() for c in preference.favorite_cuisine.split(','))
    
    current_cuisines.add(request.favorite_cuisine.strip())
    preference.favorite_cuisine = ', '.join(sorted(current_cuisines))
    
    db.commit()
    db.refresh(preference)

    return BaseResponse(
        success=True,
        message="Favorite cuisine added",
        data={
            "id": preference.id,
            "favorite_cuisine": request.favorite_cuisine,
        },
    )


@router.delete(
    "/dietary/{preference_id}",
    response_model=BaseResponse[dict],
    summary="Remove dietary restriction",
)
async def remove_dietary_restriction(
    preference_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    # preference_id is actually the generated ID (preference.id * 1000 + idx)
    # We need to extract the actual index to remove
    actual_pref_id = preference_id // 1000
    idx_to_remove = preference_id % 1000
    
    preference = db.execute(
        select(CustomerPreference).where(
            CustomerPreference.id == actual_pref_id,
            CustomerPreference.customer_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not preference:
        from app.core.exceptions import UserNotFoundException
        raise UserNotFoundException("Preference")

    if preference.dietary_restriction:
        restrictions = [r.strip() for r in preference.dietary_restriction.split(',') if r.strip()]
        if idx_to_remove < len(restrictions):
            restrictions.pop(idx_to_remove)
            preference.dietary_restriction = ', '.join(restrictions) if restrictions else None
        
    db.commit()
    return BaseResponse(success=True, message="Dietary restriction removed", data={})


@router.delete(
    "/cuisine/{preference_id}",
    response_model=BaseResponse[dict],
    summary="Remove favorite cuisine",
)
async def remove_favorite_cuisine(
    preference_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    # preference_id is actually the generated ID (preference.id * 1000 + 100 + idx)
    # We need to extract the actual index to remove
    actual_pref_id = preference_id // 1000
    idx_to_remove = (preference_id % 1000) - 100
    
    preference = db.execute(
        select(CustomerPreference).where(
            CustomerPreference.id == actual_pref_id,
            CustomerPreference.customer_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not preference:
        from app.core.exceptions import UserNotFoundException
        raise UserNotFoundException("Preference")

    if preference.favorite_cuisine:
        cuisines = [c.strip() for c in preference.favorite_cuisine.split(',') if c.strip()]
        if idx_to_remove < len(cuisines):
            cuisines.pop(idx_to_remove)
            preference.favorite_cuisine = ', '.join(cuisines) if cuisines else None
        
    db.commit()
    return BaseResponse(success=True, message="Favorite cuisine removed", data={})
