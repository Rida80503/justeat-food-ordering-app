"""
Dependency injection for protected routes.

WHY: FastAPI uses dependencies for request validation and data injection.
These dependencies verify JWT tokens, extract user, enforce roles.
Use these in route parameters to automatically validate/authorize requests.

Example:
    @router.get("/profile")
    def get_profile(current_user: User = Depends(get_current_user)):
        return current_user  # Automatically validated, authorized user
"""

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import decode_token
from app.core.exceptions import (
    InvalidTokenException,
    TokenExpiredException,
    PermissionDeniedException,
    UserInactiveException,
)
from app.crud.user import get_user_by_id
from app.models.user import User
from jose import JWTError

# OAuth2 scheme for Swagger documentation
# Tells FastAPI to expect a Bearer token in the Authorization header
# Automatically adds "Authorize" button in Swagger UI at /docs
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token"
)
print("TOKEN URL =", oauth2_scheme.model.flows.password.tokenUrl)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate current user from JWT token.
    
    WHY: Used in protected routes to ensure:
    1. Token is present
    2. Token is valid (not tampered)
    3. Token not expired
    4. User still exists in database
    
    Args:
        token: JWT token from Authorization header (extracted by OAuth2PasswordBearer)
        db: Database session
        
    Returns:
        User object if token valid
        
    Raises:
        InvalidTokenException: Token invalid or malformed
        TokenExpiredException: Token expired
        HTTPException 404: User not found
        
    Example:
        @router.get("/profile")
        async def profile(current_user: User = Depends(get_current_user)):
            return {"name": current_user.first_name}
    """
    # Decode token
    try:
        payload = decode_token(token)
    except JWTError as e:
        # Token tampered or expired
        if "expired" in str(e).lower():
            raise TokenExpiredException()
        raise InvalidTokenException()
    
    # Extract user_id from token
    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenException()
    
    # Convert to int
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise InvalidTokenException()
    
    # Fetch user from database
    user = get_user_by_id(db, user_id)
    if not user:
        raise InvalidTokenException()
    if not user.is_active:
        raise UserInactiveException()

    
    return user


async def get_current_customer(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensure current user has CUSTOMER role.
    
    WHY: Some routes only accessible to customers.
    e.g., Place order, add to cart, view preferences.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User if role is CUSTOMER
        
    Raises:
        PermissionDeniedException: User is not a customer
        
    Example:
        @router.post("/cart/items")
        async def add_to_cart(
            item: CartAddItemRequest,
            current_user: User = Depends(get_current_customer)
        ):
            # Only customers can add to cart
    """
    if current_user.role != "CUSTOMER":
        raise PermissionDeniedException(
            "Only customers can access this resource"
        )
    return current_user


async def get_current_owner(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensure current user has OWNER role.
    
    WHY: Owner-only operations (manage restaurants, menus, orders).
    e.g., Update restaurant details, set daily specials.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User if role is OWNER
        
    Raises:
        PermissionDeniedException: User is not an owner
        
    Example:
        @router.post("/restaurants")
        async def create_restaurant(
            data: RestaurantCreateRequest,
            current_user: User = Depends(get_current_owner)
        ):
            # Only owners can create restaurants
    """
    if current_user.role != "OWNER":
        raise PermissionDeniedException(
            "Only restaurant owners can access this resource"
        )
    return current_user


async def get_current_owner_or_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensure current user is OWNER or ADMIN.
    
    WHY: Some operations available to both owners and platform admins.
    (Admin role can be added later for platform management)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User if role is OWNER or ADMIN
        
    Raises:
        PermissionDeniedException: User lacks required role
    """
    if current_user.role not in ["OWNER", "ADMIN"]:
        raise PermissionDeniedException(
            "Insufficient permissions"
        )
    return current_user
