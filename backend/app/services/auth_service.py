
"""
Authentication business logic service.

WHY: Separates authentication logic from API routes.
Routes call this service, not database directly.
"""

from sqlalchemy.orm import Session

from app.crud.user import get_user_by_email, create_user
from app.core.security import (
    verify_password,
    hash_password,
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
    def register_user(
        db: Session,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: str,
    ) -> UserResponse:
        """Register a new customer or restaurant owner."""

        email = email.strip().lower()

        existing_user = get_user_by_email(db, email)
        if existing_user:
            raise ValueError("An account with this email already exists")

        if role not in ("CUSTOMER", "OWNER"):
            raise ValueError("Invalid user role")

        password_hash = hash_password(password)

        user = create_user(
            db=db,
            email=email,
            password_hash=password_hash,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            role=role,
        )

        # Public owner registrations require approval.
        if role == "OWNER":
            user.is_active = False
            db.commit()
            db.refresh(user)

        return UserResponse.model_validate(user)

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
        selected_role: str | None = None,
    ) -> TokenResponse:
        """Authenticate user and verify the selected role."""

        user = get_user_by_email(db, email.strip().lower())

        if not user:
            raise InvalidCredentialsException()

        if not user.is_active:
            raise UserInactiveException()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        # Never trust the role selected on the frontend.
        # Verify it against the role stored in the database.
        if selected_role and user.role != selected_role:
            raise InvalidCredentialsException()

        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role}
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
