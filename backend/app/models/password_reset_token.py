"""
Password reset token model.

Stores password reset tokens for users.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class PasswordResetToken(BaseModel):
    """Password reset token."""

    __tablename__ = "password_reset_tokens"

    # Primary Key
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Foreign Key
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Token Information
    token: Mapped[str] = mapped_column(
        String(500),
        unique=True,
        nullable=False,
        index=True,
    )

    # Expiration
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    # Usage Tracking
    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships
    user = relationship(
        "User",
        back_populates="password_reset_tokens",
    )

    def __repr__(self) -> str:
        status = "USED" if self.is_used else "ACTIVE"

        return (
            f"<PasswordResetToken "
            f"user={self.user_id} "
            f"status={status}>"
        )

    def is_expired(self) -> bool:
        """Return True if token has expired."""

        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        """Return True if token is valid."""

        return not self.is_used and not self.is_expired()


__all__ = ["PasswordResetToken"]