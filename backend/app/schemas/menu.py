"""
Menu Pydantic schemas for validation and documentation.

WHY: Validate menu item creation/updates.
Different endpoints for customer view vs owner management.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class MenuCreateRequest(BaseModel):
    """
    Schema for creating menu item (owner only).
    
    WHY: Validate menu item details before saving.
    Restaurant ID provided via URL path.
    """
    restaurant_id: int = Field(..., description="Restaurant ID")
    name: str = Field(..., max_length=255, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    price: float = Field(..., gt=0, description="Item price in dollars")
    cuisine: Optional[str] = Field(None, max_length=100, description="Cuisine type")
    image_url: Optional[str] = Field(None, max_length=500, description="Image URL")
    is_available: bool = Field(True, description="Whether item is available")
    
    class Config:
        json_schema_extra = {
            "example": {
                "restaurant_id": 1,
                "name": "Margherita Pizza",
                "description": "Classic pizza with mozzarella and basil",
                "price": 12.99,
                "cuisine": "Italian",
                "image_url": "https://example.com/pizza.jpg",
                "is_available": True
            }
        }


class MenuUpdateRequest(BaseModel):
    """
    Schema for updating menu item (owner only).
    
    WHY: All fields optional for partial updates.
    Owner might only want to change price or availability.
    """
    
    name: Optional[str] = Field(None, max_length=255, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    price: Optional[float] = Field(None, gt=0, description="Item price")
    cuisine: Optional[str] = Field(None, max_length=100, description="Cuisine type")
    image_url: Optional[str] = Field(None, max_length=500, description="Image URL")
    is_available: Optional[bool] = Field(None, description="Whether available")
    is_todays_special: Optional[bool] = Field(None, description="Today's special flag")
    is_deal_of_day: Optional[bool] = Field(None, description="Deal of day flag")
    
    class Config:
        json_schema_extra = {
            "example": {
                "price": 14.99,
                "is_available": True,
                "is_todays_special": True
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class MenuResponse(BaseModel):
    """
    Schema for menu item response (customer view).
    
    WHY: Return menu items to customers.
    Includes pricing and availability info.
    Shows special offers.
    """
    
    id: int = Field(..., description="Menu item ID")
    name: str = Field(..., description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    price: float = Field(..., description="Price in dollars")
    cuisine: Optional[str] = Field(None, description="Cuisine type")
    image_url: Optional[str] = Field(None, description="Image URL")
    is_available: bool = Field(..., description="Whether available")
    is_todays_special: bool = Field(..., description="Today's special")
    is_deal_of_day: bool = Field(..., description="Deal of the day")
    created_at: datetime = Field(..., description="Creation time")
    updated_at: datetime = Field(..., description="Last update time")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Margherita Pizza",
                "description": "Classic pizza with mozzarella and basil",
                "price": 12.99,
                "cuisine": "Italian",
                "image_url": "https://example.com/pizza.jpg",
                "is_available": True,
                "is_todays_special": True,
                "is_deal_of_day": False,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class MenuDetailResponse(MenuResponse):
    """
    Detailed menu item response (includes restaurant ID).
    
    WHY: For detail endpoints showing full info.
    """
    
    restaurant_id: int = Field(..., description="Restaurant ID")
    
    class Config:
        from_attributes = True


__all__ = [
    "MenuCreateRequest",
    "MenuUpdateRequest",
    "MenuResponse",
    "MenuDetailResponse",
]
