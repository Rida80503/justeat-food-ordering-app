"""
Authentication business logic service.

WHY: Separates authentication logic from API routes.
Routes call this service, not database directly.
"""

import email

from sqlalchemy.orm import Session

from app.crud.user import (
    get_user_by_email,
)
from app.core.security import (
    verify_password,
    create_access_token,
)
from app.core.exceptions import (
    InvalidCredentialsException,
    UserInactiveException,
)
from app.schemas.user import TokenResponse, UserResponse



class AuthService:
    """Authentication service."""

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> TokenResponse:
        """Authenticate user."""

        user = get_user_by_email(db, email)

       
        if not user:
            raise InvalidCredentialsException()

        if not user.is_active:
            raise UserInactiveException()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role}
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
