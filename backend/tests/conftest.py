"""
Pytest configuration for test fixtures and setup.

WHY: Conftest.py provides shared fixtures for all tests.
Includes database fixtures, client fixtures, test user creation.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.security import hash_password
from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models.user import User


# SQLite database for testing
# This database is used only while running pytest.
# Your actual project will continue using PostgreSQL.
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh test database for every test.
    """

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def override_get_db(db):
    """
    Override the application's database dependency.
    """

    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db

    yield

    app.dependency_overrides.clear()


@pytest.fixture
def client(override_get_db):
    """
    FastAPI test client.
    """
    return TestClient(app)


@pytest.fixture
def test_customer(db):
    """
    Create a test customer.
    """

    user = User(
        email="customer@test.com",
        password_hash=hash_password("password123"),
        first_name="Test",
        last_name="Customer",
        phone="1234567890",
        role="CUSTOMER",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@pytest.fixture
def test_owner(db):
    """
    Create a test restaurant owner.
    """

    user = User(
        email="owner@test.com",
        password_hash=hash_password("password123"),
        first_name="Test",
        last_name="Owner",
        phone="0987654321",
        role="OWNER",
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@pytest.fixture
def test_restaurant(db, test_owner):
    """
    Create a test restaurant.
    """

    from app.models.restaurant import Restaurant

    restaurant = Restaurant(
        owner_id=test_owner.id,
        name="Test Restaurant",
        description="A test restaurant",
        address="123 Main St",
        city="Test City",
        cuisine_type="Italian",
        delivery_fee=5.0,
        delivery_time_minutes=30,
        average_rating=4.5,
        is_active=True,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return restaurant


@pytest.fixture
def test_menu_item(db, test_restaurant):
    """
    Create a test menu item.
    """

    from app.models.menu import Menu

    menu = Menu(
        restaurant_id=test_restaurant.id,
        name="Spaghetti",
        description="Classic spaghetti carbonara",
        price=12.99,
        cuisine="Italian",
        image_url="https://example.com/spaghetti.jpg",
        is_available=True,
        is_todays_special=False,
        is_deal_of_day=False,
    )

    db.add(menu)
    db.commit()
    db.refresh(menu)

    return menu


@pytest.fixture
def customer_token(client, test_customer):
    """
    Login as customer and return JWT token.
    """

    response = client.post(
        "/api/auth/login",
        data={
            "username": "customer@test.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    return response.json()["data"]["access_token"]


@pytest.fixture
def owner_token(client, test_owner):
    """
    Login as owner and return JWT token.
    """

    response = client.post(
        "/api/auth/login",
        data={
            "username": "owner@test.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    return response.json()["data"]["access_token"]