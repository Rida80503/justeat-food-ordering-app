"""
CRUD operations for Order and OrderItem models.

WHY: Repository pattern for order management.
Handles order creation, status updates, history retrieval.
"""

from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem


def get_order_by_id(db: Session, order_id: int) -> Order | None:
    """Get order by ID."""
    return db.query(Order).filter(Order.id == order_id).first()


def get_customer_orders(
    db: Session,
    customer_id: int,
    skip: int = 0,
    limit: int = 20
) -> list[Order]:
    """Get all orders for a customer."""
    return db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.id.desc()).offset(skip).limit(limit).all()


def get_restaurant_orders(
    db: Session,
    restaurant_id: int,
    skip: int = 0,
    limit: int = 20
) -> list[Order]:
    """Get all orders for a restaurant."""
    return db.query(Order).filter(Order.restaurant_id == restaurant_id).order_by(Order.id.desc()).offset(skip).limit(limit).all()


def get_orders_by_status(
    db: Session,
    status: str,
    skip: int = 0,
    limit: int = 20
) -> list[Order]:
    """Get orders by status."""
    return db.query(Order).filter(Order.status == status).offset(skip).limit(limit).all()


def create_order(
    db: Session,
    customer_id: int,
    restaurant_id: int,
    total_amount: float,
    special_instructions: str | None = None
) -> Order:
    """Create new order."""

    order = Order(
        customer_id=customer_id,
        restaurant_id=restaurant_id,
        total_amount=total_amount,
        special_instructions=special_instructions,
        status="PENDING"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order


def add_order_item(
    db: Session,
    order_id: int,
    menu_id: int,
    quantity: int,
    price_at_order: float
) -> OrderItem:
    """Add item to order."""

    order_item = OrderItem(
        order_id=order_id,
        menu_id=menu_id,
        quantity=quantity,
        price_at_order=price_at_order
    )

    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    return order_item


def update_order_status(db: Session, order: Order, new_status: str) -> Order:
    """Update order status."""

    valid_statuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"]

    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}")

    order.status = new_status

    db.commit()
    db.refresh(order)

    return order


def get_order_items(db: Session, order_id: int) -> list[OrderItem]:
    """Get all items in an order."""
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()


def cancel_order(db: Session, order: Order) -> Order:
    """Cancel order."""

    if order.status != "PENDING":
        raise ValueError(f"Cannot cancel order with status {order.status}")

    order.status = "CANCELLED"

    db.commit()
    db.refresh(order)

    return order


def get_customer_order_history(
    db: Session,
    customer_id: int,
    skip: int = 0,
    limit: int = 10
) -> list[Order]:
    """Get delivered orders."""

    return db.query(Order).filter(
        Order.customer_id == customer_id,
        Order.status.in_(["DELIVERED", "COMPLETED"])
    ).order_by(Order.id.desc()).offset(skip).limit(limit).all()