"""
Orders API routes.

WHY: REST endpoints for order management (track, update status, history).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_customer, get_current_owner
from app.services.order_service import OrderService
from app.crud.order import get_order_by_id
from app.models.user import User
from app.schemas.order import (
    OrderStatusUpdateRequest,
    OrderResponse,
    OrderDetailResponse,
)
from app.schemas.common import BaseResponse
from app.core.exceptions import UserNotFoundException

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get(
    "",
    response_model=BaseResponse[list[OrderResponse]],
    summary="Get customer orders"
)
async def get_customer_orders(
    skip: int = 0,
    limit: int = 50,
    status: str | None = None,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Get all orders for current customer (customer-only).
    """
    orders = OrderService.get_customer_orders_list(db, current_user, skip, limit)
    if status:
        orders = [o for o in orders if o.status == status.upper()]
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(orders)} orders",
        data=orders
    )


@router.get(
    "/history",
    response_model=BaseResponse[list[OrderResponse]],
    summary="Get order history (for reordering)"
)
async def get_order_history(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Get delivered orders for customer (for quick reordering).
    
    WHY: Customers can easily reorder from previously delivered orders.
    """
    orders = OrderService.get_order_history(db, current_user, skip, limit)
    
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(orders)} completed orders",
        data=orders
    )


@router.get(
    "/{order_id}",
    response_model=BaseResponse[OrderDetailResponse],
    summary="Get order details"
)
async def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed order information.
    
    WHY: Customer views their order items and latest status.
    Owner views orders for their restaurant.
    
    Authorization:
        - Customer can view their own orders
        - Owner can view orders from their restaurants
    """
    order = OrderService.get_order_details(db, order_id, current_user)
    
    return BaseResponse(
        success=True,
        message="Order details retrieved",
        data=order
    )


@router.put(
    "/{order_id}/status",
    response_model=BaseResponse[OrderResponse],
    summary="Update order status"
)
async def update_order_status(
    order_id: int,
    request: OrderStatusUpdateRequest,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Update order status (owner-only, must own restaurant).
    
    WHY: Restaurant owner tracks order through fulfillment stages.
    
    Status progression:
        PENDING → CONFIRMED → PREPARING → READY → DELIVERED
        
    Request:
        - status: New status (must follow progression rules)
        
    Errors:
        - 400: Invalid status or status regression
        - 403: Not authorized (don't own restaurant)
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise UserNotFoundException("Order")
    
    updated = OrderService.update_order_status(
        db=db,
        order=order,
        new_status=request.status,
        requesting_user=current_user,
    )
    
    return BaseResponse(
        success=True,
        message=f"Order status updated to {request.status}",
        data=updated
    )


@router.get(
    "/restaurant/{restaurant_id}",
    response_model=BaseResponse[list[OrderDetailResponse]],
    summary="Get restaurant orders"
)
async def get_restaurant_orders(
    restaurant_id: int,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Get all orders for restaurant (owner-only, must own restaurant).
    
    WHY: Restaurant owner views incoming orders for their restaurant.
    Used for order management dashboard.
    """
    orders = OrderService.get_restaurant_orders_list(
        db=db,
        owner=current_user,
        restaurant_id=restaurant_id,
        skip=skip,
        limit=limit,
    )
    
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(orders)} orders",
        data=orders
    )


@router.post(
    "/{order_id}/cancel",
    response_model=BaseResponse[OrderResponse],
    summary="Cancel order"
)
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Cancel order (customer-only, only if pending).
    
    WHY: Customer can cancel order before confirmation.
    Once order is confirmed, cancellation requires customer service.
    
    Errors:
        - 400: Cannot cancel non-pending order
        - 403: Not order customer
    """
    order = get_order_by_id(db, order_id)
    if not order:
        raise UserNotFoundException("Order")
    
    cancelled = OrderService.cancel_order(db, order, current_user)
    
    return BaseResponse(
        success=True,
        message="Order cancelled successfully",
        data=cancelled
    )


@router.post(
    "/{order_id}/reject",
    response_model=BaseResponse[OrderResponse],
    summary="Reject order (owner only)"
)
async def reject_order(
    order_id: int,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """Owner rejects a PENDING order (sets status to CANCELLED)."""
    from app.crud.restaurant import get_restaurant_by_id
    from app.crud.order import update_order_status as db_update_status
    from app.core.exceptions import PermissionDeniedException

    order = get_order_by_id(db, order_id)
    if not order:
        raise UserNotFoundException("Order")

    restaurant = get_restaurant_by_id(db, order.restaurant_id)
    if not restaurant or restaurant.owner_id != current_user.id:
        raise PermissionDeniedException("Not authorized to manage this order")

    if order.status != "PENDING":
        raise HTTPException(status_code=400, detail="Can only reject pending orders")

    updated = db_update_status(db, order, "CANCELLED")

    return BaseResponse(
        success=True,
        message="Order rejected",
        data=OrderResponse.from_orm(updated)
    )


@router.get(
    "/status/pending",
    response_model=BaseResponse[list[OrderResponse]],
    summary="Get pending orders"
)
async def get_pending_orders(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_owner),
    db: Session = Depends(get_db),
):
    """
    Get pending orders across all owned restaurants (owner-only).
    
    WHY: Owner dashboard shows pending orders needing confirmation.
    """
    from app.crud.order import get_orders_by_status
    
    pending_orders = get_orders_by_status(db, "PENDING", skip, limit)
    
    # Filter to only orders from owner's restaurants
    owner_pending = []
    for order in pending_orders:
        from app.crud.restaurant import get_restaurant_by_id
        restaurant = get_restaurant_by_id(db, order.restaurant_id)
        if restaurant.owner_id == current_user.id:
            owner_pending.append(order)
    
    return BaseResponse(
        success=True,
        message=f"Retrieved {len(owner_pending)} pending orders",
        data=[OrderResponse.from_orm(o) for o in owner_pending]
    )
