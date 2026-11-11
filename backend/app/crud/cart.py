"""
CRUD operations for Cart and CartItem models.

WHY: Repository pattern for shopping cart management.
Handles cart creation, item addition/removal, updates.
"""

from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.cart_item import CartItem


def get_cart_by_customer(db: Session, customer_id: int) -> Cart | None:
    """Get cart for a specific customer."""
    return db.query(Cart).filter(Cart.customer_id == customer_id).first()


def get_cart_by_id(db: Session, cart_id: int) -> Cart | None:
    """Get cart by id."""
    return db.query(Cart).filter(Cart.id == cart_id).first()


def create_cart(db: Session, customer_id: int, restaurant_id: int) -> Cart:
    """Create new shopping cart."""
    cart = Cart(
        customer_id=customer_id,
        restaurant_id=restaurant_id,
        total_items=0,
        total_price=0.0,
    )
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


def get_or_create_cart(db: Session, customer_id: int, restaurant_id: int) -> Cart:
    """Get existing cart or create new one."""
    cart = get_cart_by_customer(db, customer_id)
    if not cart:
        cart = create_cart(db, customer_id, restaurant_id)
    return cart


def get_cart_item(db: Session, cart_id: int, menu_id: int) -> CartItem | None:
    """Get cart item."""
    return (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.menu_id == menu_id,
        )
        .first()
    )


def add_cart_item(db: Session, cart_id: int, menu_id: int, quantity: int, price: float) -> CartItem:
    """Add item to cart or update quantity."""

    cart_item = get_cart_item(db, cart_id, menu_id)

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            cart_id=cart_id,
            menu_id=menu_id,
            quantity=quantity,
            price=price,
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)

    return cart_item


def update_cart_item(db: Session, cart_item: CartItem, quantity: int) -> CartItem:
    """Update cart item quantity."""

    if quantity <= 0:
        db.delete(cart_item)
        db.commit()
        return cart_item

    cart_item.quantity = quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


def remove_cart_item(db: Session, cart_item: CartItem) -> None:
    """Remove item from cart."""

    db.delete(cart_item)
    db.commit()


def get_cart_items(db: Session, cart_id: int) -> list[CartItem]:
    """Get all items in cart."""
    return db.query(CartItem).filter(CartItem.cart_id == cart_id).all()


def clear_cart(db: Session, cart_id: int) -> None:
    """Remove all items from cart."""

    cart = get_cart_by_id(db, cart_id)

    for item in cart.items:
        db.delete(item)

    cart.total_items = 0
    cart.total_price = 0.0
    cart.restaurant_id = None  # Reset restaurant when cart is cleared

    db.commit()


def update_cart_totals(db: Session, cart_id: int) -> Cart:
    cart = get_cart_by_id(db, cart_id)

    cart.total_items = sum(item.quantity for item in cart.items)
    cart.total_price = sum(item.quantity * item.price for item in cart.items)

    if cart.total_items == 0:
        cart.restaurant_id = None

    db.commit()
    db.refresh(cart)

    return cart