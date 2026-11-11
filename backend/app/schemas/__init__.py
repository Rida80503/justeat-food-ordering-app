"""
Pydantic schemas for JustEat application.

WHY: Centralized exports for clean imports across application.
"""

# Common schemas
from app.schemas.common import BaseResponse, ErrorResponse, PaginatedResponse, TimestampedSchema

# User schemas
from app.schemas.user import (
    UserLoginRequest,
    UserProfileUpdateRequest,
    PasswordResetRequestSchema,
    PasswordResetCompleteSchema,
    UserResponse,
    TokenResponse,
)

# Restaurant schemas
from app.schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantUpdateRequest,
    RestaurantResponse,
    RestaurantDetailResponse,
)

# Menu schemas
from app.schemas.menu import (
    MenuCreateRequest,
    MenuUpdateRequest,
    MenuResponse,
    MenuDetailResponse,
)

# Order schemas
from app.schemas.order import (
    OrderCreateRequest,
    OrderStatusUpdateRequest,
    OrderItemResponse,
    OrderResponse,
    OrderDetailResponse,
    OrderStatusResponse,
    OrderHistoryItemResponse,
)

# Cart schemas
from app.schemas.cart import (
    CartAddItemRequest,
    CartUpdateItemRequest,
    CartItemResponse,
    CartResponse,
)

# Preference schemas
from app.schemas.preference import (
    DietaryRestrictionRequest,
    FavoriteCuisineRequest,
    PreferenceResponse,
    PreferencesListResponse,
)


__all__ = [
    # Common
    "BaseResponse",
    "ErrorResponse",
    "PaginatedResponse",
    "TimestampedSchema",
    # User
    "UserLoginRequest",
    "UserProfileUpdateRequest",
    "PasswordResetRequestSchema",
    "PasswordResetCompleteSchema",
    "UserResponse",
    "TokenResponse",
    # Restaurant
    "RestaurantCreateRequest",
    "RestaurantUpdateRequest",
    "RestaurantResponse",
    "RestaurantDetailResponse",
    # Menu
    "MenuCreateRequest",
    "MenuUpdateRequest",
    "MenuResponse",
    "MenuDetailResponse",
    # Order
    "OrderCreateRequest",
    "OrderStatusUpdateRequest",
    "OrderItemResponse",
    "OrderResponse",
    "OrderDetailResponse",
    "OrderStatusResponse",
    "OrderHistoryItemResponse",
    # Cart
    "CartAddItemRequest",
    "CartUpdateItemRequest",
    "CartItemResponse",
    "CartResponse",
    # Preference
    "DietaryRestrictionRequest",
    "FavoriteCuisineRequest",
    "PreferenceResponse",
    "PreferencesListResponse",
]
