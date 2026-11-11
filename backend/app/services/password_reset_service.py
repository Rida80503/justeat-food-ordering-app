"""
Password reset business logic service.

WHY: Secure password reset flow prevents unauthorized access.
Token-based approach avoids sending passwords via email.
Tokens are one-time use and time-limited.
"""

import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.crud.user import get_user_by_email, get_user_by_id, update_user_password
from app.models.password_reset_token import PasswordResetToken
from app.core.security import hash_password
from app.core.exceptions import (
    UserNotFoundException,
    InvalidPasswordResetTokenException,
)


class PasswordResetService:
    """
    WHY: Groups password reset operations together.
    Request token, validate token, reset password logic.
    """
    
    @staticmethod
    def request_password_reset(db: Session, email: str) -> str:
        """
        Generate password reset token for user email.
        
        WHY: User requests password reset by providing email.
        System generates secure token and email link to user.
        Token is valid for 1 hour (configurable).
        
        Args:
            db: Database session
            email: Email address of account
            
        Returns:
            Reset token (send this to user via email)
            
        Raises:
            UserNotFoundException: Email not registered
            
        Note:
            In real app, send token via email. For demo, return it directly.
        """
        # Find user
        user = get_user_by_email(db, email)
        if not user:
            raise UserNotFoundException("User with this email")
        
        # Generate cryptographically secure random token
        # WHY: secrets module for cryptographic randomness (not just random)
        token = secrets.token_urlsafe(32)
        
        # Create password reset token record
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        
        db.add(reset_token)
        db.commit()
        db.refresh(reset_token)
        
        return token
    
    @staticmethod
    def validate_reset_token(db: Session, token: str) -> int:
        """
        Validate reset token and return user_id.
        
        WHY: Before allowing password change, verify token is valid.
        Check: token exists, not expired, not already used.
        
        Args:
            db: Database session
            token: Reset token from email link
            
        Returns:
            User ID associated with token
            
        Raises:
            InvalidPasswordResetTokenException: Token invalid/expired/used
        """
        # Find token in database
        from sqlalchemy import select
        stmt = select(PasswordResetToken).where(PasswordResetToken.token == token)
        reset_token = db.execute(stmt).scalar_one_or_none()
        
        if not reset_token:
            raise InvalidPasswordResetTokenException()
        
        # Check if valid (not used and not expired)
        if not reset_token.is_valid():
            raise InvalidPasswordResetTokenException()
        
        return reset_token.user_id
    
    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        new_password: str
    ) -> bool:
        """
        Reset user's password using valid reset token.
        
        WHY: Final step of password reset.
        Validates token, marks as used, updates password hash.
        
        Args:
            db: Database session
            token: Reset token from email
            new_password: New password (plain text)
            
        Returns:
            True if successful
            
        Raises:
            InvalidPasswordResetTokenException: Token invalid/used/expired
            UserNotFoundException: Associated user not found
        """
        # Validate token and get user_id
        user_id = PasswordResetService.validate_reset_token(db, token)
        
        # Get user
        user = get_user_by_id(db, user_id)
        if not user:
            raise UserNotFoundException("User")
        
        # Hash new password
        password_hash = hash_password(new_password)
        
        # Update user's password
        update_user_password(db, user, password_hash)
        
        # Mark token as used
        from sqlalchemy import select
        stmt = select(PasswordResetToken).where(PasswordResetToken.token == token)
        reset_token = db.execute(stmt).scalar_one()
        reset_token.is_used = True
        db.commit()
        
        return True
