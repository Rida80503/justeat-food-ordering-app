"""
Shopping cart API routes.

WHY: REST endpoints for cart operations (add, remove, view, checkout).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_customer
from app.services.cart_service import CartService
from app.models.user import User
from app.schemas.cart import (
    CartAddItemRequest,
    CartUpdateItemRequest,
    CartResponse,
)
from app.schemas.common import BaseResponse

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get(
    "",
    response_model=BaseResponse[CartResponse],
    summary="Get shopping cart"
)
async def get_cart(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Get current user's shopping cart (customer-only).
    
    WHY: Allows customers to view their cart before checkout.
    """
    cart = CartService.get_customer_cart(db, current_user)
    
    return BaseResponse(
        success=True,
        message="Cart retrieved successfully",
        data=cart
    )


@router.post(
    "/items",
    response_model=BaseResponse[CartResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add item to cart"
)
async def add_to_cart(
    request: CartAddItemRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Add menu item to shopping cart (customer-only).
    
    WHY: Customers browse menu and add items to cart before checkout.
    
    Request:
        - menu_id: Menu item to add
        - quantity: How many
        - restaurant_id: Restaurant providing the item
        
    Response:
        - Updated cart with new item
    """
    cart = CartService.add_to_cart(
        db=db,
        customer=current_user,
        menu_id=request.menu_id,
        restaurant_id=request.restaurant_id,
        quantity=request.quantity,
    )
    
    return BaseResponse(
        success=True,
        message="Item added to cart",
        data=cart
    )


@router.put(
    "/items/{menu_id}",
    response_model=BaseResponse[CartResponse],
    summary="Update cart item quantity"
)
async def update_item(
    menu_id: int,
    request: CartUpdateItemRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Update quantity of item in cart (customer-only).
    
    WHY: Customers adjust quantities before checkout.
    
    Request:
        - quantity: New quantity (0 to remove item)
        
    Response:
        - Updated cart
    """
    cart = CartService.update_cart_item(
        db=db,
        customer=current_user,
        menu_id=menu_id,
        quantity=request.quantity,
    )
    
    return BaseResponse(
        success=True,
        message="Cart item updated",
        data=cart
    )


@router.delete(
    "/items/{menu_id}",
    response_model=BaseResponse[CartResponse],
    summary="Remove item from cart"
)
async def remove_item(
    menu_id: int,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Remove item from cart (customer-only).
    """
    cart = CartService.remove_from_cart(db, current_user, menu_id)
    
    return BaseResponse(
        success=True,
        message="Item removed from cart",
        data=cart
    )


@router.delete(
    "",
    response_model=BaseResponse[CartResponse],
    summary="Clear shopping cart"
)
async def clear_cart(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Clear all items from cart (customer-only).
    """
    cart = CartService.clear_customer_cart(db, current_user)
    
    return BaseResponse(
        success=True,
        message="Cart cleared",
        data=cart
    )


@router.post(
    "/checkout",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Proceed to checkout"
)
async def checkout(
    restaurant_id: int,
    special_instructions: str | None = None,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    """
    Checkout (convert cart to order).
    
    WHY: Final step before payment.
    Cart items are converted to order for processing.
    
    Query params:
        - restaurant_id: Target restaurant
        - special_instructions: Optional delivery instructions
        
    Response:
        - Returns "Please proceed to payment"
        - In production, would create payment intent and redirect
    """
    # Import OrderService here to avoid circular imports
    from app.services.order_service import OrderService
    
    order = OrderService.create_order_from_cart(
        db=db,
        customer=current_user,
        restaurant_id=restaurant_id,
        special_instructions=special_instructions,
    )
    
    return BaseResponse(
        success=True,
        message="Order created successfully. Proceed to payment.",
        data={
            "order_id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
        }
    )
