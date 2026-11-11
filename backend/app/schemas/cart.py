"""
Cart Pydantic schemas for validation and documentation.

WHY: Validate cart operations.
Handles adding, updating, and removing items.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class CartAddItemRequest(BaseModel):
    """
    Schema for adding item to cart.
    
    WHY: Validate menu ID and quantity before adding.
    """
    
    menu_id: int = Field(..., gt=0, description="Menu item ID")
    quantity: int = Field(..., gt=0, description="Quantity to add")
    restaurant_id: int = Field(..., gt=0, description="Restaurant ID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "menu_id": 1,
                "quantity": 2,
                "restaurant_id": 1
            }
        }


class CartUpdateItemRequest(BaseModel):
    """
    Schema for updating cart item quantity.
    
    WHY: Validate new quantity before updating.
    """
    
    quantity: int = Field(..., gt=0, description="New quantity")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quantity": 3
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class CartItemResponse(BaseModel):
    """
    Schema for individual item in cart.
    
    WHY: Return cart item info.
    Shows item details and subtotal.
    """
    
    id: int = Field(..., description="Cart item ID")
    menu_id: int = Field(..., description="Menu item ID")
    item_name: str = Field(..., description="Item name")
    quantity: int = Field(..., description="Quantity in cart")
    price: float = Field(..., description="Item price")
    subtotal: float = Field(..., description="Quantity * price")
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """
    Schema for shopping cart response.
    
    WHY: Return full cart with all items.
    Shows cart totals and items.
    """
    
    id: int = Field(..., description="Cart ID")
    customer_id: int = Field(..., description="Customer ID")
    restaurant_id: Optional[int] = Field(None, description="Restaurant ID")
    restaurant_name: Optional[str] = Field(None, description="Restaurant name")
    total_items: int = Field(..., description="Total items in cart")
    total_price: float = Field(..., description="Total price")
    items: list[CartItemResponse] = Field(default_factory=list, description="Items in cart")
    created_at: datetime = Field(..., description="Cart creation time")
    updated_at: datetime = Field(..., description="Last update time")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 5,
                "customer_id": 1,
                "restaurant_id": 1,
                "restaurant_name": "Pizza Palace",
                "total_items": 2,
                "total_price": 27.98,
                "items": [
                    {
                        "id": 20,
                        "menu_id": 1,
                        "item_name": "Margherita Pizza",
                        "quantity": 1,
                        "price": 12.99,
                        "subtotal": 12.99
                    }
                ],
                "created_at": "2024-01-15T13:00:00Z",
                "updated_at": "2024-01-15T14:00:00Z"
            }
        }


__all__ = [
    "CartAddItemRequest",
    "CartUpdateItemRequest",
    "CartItemResponse",
    "CartResponse",
]
