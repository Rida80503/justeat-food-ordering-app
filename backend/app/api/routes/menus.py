"""
Menu items API routes.

WHY: REST endpoints for menu operations (browse, create, manage items).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_owner
from app.services.menu_service import MenuService
from app.crud.menu import get_menu_by_id
from app.crud.restaurant import get_restaurant_by_id
from app.models.user import User
from app.schemas.menu import (
    MenuCreateRequest,
    MenuUpdateRequest,
    MenuResponse,
)
from app.schemas.common import BaseResponse
from app.core.exceptions import UserNotFoundException, PermissionDeniedException

router = APIRouter(prefix="/api/menus", tags=["menus"])


@router.post(
    "",
    response_model=BaseResponse[MenuResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create menu item"
)
async def create_menu_item(
    request: MenuCreateRequest,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Create new menu item (owner-only, must own restaurant).
    
    WHY: Only restaurant owners can add items to their menu.
    """
    restaurant = get_restaurant_by_id(db, request.restaurant_id)
    if not restaurant:
        raise UserNotFoundException("Restaurant")
    
    menu = MenuService.create_menu_item(
        db=db,
        restaurant=restaurant,
        owner=current_user,
        name=request.name,
        description=request.description,
        price=request.price,
        cuisine=request.cuisine,
        image_url=request.image_url,
    )
    
    return BaseResponse(
        success=True,
        message="Menu item created successfully",
        data=menu
    )


@router.get(
    "/restaurant/{restaurant_id}",
    response_model=BaseResponse[list[MenuResponse]],
    summary="Get restaurant menu"
)
async def get_restaurant_menu(
    restaurant_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Get all menu items for a restaurant (public operation).
    """
    restaurant = get_restaurant_by_id(db, restaurant_id)
    if not restaurant or not restaurant.is_active:
        raise UserNotFoundException("Restaurant")
    
    items = MenuService.get_restaurant_menu(db, restaurant_id, skip, limit)
    
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(items)} menu items",
        data=items
    )


@router.get(
    "/{menu_id}",
    response_model=BaseResponse[MenuResponse],
    summary="Get menu item details"
)
async def get_menu_item(
    menu_id: int,
    db: Session = Depends(get_db),
):
    """
    Get menu item details by ID (public operation).
    """
    menu = MenuService.get_menu_item(db, menu_id)
    
    return BaseResponse(
        success=True,
        message="Menu item details retrieved",
        data=menu
    )





@router.put(
    "/{menu_id}",
    response_model=BaseResponse[MenuResponse],
    summary="Update menu item"
)
async def update_menu_item(
    menu_id: int,
    request: MenuUpdateRequest,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Update menu item (owner-only, must own restaurant).
    """
    menu = get_menu_by_id(db, menu_id)
    if not menu:
        raise UserNotFoundException("Menu item")
    
    updated = MenuService.update_menu_item(
        db=db,
        menu=menu,
        owner=current_user,
        name=request.name,
        description=request.description,
        price=request.price,
        cuisine=request.cuisine,
        image_url=request.image_url,
        is_available=request.is_available,
        is_todays_special=request.is_todays_special,
        is_deal_of_day=request.is_deal_of_day,
    )
    
    return BaseResponse(
        success=True,
        message="Menu item updated successfully",
        data=updated
    )


@router.patch(
    "/{menu_id}/mark-special",
    response_model=BaseResponse[MenuResponse],
    summary="Mark item as today's special"
)
async def mark_special(
    menu_id: int,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Mark menu item as today's special (owner-only).
    """
    menu = get_menu_by_id(db, menu_id)
    if not menu:
        raise UserNotFoundException("Menu item")
    
    updated = MenuService.mark_special(db, menu, current_user)
    
    return BaseResponse(
        success=True,
        message="Item marked as today's special",
        data=updated
    )


@router.patch(
    "/{menu_id}/mark-deal",
    response_model=BaseResponse[MenuResponse],
    summary="Mark item as deal of the day"
)
async def mark_deal(
    menu_id: int,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Mark menu item as deal of the day (owner-only).
    """
    menu = get_menu_by_id(db, menu_id)
    if not menu:
        raise UserNotFoundException("Menu item")
    
    updated = MenuService.mark_deal(db, menu, current_user)
    
    return BaseResponse(
        success=True,
        message="Item marked as deal of the day",
        data=updated
    )


@router.delete(
    "/{menu_id}",
    response_model=BaseResponse[dict],
    summary="Deactivate menu item"
)
async def deactivate_menu_item(
    menu_id: int,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Make menu item unavailable (soft delete).
    """
    menu = get_menu_by_id(db, menu_id)
    if not menu:
        raise UserNotFoundException("Menu item")
    
    MenuService.deactivate_menu_item(db, menu, current_user)
    
    return BaseResponse(
        success=True,
        message="Menu item deactivated successfully",
        data={}
    )
