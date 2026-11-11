"""
Common Pydantic schemas used across multiple endpoints.

WHY: Pydantic schemas validate data at API boundaries.
Prevents invalid data from reaching business logic.
Automatically generates OpenAPI documentation.
Provides IDE autocomplete for request/response data.
"""

from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Any, Generic, TypeVar


T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    """
    Standard API response wrapper.
    
    WHY: Consistent response format across all endpoints.
    All endpoints return success flag, message, and data.
    Makes client code simpler and more predictable.
    
    Fields:
        success: True if request succeeded, False if failed
        message: Human-readable message describing result
        data: The actual response data (generic)
    """
    
    success: bool = Field(..., description="Whether request was successful")
    message: str = Field(..., description="Response message")
    data: T | None = Field(None, description="Response data")


class ErrorResponse(BaseModel):
    """
    Standard error response format.
    
    WHY: Consistent error handling across API.
    Clients can parse errors in predictable format.
    Includes error codes for programmatic handling.
    
    Fields:
        success: Always False for errors
        message: Human-friendly error description
        error_code: Machine-readable error code
        status_code: HTTP status code
    """
    
    success: bool = Field(False, description="Always False for errors")
    message: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Machine-readable error code")
    status_code: int = Field(..., description="HTTP status code")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated list response wrapper.
    
    WHY: For endpoints returning many items.
    Prevents huge responses that slow down API.
    Client manages pagination with page/page_size.
    
    Fields:
        items: List of items on this page
        total: Total count of all items (not just this page)
        page: Current page number (1-indexed)
        page_size: Items per page
        total_pages: How many pages total
    """
    
    items: list[T] = Field(..., description="Items on this page")
    total: int = Field(..., description="Total items across all pages")
    page: int = Field(..., description="Current page number", ge=1)
    page_size: int = Field(..., description="Items per page", ge=1, le=100)
    total_pages: int = Field(..., description="Total number of pages")


class TimestampedSchema(BaseModel):
    """
    Base schema with creation/update timestamps.
    
    WHY: Many responses include timestamps.
    This mixin provides them consistently.
    
    Fields:
        created_at: When resource was created
        updated_at: When resource was last modified
    """
    
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last modification timestamp")


__all__ = [
    "BaseResponse",
    "ErrorResponse",
    "PaginatedResponse",
    "TimestampedSchema",
]
