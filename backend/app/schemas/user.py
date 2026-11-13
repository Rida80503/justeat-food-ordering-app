
"""
User Pydantic schemas for validation and documentation.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
    model_validator,
)


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegisterRequest(BaseModel):
    """Schema for new customer and restaurant owner registration."""

    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    confirm_password: str = Field(..., min_length=8, max_length=72)
    role: Literal["CUSTOMER", "OWNER"]

    @model_validator(mode="after")
    def validate_password_confirmation(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8, max_length=72)


class PasswordResetRequestSchema(BaseModel):
    email: EmailStr


class PasswordResetCompleteSchema(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=8, max_length=72)


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class UserResponse(BaseModel):
    """User information returned by the API. Never exposes password_hash."""

    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


__all__ = [
    "UserLoginRequest",
    "UserRegisterRequest",
    "UserProfileUpdateRequest",
    "PasswordChangeRequest",
    "PasswordResetRequestSchema",
    "PasswordResetCompleteSchema",
    "UserResponse",
    "TokenResponse",
]
