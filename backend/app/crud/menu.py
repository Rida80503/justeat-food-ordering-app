"""
CRUD operations for Menu model.

WHY: Repository pattern for menu items management.
Handles creation, retrieval, updates of restaurant menu items.
"""

from sqlalchemy.orm import Session

from app.models.menu import Menu


def get_menu_by_id(db: Session, menu_id: int) -> Menu | None:
    """Get menu item by ID."""
    return db.query(Menu).filter(Menu.id == menu_id).first()


def get_menusby_restaurant(db: Session, restaurant_id: int, skip: int = 0, limit: int = 50) -> list[Menu]:
    """Get all menu items for a restaurant."""
    return db.query(Menu).filter(Menu.restaurant_id == restaurant_id, Menu.is_available == True).offset(skip).limit(limit).all()


def get_menu_by_cuisine(db: Session, restaurant_id: int, cuisine: str) -> list[Menu]:
    """Get menu items by cuisine type."""
    return db.query(Menu).filter(Menu.restaurant_id == restaurant_id, Menu.cuisine == cuisine, Menu.is_available == True).all()


def create_menu(
    db: Session,
    restaurant_id: int,
    name: str,
    description: str,
    price: float,
    cuisine: str,
    image_url: str | None = None,
) -> Menu:
    """Create new menu item."""

    menu = Menu(
        restaurant_id=restaurant_id,
        name=name,
        description=description,
        price=price,
        cuisine=cuisine,
        image_url=image_url,
        is_available=True,
        is_todays_special=False,
        is_deal_of_day=False,
    )

    db.add(menu)
    db.commit()
    db.refresh(menu)

    return menu


def update_menu(db: Session, menu: Menu, **kwargs) -> Menu:
    """Update menu item details."""

    for key, value in kwargs.items():
        if value is not None and hasattr(menu, key):
            setattr(menu, key, value)

    db.commit()
    db.refresh(menu)

    return menu


# def mark_as_special(db: Session, menu: Menu) -> Menu:
#     """Mark menu item as today's special."""

#     menu.is_todays_special = True

#     db.commit()
#     db.refresh(menu)

#     return menu


def mark_as_special(db: Session, menu: Menu) -> Menu:
    """Toggle today's special."""

    menu.is_todays_special = not menu.is_todays_special

    db.commit()
    db.refresh(menu)

    return menu


# def mark_as_deal(db: Session, menu: Menu) -> Menu:
#     """Mark menu item as deal of the day."""

#     menu.is_deal_of_day = True

#     db.commit()
#     db.refresh(menu)

#     return menu


def mark_as_deal(db: Session, menu: Menu) -> Menu:
    """Toggle deal of the day."""

    menu.is_deal_of_day = not menu.is_deal_of_day

    db.commit()
    db.refresh(menu)

    return menu



def deactivate_menu(db: Session, menu: Menu) -> Menu:
    """Mark menu item as unavailable."""

    menu.is_available = False

    db.commit()
    db.refresh(menu)

    return menu