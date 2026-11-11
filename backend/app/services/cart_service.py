from sqlalchemy.orm import Session

from app.crud.cart import (
    get_cart_by_customer,
    get_cart_by_id,
    get_cart_item,
    get_or_create_cart,
    add_cart_item as db_add_cart_item,
    update_cart_item as db_update_cart_item,
    remove_cart_item as db_remove_cart_item,
    clear_cart as db_clear_cart,
    update_cart_totals,
)
from app.crud.menu import get_menu_by_id
from app.core.exceptions import (
    PermissionDeniedException,
    UserNotFoundException,
    ValidationException,
)
from app.models.user import User
from app.schemas.cart import CartResponse, CartItemResponse


class CartService:
    """Shopping cart service."""

    @staticmethod
    def _build_cart_response(db: Session, cart) -> CartResponse:
        items = []

        for item in cart.items:
            items.append(
                CartItemResponse(
                    id=item.id,
                    menu_id=item.menu_id,
                    item_name=item.menu.name,
                    quantity=item.quantity,
                    price=float(item.price),
                    subtotal=float(item.quantity * item.price),
                )
            )

        return CartResponse(
            id=cart.id,
            customer_id=cart.customer_id,
            restaurant_id=cart.restaurant_id,
            restaurant_name=cart.restaurant.name if cart.restaurant else None,
            total_items=cart.total_items,
            total_price=float(cart.total_price),
            items=items,
            created_at=cart.created_at,
            updated_at=cart.updated_at,
        )

    @staticmethod
    def get_customer_cart(
        db: Session,
        customer: User,
    ) -> CartResponse:

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers have shopping carts"
            )

        cart = get_cart_by_customer(db, customer.id)

        if not cart:
            raise UserNotFoundException("Cart")

        return CartService._build_cart_response(db, cart)

    @staticmethod
    def add_to_cart(
        db: Session,
        customer: User,
        menu_id: int,
        restaurant_id: int,
        quantity: int,
    ) -> CartResponse:

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers can add items to cart"
            )

        menu = get_menu_by_id(db, menu_id)

        if not menu or not menu.is_available:
            raise UserNotFoundException("Menu item")

        # Safety check
        if menu.restaurant_id != restaurant_id:
            raise ValidationException(
                "Selected menu item does not belong to this restaurant."
            )

        cart = get_cart_by_customer(db, customer.id)

        # Only block when cart actually contains items
        if (
            cart
            and cart.total_items > 0
            and cart.restaurant_id
            and cart.restaurant_id != restaurant_id
        ):
            raise ValidationException(
                f"Your cart contains items from {cart.restaurant.name}. "
                f"Please clear your cart before adding items from a different restaurant."
            )

        if not cart:
            cart = get_or_create_cart(
                db,
                customer.id,
                restaurant_id,
            )
        else:
            if cart.total_items == 0:
                cart.restaurant_id = restaurant_id
                db.commit()
                db.refresh(cart)

        db_add_cart_item(
            db=db,
            cart_id=cart.id,
            menu_id=menu_id,
            quantity=quantity,
            price=menu.price,
        )

        cart = update_cart_totals(db, cart.id)

        return CartService._build_cart_response(db, cart)

    @staticmethod
    def update_cart_item(
        db: Session,
        customer: User,
        menu_id: int,
        quantity: int,
    ) -> CartResponse:

        cart = get_cart_by_customer(db, customer.id)

        if not cart:
            raise UserNotFoundException("Cart")

        cart_item = get_cart_item(
            db,
            cart.id,
            menu_id,
        )

        if not cart_item:
            raise UserNotFoundException("Item")

        if quantity <= 0:
            db_remove_cart_item(db, cart_item)
        else:
            db_update_cart_item(
                db,
                cart_item,
                quantity,
            )

        cart = update_cart_totals(db, cart.id)

        return CartService._build_cart_response(db, cart)

    @staticmethod
    def remove_from_cart(
        db: Session,
        customer: User,
        menu_id: int,
    ) -> CartResponse:

        cart = get_cart_by_customer(db, customer.id)

        if not cart:
            raise UserNotFoundException("Cart")

        cart_item = get_cart_item(
            db,
            cart.id,
            menu_id,
        )

        if not cart_item:
            raise UserNotFoundException("Item")

        db_remove_cart_item(db, cart_item)

        cart = update_cart_totals(db, cart.id)

        return CartService._build_cart_response(db, cart)

    @staticmethod
    def clear_customer_cart(
        db: Session,
        customer: User,
    ) -> CartResponse:

        cart = get_cart_by_customer(db, customer.id)

        if not cart:
            raise UserNotFoundException("Cart")

        db_clear_cart(db, cart.id)

        cart = get_cart_by_id(db, cart.id)

        return CartService._build_cart_response(db, cart)