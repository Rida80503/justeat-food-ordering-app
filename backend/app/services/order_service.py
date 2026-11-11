"""
Order business logic service.

WHY: Encapsulates order operations (create, status updates, history).
Service layer between API routes and database CRUD operations.
"""

from sqlalchemy.orm import Session

from app.crud.order import (
    get_order_by_id,
    get_customer_orders,
    get_restaurant_orders,
    create_order as db_create_order,
    add_order_item,
    update_order_status as db_update_order_status,
    get_order_items,
    cancel_order as db_cancel_order,
    get_customer_order_history,
)
from app.crud.cart import (
    get_cart_by_customer,
    clear_cart,
    get_cart_items,
)
from app.core.exceptions import (
    PermissionDeniedException,
    UserNotFoundException,
)
from app.models.order import Order
from app.models.user import User
from app.schemas.order import (
    OrderResponse,
    OrderDetailResponse,
)


class OrderService:
    """Order service."""

    @staticmethod
    def _build_order_detail_response(
        db: Session,
        order: Order,
    ) -> OrderDetailResponse:
        """Build detailed order response."""

        items = []

        for item in get_order_items(db, order.id):
            items.append(
                {
                    "id": item.id,
                    "menu_id": item.menu_id,
                    "item_name": item.menu.name,
                    "description": item.menu.description,
                    "quantity": item.quantity,
                    "price_at_order": float(item.price_at_order),
                }
            )

        customer_name = None
        customer_phone = None

        if order.customer:
            customer_name = (
                f"{order.customer.first_name} "
                f"{order.customer.last_name}"
            ).strip()
            customer_phone = order.customer.phone

        return OrderDetailResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=customer_name,
            customer_phone=customer_phone,
            restaurant_id=order.restaurant_id,
            restaurant_name=order.restaurant.name,
            total_amount=float(order.total_amount),
            status=order.status,
            special_instructions=order.special_instructions,
            created_at=order.created_at,
            updated_at=order.updated_at,
            items=items,
        )

    @staticmethod
    def create_order_from_cart(
        db: Session,
        customer: User,
        restaurant_id: int,
        special_instructions: str | None = None,
    ) -> OrderResponse:
        """Create order from cart."""

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers can create orders"
            )

        cart = get_cart_by_customer(db, customer.id)

        if not cart:
            raise UserNotFoundException("Cart")

        if cart.total_items == 0:
            raise PermissionDeniedException(
                "Cannot create order from empty cart"
            )

        order = db_create_order(
            db=db,
            customer_id=customer.id,
            restaurant_id=restaurant_id,
            total_amount=cart.total_price,
            special_instructions=special_instructions,
        )

        for item in get_cart_items(db, cart.id):
            add_order_item(
                db=db,
                order_id=order.id,
                menu_id=item.menu_id,
                quantity=item.quantity,
                price_at_order=item.price,
            )

        clear_cart(db, cart.id)

        return OrderResponse.from_orm(order)

    @staticmethod
    def get_order_details(
        db: Session,
        order_id: int,
        requesting_user: User,
    ) -> OrderDetailResponse:
        """Get order details."""

        order = get_order_by_id(db, order_id)

        if not order:
            raise UserNotFoundException("Order")

        if (
            requesting_user.role == "CUSTOMER"
            and order.customer_id != requesting_user.id
        ):
            raise PermissionDeniedException(
                "You can only view your own orders"
            )

        if (
            requesting_user.role == "OWNER"
            and order.restaurant.owner_id != requesting_user.id
        ):
            raise PermissionDeniedException(
                "You can only view orders from your restaurants"
            )

        return OrderService._build_order_detail_response(db, order)

    @staticmethod
    def get_customer_orders_list(
        db: Session,
        customer: User,
        skip: int = 0,
        limit: int = 20,
    ) -> list[OrderResponse]:
        """Get customer orders."""

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers can view their orders"
            )

        orders = get_customer_orders(
            db,
            customer.id,
            skip,
            limit,
        )

        return [OrderResponse.from_orm(order) for order in orders]

    @staticmethod
    def get_order_history(
        db: Session,
        customer: User,
        skip: int = 0,
        limit: int = 10,
    ) -> list[OrderResponse]:
        """Get customer order history."""

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers can view order history"
            )

        orders = get_customer_order_history(
            db,
            customer.id,
            skip,
            limit,
        )

        return [OrderResponse.from_orm(order) for order in orders]

    @staticmethod
    def get_restaurant_orders_list(
        db: Session,
        owner: User,
        restaurant_id: int,
        skip: int = 0,
        limit: int = 20,
    ) -> list[OrderDetailResponse]:
        """Get restaurant orders."""

        if owner.role != "OWNER":
            raise PermissionDeniedException(
                "Only owners can view restaurant orders"
            )

        orders = get_restaurant_orders(
            db,
            restaurant_id,
            skip,
            limit,
        )

        orders = [
            order
            for order in orders
            if order.restaurant.owner_id == owner.id
        ]

        return [
            OrderService._build_order_detail_response(
                db,
                order,
            )
            for order in orders
        ]

    @staticmethod
    def update_order_status(
        db: Session,
        order: Order,
        new_status: str,
        requesting_user: User,
    ) -> OrderResponse:
        """Update order status."""

        if requesting_user.role != "OWNER":
            raise PermissionDeniedException(
                "Only owners can update order status"
            )

        if order.restaurant.owner_id != requesting_user.id:
            raise PermissionDeniedException(
                "You can only update orders from your restaurants"
            )

        order = db_update_order_status(
            db,
            order,
            new_status,
        )

        return OrderResponse.from_orm(order)

    @staticmethod
    def cancel_order(
        db: Session,
        order: Order,
        customer: User,
    ) -> OrderResponse:
        """Cancel order."""

        if customer.role != "CUSTOMER":
            raise PermissionDeniedException(
                "Only customers can cancel orders"
            )

        if order.customer_id != customer.id:
            raise PermissionDeniedException(
                "You can only cancel your own orders"
            )

        order = db_cancel_order(
            db,
            order,
        )

        return OrderResponse.from_orm(order)