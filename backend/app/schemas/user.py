"""
User Pydantic schemas for validation and documentation.

WHY: Validate user login and profile updates.
Separate schemas for different use cases (login vs profile).
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ============================================================================
# REQUEST SCHEMAS (Data coming FROM client)
# ============================================================================

class UserLoginRequest(BaseModel):
    """
    Schema for user login request.
    
    WHY: Validates login credentials before database query.
    Prevents invalid data from reaching auth service.
    
    Fields:
        email: User's email (must be valid email format)
        password: User's password (minimum 6 characters)
    """
    
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "customer@example.com",
                "password": "password123"
            }
        }


class UserProfileUpdateRequest(BaseModel):
    """
    Schema for updating user profile.
    
    WHY: Validate profile updates (name, phone).
    Allows partial updates (all fields optional).
    
    Fields:
        first_name: User's first name
        last_name: User's last name
        phone: Contact phone number
    """
    
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "phone": "1234567890"
            }
        }
class PasswordChangeRequest(BaseModel):
    """
    Schema for changing password.
    """

    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "oldpassword123",
                "new_password": "newpassword123"
            }
        }

class PasswordResetRequestSchema(BaseModel):
    """
    Schema for password reset request.
    
    WHY: Validate email before sending reset token.
    
    Fields:
        email: User's email address
    """
    
    email: EmailStr = Field(..., description="User email address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "customer@example.com"
            }
        }


class PasswordResetCompleteSchema(BaseModel):
    """
    Schema for password reset completion.
    
    WHY: Validate reset token and new password before updating.
    
    Fields:
        reset_token: The reset token from email
        new_password: New password to set
    """
    
    reset_token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "reset_token": "reset_token_from_email_here",
                "new_password": "newpassword123"
            }
        }


# ============================================================================
# RESPONSE SCHEMAS (Data going TO client)
# ============================================================================

class UserResponse(BaseModel):
    """
    Schema for user responses (login, profile).
    
    WHY: Standard user data in responses.
    Never includes password_hash (security).
    
    Fields:
        id: User ID
        email: User email
        first_name: First name
        last_name: Last name
        phone: Phone number
        role: User role (CUSTOMER or OWNER)
        is_active: Whether user is active
        created_at: When account was created
        updated_at: Last modification time
    """
    
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    phone: Optional[str] = Field(None, description="Phone number")
    role: str = Field(..., description="User role (CUSTOMER or OWNER)")
    is_active: bool = Field(..., description="Whether user is active")
    created_at: datetime = Field(..., description="Account creation time")
    updated_at: datetime = Field(..., description="Last modification time")
    
from pydantic import BaseModel, Field, ConfigDict

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "customer@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "1234567890",
                "role": "CUSTOMER",
                "is_active": True,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }
    )    

class TokenResponse(BaseModel):
    """
    Schema for login token response.
    
    WHY: Return access token to client after successful login.
    
    Fields:
        access_token: JWT token for API requests
        token_type: Type of token (always "bearer")
        user: User information
    """
    
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "customer@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "CUSTOMER",
                    "is_active": True,
                    "created_at": "2024-01-15T10:30:00Z",
                    "updated_at": "2024-01-15T10:30:00Z"
                }
            }
        }
__all__ = [
    "UserLoginRequest",
    "UserProfileUpdateRequest",
    "PasswordChangeRequest",
    "PasswordResetRequestSchema",
    "PasswordResetCompleteSchema",
    "UserResponse",
    "TokenResponse",
]
