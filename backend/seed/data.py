"""
Database seed data - creates test users, restaurants, menus, and orders.
Run: python seed/data.py from backend/ directory
"""

from app.db.database import SessionLocal
from app.models import User, Restaurant, Menu, Order, OrderItem, Cart
from app.core.security import hash_password
from datetime import datetime, timedelta
from app.models import CustomerPreference


def seed_database():
    """Populate database with test data."""
    db = SessionLocal()
    
    # Clear existing data
    print("Clearing existing data...")
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(Menu).delete()
    db.query(Cart).delete()
    db.query(Restaurant).delete()
    db.query(User).delete()
    
    # Create customers
    print("Creating customers...")
    customers = [
        User(email="alice@test.com", password_hash=hash_password("password123"), 
             first_name="Alice", last_name="Smith", role="CUSTOMER", is_active=True),
        User(email="bob@test.com", password_hash=hash_password("password123"), 
             first_name="Bob", last_name="Jones", role="CUSTOMER", is_active=True),
        User(email="charlie@test.com", password_hash=hash_password("password123"), 
             first_name="Charlie", last_name="Brown", role="CUSTOMER", is_active=True),
    ]
    for customer in customers:
        db.add(customer)
    db.commit()
    
    # Create owners
    print("Creating restaurant owners...")
    owners = [
        User(email="owner1@test.com", password_hash=hash_password("password123"), 
             first_name="John", last_name="Doe", role="OWNER", is_active=True),
        User(email="owner2@test.com", password_hash=hash_password("password123"), 
             first_name="Jane", last_name="Smith", role="OWNER", is_active=True),
    ]
    for owner in owners:
        db.add(owner)
    db.commit()
    
    # Create restaurants
    print("Creating restaurants...")
    restaurants = [
        Restaurant(owner_id=owners[0].id, name="Pizza Paradise", 
                  description="Best pizza in town", address="123 Main St", city="London",
                  cuisine_type="Italian", delivery_fee=2.99, delivery_time_minutes=30, is_active=True),
        Restaurant(owner_id=owners[0].id, name="Curry House", 
                  description="Authentic Indian cuisine", address="456 Oak Ave", city="London",
                  cuisine_type="Indian", delivery_fee=3.99, delivery_time_minutes=40, is_active=True),
        Restaurant(owner_id=owners[1].id, name="Burger King", 
                  description="Fresh burgers daily", address="789 Broadway", city="New York",
                  cuisine_type="American", delivery_fee=2.49, delivery_time_minutes=25, is_active=True),
    ]
    for restaurant in restaurants:
        db.add(restaurant)
    db.commit()
    
    # Create menus
    print("Creating menu items...")
    menus = [
        Menu(restaurant_id=restaurants[0].id, name="Margherita Pizza", 
             description="Fresh mozzarella and basil", price=12.99, cuisine="Italian", is_available=True),
        Menu(restaurant_id=restaurants[0].id, name="Pepperoni Pizza", 
             description="Classic pepperoni", price=13.99, cuisine="Italian", is_available=True, is_todays_special=True),
        Menu(restaurant_id=restaurants[1].id, name="Chicken Tikka Masala", 
             description="Creamy tomato sauce", price=14.99, cuisine="Indian", is_available=True),
        Menu(restaurant_id=restaurants[1].id, name="Garlic Naan", 
             description="Freshly baked bread", price=3.99, cuisine="Indian", is_available=True),
        Menu(restaurant_id=restaurants[2].id, name="Classic Burger", 
             description="Beef patty with lettuce and tomato", price=9.99, cuisine="American", is_available=True),
        Menu(restaurant_id=restaurants[2].id, name="French Fries", 
             description="Crispy golden fries", price=3.49, cuisine="American", is_available=True, is_deal_of_day=True),
    ]
    for menu in menus:
        db.add(menu)
    db.commit()
    
    # Create orders
    print("Creating sample orders...")
    order1 = Order(customer_id=customers[0].id, restaurant_id=restaurants[0].id, 
                   total_amount=26.98, status="DELIVERED", created_at=datetime.utcnow() - timedelta(days=5))
    db.add(order1)
    db.commit()
    
    order_item1 = OrderItem(order_id=order1.id, menu_id=menus[0].id, quantity=2, price_at_order=12.99)
    db.add(order_item1)
    db.commit()
    
    order2 = Order(customer_id=customers[1].id, restaurant_id=restaurants[1].id, 
                   total_amount=29.98, status="PENDING", created_at=datetime.utcnow())
    db.add(order2)
    db.commit()
    
    order_item2 = OrderItem(order_id=order2.id, menu_id=menus[2].id, quantity=2, price_at_order=14.99)
    db.add(order_item2)
    db.commit()
    
    # Create carts
    print("Creating shopping carts...")
    carts = [
        Cart(customer_id=customers[0].id, restaurant_id=restaurants[0].id, 
             total_items=0, total_price=0.0),
        Cart(customer_id=customers[1].id, restaurant_id=restaurants[1].id, 
             total_items=0, total_price=0.0),
        Cart(customer_id=customers[2].id, restaurant_id=restaurants[2].id, 
             total_items=0, total_price=0.0),
    ]
    for cart in carts:
        db.add(cart)
    db.commit()
    
    print("✅ Database seeded successfully!")
    print(f"   - {len(customers)} customers")
    print(f"   - {len(owners)} owners")
    print(f"   - {len(restaurants)} restaurants")
    print(f"   - {len(menus)} menu items")
    print(f"   - 2 sample orders")
    
    db.close()


if __name__ == "__main__":
    seed_database()
