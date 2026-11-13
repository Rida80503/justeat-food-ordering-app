
"""
Authentication API routes (registration, login, logout, password reset).

WHY: Exposes authentication functionality as HTTP endpoints.
Routes call service layer, not database directly.
All requests/responses validated by Pydantic schemas.
"""

from fastapi import APIRouter, Depends, status, Form, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import BaseResponse
from app.schemas.user import (
    UserRegisterRequest,
    TokenResponse,
    UserResponse,
    PasswordResetRequestSchema,
    PasswordResetCompleteSchema,
)
from app.services.auth_service import AuthService
from app.services.password_reset_service import PasswordResetService

router = APIRouter(prefix="/api/auth", tags=["authentication"])


# ============================================================================
# Registration
# ============================================================================

@router.post(
    "/register",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user = AuthService.register_user(
            db=db,
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
            role=request.role,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    message = (
        "Registration successful. Your account is active."
        if user.role == "CUSTOMER"
        else "Registration received. Your restaurant owner account requires approval."
    )

    return BaseResponse(
        success=True,
        message=message,
        data=user,
    )


# ============================================================================
# Login (Frontend)
# ============================================================================

@router.post(
    "/login",
    response_model=BaseResponse[TokenResponse],
)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    role: str | None = Form(None),
    db: Session = Depends(get_db),
):
    token_response = AuthService.authenticate_user(
        db=db,
        email=username,
        password=password,
        selected_role=role,
    )

    return BaseResponse(
        success=True,
        message="Login successful",
        data=token_response,
    )


# ============================================================================
# Swagger OAuth2 Login
# ============================================================================

@router.post(
    "/token",
    response_model=TokenResponse,
    summary="OAuth2 token endpoint for Swagger",
)
async def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token_response = AuthService.authenticate_user(
        db=db,
        email=form_data.username,
        password=form_data.password,
    )

    return token_response


# ============================================================================
# Logout
# ============================================================================

@router.get(
    "/logout",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Logout current user",
)
async def logout(
    current_user: User = Depends(get_current_user),
):
    return BaseResponse(
        success=True,
        message="Logout successful",
        data={},
    )


# ============================================================================
# Password Reset Request
# ============================================================================

@router.post(
    "/password-reset-request",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
)
async def request_password_reset(
    request: PasswordResetRequestSchema,
    db: Session = Depends(get_db),
):
    token = PasswordResetService.request_password_reset(
        db=db,
        email=request.email,
    )

    return BaseResponse(
        success=True,
        message="Password reset token sent to email",
        data={"reset_token": token},
    )


# ============================================================================
# Password Reset Complete
# ============================================================================

@router.post(
    "/password-reset-complete",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
)
async def complete_password_reset(
    request: PasswordResetCompleteSchema,
    db: Session = Depends(get_db),
):
    PasswordResetService.reset_password(
        db=db,
        token=request.reset_token,
        new_password=request.new_password,
    )

    return BaseResponse(
        success=True,
        message="Password reset successfully",
        data={},
    )


# ============================================================================
# Current User
# ============================================================================

@router.get(
    "/me",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_200_OK,
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return BaseResponse(
        success=True,
        message="User profile retrieved",
        data=UserResponse.model_validate(current_user),
    )
