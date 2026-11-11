"""
Preference Pydantic schemas for validation and documentation.

WHY: Validate preference creation.
Handle dietary restrictions and favorite cuisines.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class DietaryRestrictionRequest(BaseModel):
    """
    Schema for adding dietary restriction.
    
    WHY: Validate dietary restriction value.
    """
    
    dietary_restriction: str = Field(..., max_length=100, description="Dietary restriction")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dietary_restriction": "vegetarian"
            }
        }


class FavoriteCuisineRequest(BaseModel):
    """
    Schema for adding favorite cuisine.
    
    WHY: Validate cuisine value.
    """
    
    favorite_cuisine: str = Field(..., max_length=100, description="Favorite cuisine")
    
    class Config:
        json_schema_extra = {
            "example": {
                "favorite_cuisine": "Italian"
            }
        }


class CustomerPreferenceUpdateRequest(BaseModel):
    """Update or create the complete preference profile for the current customer."""

    favorite_cuisine: Optional[str] = Field(None, max_length=100)
    spice_level: Optional[str] = Field(None, max_length=50)
    veg_non_veg: Optional[str] = Field(None, max_length=50)
    budget_range: Optional[str] = Field(None, max_length=50)
    delivery_preference: Optional[str] = Field(None, max_length=50)
    dietary_preference: Optional[str] = Field(None, max_length=100)
    dietary_restriction: Optional[str] = Field(None, max_length=100)


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class PreferenceResponse(BaseModel):
    """
    Schema for individual preference.
    
    WHY: Return preference info.
    Shows what was stored.
    """
    
    id: int = Field(..., description="Preference ID")
    dietary_restriction: Optional[str] = Field(None, description="Dietary restriction")
    favorite_cuisine: Optional[str] = Field(None, description="Favorite cuisine")
    
    class Config:
        from_attributes = True


class PreferencesListResponse(BaseModel):
    """
    Schema for list of preferences.
    
    WHY: Return all preferences for customer.
    Organized by type.
    """
    
    dietary_restrictions: list[str] = Field(..., description="Dietary restrictions")
    favorite_cuisines: list[str] = Field(..., description="Favorite cuisines")
    spice_levels: list[str] = Field(default_factory=list, description="Preferred spice levels")
    veg_non_veg_options: list[str] = Field(default_factory=list, description="Veg / Non Veg preference")
    budget_ranges: list[str] = Field(default_factory=list, description="Budget ranges")
    delivery_preferences: list[str] = Field(default_factory=list, description="Delivery preferences")
    dietary_preferences: list[str] = Field(default_factory=list, description="Dietary preferences")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dietary_restrictions": ["vegetarian", "gluten_free"],
                "favorite_cuisines": ["Italian", "Indian"],
                "spice_levels": ["medium"],
                "veg_non_veg_options": ["veg"],
                "budget_ranges": ["moderate"],
                "delivery_preferences": ["express"],
                "dietary_preferences": ["high-protein"]
            }
        }


__all__ = [
    "DietaryRestrictionRequest",
    "FavoriteCuisineRequest",
    "CustomerPreferenceUpdateRequest",
    "PreferenceResponse",
    "PreferencesListResponse",
]
