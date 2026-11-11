"""
Security utilities for password hashing and JWT token management.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# JWT configuration
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM


def hash_password(password: str) -> str:
    """
    Hash a plain text password.

    Args:
        password: User password.

    Returns:
        Hashed password.
    """

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Password entered by the user.
        hashed_password: Password stored in the database.

    Returns:
        True if the password matches, otherwise False.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create an access token.

    Args:
        data: Data to store inside the token.
        expires_delta: Custom expiration time.

    Returns:
        JWT access token.
    """

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_EXPIRATION_MINUTES
        )

    to_encode.update(
        {
            "exp": expire,
            "jti": str(uuid4()),
        }
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT token.

    Args:
        token: JWT token.

    Returns:
        Decoded payload.

    Raises:
        JWTError: If the token is invalid or expired.
    """

    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )


def extract_token_from_header(
    authorization: Optional[str],
) -> Optional[str]:
    """
    Extract the JWT token from the Authorization header.

    Args:
        authorization: Authorization header.

    Returns:
        Token if present, otherwise None.
    """

    if not authorization:
        return None

    parts = authorization.split()

    if len(parts) != 2:
        return None

    if parts[0].lower() != "bearer":
        return None

    return parts[1]