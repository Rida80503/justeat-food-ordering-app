"""
Restaurant Pydantic schemas for validation and documentation.

WHY: Validate restaurant creation/updates.
Different schemas for customer view vs owner view.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class RestaurantCreateRequest(BaseModel):
    """
    Schema for creating new restaurant (owner only).
    
    WHY: Validate restaurant details before saving to database.
    """
    
    name: str = Field(..., max_length=255, description="Restaurant name")
    description: Optional[str] = Field(None, description="Restaurant description")
    address: str = Field(..., max_length=500, description="Street address")
    city: str = Field(..., max_length=100, description="City name")
    cuisine_type: Optional[str] = Field(None, max_length=100, description="Type of cuisine")
    delivery_time_minutes: int = Field(30, ge=1, description="Estimated delivery time")
    delivery_fee: float = Field(0.0, ge=0, description="Delivery fee")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Pizza Palace",
                "description": "Best pizza in town",
                "address": "123 Main St",
                "city": "New York",
                "cuisine_type": "Italian",
                "delivery_time_minutes": 30,
                "delivery_fee": 2.99
            }
        }


class RestaurantUpdateRequest(BaseModel):
    """
    Schema for updating restaurant (owner only).
    
    WHY: All fields optional for partial updates.
    """
    
    name: Optional[str] = Field(None, max_length=255, description="Restaurant name")
    description: Optional[str] = Field(None, description="Restaurant description")
    address: Optional[str] = Field(None, max_length=500, description="Street address")
    city: Optional[str] = Field(None, max_length=100, description="City name")
    cuisine_type: Optional[str] = Field(None, max_length=100, description="Type of cuisine")
    delivery_time_minutes: Optional[int] = Field(None, ge=1, description="Delivery time")
    delivery_fee: Optional[float] = Field(None, ge=0, description="Delivery fee")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Pizza Palace Updated",
                "delivery_time_minutes": 35
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class RestaurantResponse(BaseModel):
    """
    Schema for restaurant response (customer view).
    
    WHY: Return restaurant info to customers.
    Standard format for all restaurant listings.
    """
    
    id: int = Field(..., description="Restaurant ID")
    name: str = Field(..., description="Restaurant name")
    description: Optional[str] = Field(None, description="Description")
    address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    cuisine_type: Optional[str] = Field(None, description="Cuisine type")
    average_rating: float = Field(..., description="Average rating (0-5)")
    delivery_time_minutes: int = Field(..., description="Delivery time in minutes")
    delivery_fee: float = Field(..., description="Delivery fee")
    is_active: bool = Field(..., description="Whether accepting orders")
    created_at: datetime = Field(..., description="Creation time")
    updated_at: datetime = Field(..., description="Last update time")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Pizza Palace",
                "description": "Best pizza in town",
                "address": "123 Main St",
                "city": "New York",
                "cuisine_type": "Italian",
                "average_rating": 4.5,
                "delivery_time_minutes": 30,
                "delivery_fee": 2.99,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class RestaurantDetailResponse(RestaurantResponse):
    """
    Detailed restaurant response (includes owner info).
    
    WHY: More detailed info for restaurant detail pages.
    Includes owner_id for owner operations.
    """
    
    owner_id: int = Field(..., description="Restaurant owner ID")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "owner_id": 10,
                "name": "Pizza Palace",
                "description": "Best pizza in town",
                "address": "123 Main St",
                "city": "New York",
                "cuisine_type": "Italian",
                "average_rating": 4.5,
                "delivery_time_minutes": 30,
                "delivery_fee": 2.99,
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


__all__ = [
    "RestaurantCreateRequest",
    "RestaurantUpdateRequest",
    "RestaurantResponse",
    "RestaurantDetailResponse",
]
