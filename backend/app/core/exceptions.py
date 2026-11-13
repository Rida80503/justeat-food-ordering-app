"""
Custom exception classes for the application.

WHY: Provides specific exception types for different error scenarios.
Allows for targeted error handling and meaningful error messages to clients.
Replaces generic Python exceptions with domain-specific ones.
"""

from fastapi import HTTPException, status


class InvalidCredentialsException(HTTPException):
    """
    WHY: Raised when user provides invalid email/password during login.
    Returns 401 Unauthorized with meaningful message.
    """
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


class TokenExpiredException(HTTPException):
    """
    WHY: Raised when JWT token has expired.
    Client must refresh token or re-authenticate.
    """
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidTokenException(HTTPException):
    """
    WHY: Raised when JWT token is malformed or invalid.
    Indicates tampering or corrupt token.
    """
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class UserEmailExistsException(HTTPException):
    """
    WHY: Raised when attempting to create user with existing email.
    Email must be unique for login system.
    """
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )


class UserNotFoundException(HTTPException):
    """
    WHY: Raised when user lookup fails by email or ID.
    User doesn't exist or has been deleted.
    """
    def __init__(self, identifier: str = "User"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{identifier} not found",
        )


class PermissionDeniedException(HTTPException):
    """
    WHY: Raised when user lacks permission for action.
    e.g., Customer trying to access owner operations.
    """
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class InvalidPasswordResetTokenException(HTTPException):
    """
    WHY: Raised when password reset token is invalid, expired, or already used.
    Prevents unauthorized password resets.
    """
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )


class UserInactiveException(HTTPException):
    """
    WHY: Raised when user account is inactive/deleted.
    Only active users can authenticate.
    """
    def __init__(self, detail: str = "User account is inactive"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class ValidationException(HTTPException):
    """
    WHY: Raised for validation errors not caught by Pydantic.
    Generic validation failure exception.
    """
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )
