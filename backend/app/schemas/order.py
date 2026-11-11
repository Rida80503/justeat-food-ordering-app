"""
Order Pydantic schemas for validation and documentation.

WHY: Validate order creation/updates.
Complex nested schemas (order with items).
Different views for customer vs owner.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class OrderCreateRequest(BaseModel):
    """
    Schema for creating order from cart (customer only).

    WHY: Only customer can validate special instructions.
    Order items come from shopping cart (validated separately).
    """

    special_instructions: Optional[str] = Field(None, max_length=500, description="Special requests")

    class Config:
        json_schema_extra = {
            "example": {
                "special_instructions": "Please ring doorbell twice"
            }
        }


class OrderStatusUpdateRequest(BaseModel):
    """
    Schema for updating order status (owner only).

    WHY: Validate status before updating.
    Only allows valid status transitions.
    """

    status: str = Field(
        ...,
        description="New status (PENDING, CONFIRMED, PREPARING, READY, DELIVERED)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status": "PREPARING"
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class OrderItemResponse(BaseModel):
    """
    Schema for individual item in order.

    WHY: Show what items are in the order.
    Includes quantity and historical price.
    """

    id: int = Field(..., description="Order item ID")
    menu_id: int = Field(..., description="Menu item ID")
    item_name: str = Field(..., description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    quantity: int = Field(..., description="Quantity ordered")
    price_at_order: float = Field(..., description="Price at time of order")

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """
    Schema for basic order response.

    WHY: Return order info to customer.
    Shows order details and current status.
    """

    id: int = Field(..., description="Order ID")
    customer_id: int = Field(..., description="Customer ID")
    restaurant_id: int = Field(..., description="Restaurant ID")
    restaurant_name: Optional[str] = Field(None, description="Restaurant name")
    total_amount: float = Field(..., description="Order total")
    status: str = Field(..., description="Current status")
    special_instructions: Optional[str] = Field(None, description="Special requests")
    created_at: datetime = Field(..., description="Order creation time")
    updated_at: datetime = Field(..., description="Last update time")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 50,
                "customer_id": 1,
                "restaurant_id": 1,
                "restaurant_name": "Pizza Palace",
                "total_amount": 25.98,
                "status": "PREPARING",
                "special_instructions": "Please ring doorbell twice",
                "created_at": "2024-01-15T14:00:00Z",
                "updated_at": "2024-01-15T14:05:00Z"
            }
        }


class OrderDetailResponse(OrderResponse):
    """
    Detailed order response including items.

    WHY: For order detail endpoints.
    Shows full breakdown of items in order.
    """

    customer_name: Optional[str] = Field(
        None,
        description="Customer full name"
    )

    customer_phone: Optional[str] = Field(
        None,
        description="Customer phone"
    )

    items: list[OrderItemResponse] = Field(..., description="Items in order")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 50,
                "customer_id": 1,
                "customer_name": "John Doe",
                "customer_phone": "9876543210",
                "restaurant_id": 1,
                "restaurant_name": "Pizza Palace",
                "total_amount": 25.98,
                "status": "PREPARING",
                "special_instructions": "Please ring doorbell twice",
                "items": [
                    {
                        "id": 100,
                        "menu_id": 1,
                        "item_name": "Margherita Pizza",
                        "description": "Classic pizza",
                        "quantity": 2,
                        "price_at_order": 12.99
                    }
                ],
                "created_at": "2024-01-15T14:00:00Z",
                "updated_at": "2024-01-15T14:05:00Z"
            }
        }


class OrderStatusResponse(BaseModel):
    """
    Schema for order status response.

    WHY: Lightweight response for tracking status.
    Used when full order details not needed.
    """

    order_id: int = Field(..., description="Order ID")
    status: str = Field(..., description="Current status")
    updated_at: datetime = Field(..., description="Last update time")

    class Config:
        json_schema_extra = {
            "example": {
                "order_id": 50,
                "status": "PREPARING",
                "updated_at": "2024-01-15T14:05:00Z"
            }
        }


class OrderHistoryItemResponse(OrderResponse):
    """
    Schema for order history listing.

    WHY: Simplified view for history lists.
    Shows key info without full item details.
    """

    customer_name: Optional[str] = Field(None, description="Customer name (owner view)")
    customer_phone: Optional[str] = Field(None, description="Customer phone (owner view)")

    class Config:
        from_attributes = True


__all__ = [
    "OrderCreateRequest",
    "OrderStatusUpdateRequest",
    "OrderItemResponse",
    "OrderResponse",
    "OrderDetailResponse",
    "OrderStatusResponse",
    "OrderHistoryItemResponse",
]