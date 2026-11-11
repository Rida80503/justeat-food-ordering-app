"""
User profile API routes.

WHY: REST endpoints for user account management (profile, password change).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user, get_current_customer, get_current_owner
from app.crud.user import update_user_profile as db_update_profile
from app.services.auth_service import AuthService
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import (
    UserProfileUpdateRequest,
    PasswordChangeRequest,
    UserResponse,
)
from app.schemas.common import BaseResponse

router = APIRouter(prefix="/api/users", tags=["users"])

                                                            
@router.get(
    "/profile",
    response_model=BaseResponse[UserResponse],
    summary="Get current user profile"
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get profile of authenticated user.
    
    WHY: Users can fetch their own profile data.
    Used for account page display.
    """
    return BaseResponse(
        success=True,
        message="Profile retrieved successfully",
        data=UserResponse.from_orm(current_user)
    )


@router.put(
    "/profile",
    response_model=BaseResponse[UserResponse],
    summary="Update user profile"
)
async def update_my_profile(
    request: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update current user's profile (name, phone).
    
    WHY: Users can update their personal information.
    
    Request:
        - first_name: Optional new first name
        - last_name: Optional new last name
        - phone: Optional phone number
        
    Response:
        - Updated UserResponse
    """
    updated_user = db_update_profile(db, current_user, request)
    
    return BaseResponse(
        success=True,
        message="Profile updated successfully",
        data=UserResponse.from_orm(updated_user)
    )


@router.post(
    "/password-change",
    response_model=BaseResponse[dict],
    summary="Change password"
)
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change user's password.
    
    WHY: Users can update their password for security.
    
    Request:
        - old_password: Current password (for verification)
        - new_password: New password (min 8 chars)
        
    Process:
        1. Verify old password matches
        2. Hash new password
        3. Update in database
        
    Errors:
        - 400: Old password incorrect
    """
    from app.core.security import verify_password
    from app.core.exceptions import InvalidCredentialsException
    from app.crud.user import update_user_password
    
    # Verify old password
    if not verify_password(request.old_password, current_user.password_hash):
        raise InvalidCredentialsException()
    
    # Hash new password
    new_password_hash = hash_password(request.new_password)
    
    # Update
    update_user_password(db, current_user, new_password_hash)
    
    return BaseResponse(
        success=True,
        message="Password changed successfully",
        data={}
    )



@router.get(
    "/role-check",
    response_model=BaseResponse[dict],
    summary="Check current user role"
)
async def check_user_role(
    current_user: User = Depends(get_current_user),
):
    """Expose the current role for frontend role-aware UI handling."""
    return BaseResponse(
        success=True,
        message="Role retrieved successfully",
        data={"role": current_user.role},
    )

