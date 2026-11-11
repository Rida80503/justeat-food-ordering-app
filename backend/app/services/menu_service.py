"""
Menu business logic service.

WHY: Encapsulates menu item operations (CRUD, search).
Service layer between API routes and database CRUD operations.
"""

from sqlalchemy.orm import Session

from app.crud.menu import (
    get_menu_by_id,
    get_menusby_restaurant,
    get_menu_by_cuisine,
    create_menu as db_create_menu,
    update_menu as db_update_menu,
    mark_as_special as db_mark_special,
    mark_as_deal as db_mark_deal,
    deactivate_menu as db_deactivate_menu,
)
from app.core.exceptions import (
    PermissionDeniedException,
)
from app.models.menu import Menu
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.menu import MenuResponse


class MenuService:
    """Menu service."""

    @staticmethod
    def create_menu_item(
        db: Session,
        restaurant: Restaurant,
        owner: User,
        name: str,
        description: str,
        price: float,
        cuisine: str,
        image_url: str | None = None,
    ) -> MenuResponse:
        """Create menu item."""

        if restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only add items to your own restaurants")

        menu = db_create_menu(
            db=db,
            restaurant_id=restaurant.id,
            name=name,
            description=description,
            price=price,
            cuisine=cuisine,
            image_url=image_url,
        )

        return MenuResponse.from_orm(menu)

    @staticmethod
    def get_menu_item(db: Session, menu_id: int) -> MenuResponse:
        """Get menu item."""

        menu = get_menu_by_id(db, menu_id)

        if not menu or not menu.is_available:
            raise PermissionDeniedException("Menu item not found")

        return MenuResponse.from_orm(menu)

    @staticmethod
    def get_restaurant_menu(
        db: Session,
        restaurant_id: int,
        skip: int = 0,
        limit: int = 50,
    ) -> list[MenuResponse]:
        """Get restaurant menu."""

        items = get_menusby_restaurant(db, restaurant_id, skip, limit)

        return [MenuResponse.from_orm(item) for item in items]

    @staticmethod
    def search_by_cuisine(
        db: Session,
        restaurant_id: int,
        cuisine: str,
    ) -> list[MenuResponse]:
        """Search menu by cuisine."""

        items = get_menu_by_cuisine(db, restaurant_id, cuisine)

        return [MenuResponse.from_orm(item) for item in items]

    @staticmethod
    def update_menu_item(
        db: Session,
        menu: Menu,
        owner: User,
        **update_data,
    ) -> MenuResponse:
        """Update menu item."""

        if menu.restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only modify your own menu items")

        menu = db_update_menu(db, menu, **update_data)

        return MenuResponse.from_orm(menu)

    @staticmethod
    def mark_special(
        db: Session,
        menu: Menu,
        owner: User,
    ) -> MenuResponse:
        """Mark item as special."""

        if menu.restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only modify your own menu items")

        menu = db_mark_special(db, menu)

        return MenuResponse.from_orm(menu)

    @staticmethod
    def mark_deal(
        db: Session,
        menu: Menu,
        owner: User,
    ) -> MenuResponse:
        """Mark item as deal of the day."""

        if menu.restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only modify your own menu items")

        menu = db_mark_deal(db, menu)

        return MenuResponse.from_orm(menu)

    @staticmethod
    def deactivate_menu_item(
        db: Session,
        menu: Menu,
        owner: User,
    ) -> MenuResponse:
        """Deactivate menu item."""

        if menu.restaurant.owner_id != owner.id:
            raise PermissionDeniedException("You can only modify your own menu items")

        menu = db_deactivate_menu(db, menu)

        return MenuResponse.from_orm(menu)