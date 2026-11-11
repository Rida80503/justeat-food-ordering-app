# JustEat - Food Ordering Application

## Overview

JustEat is a **production-ready full-stack food ordering application** built with **React 18**, **FastAPI**, and **PostgreSQL**. It implements a complete marketplace for customers to browse, order food from restaurants and for restaurant owners to manage their operations.

## 📂 Source Code

**GitLab Repository**

https://git-training.nagarro.com/nagarro_fresher_training/general-account/rida-khan-3221674

---

## 🌐 Live Demo

### Frontend
https://justeat-frontend-rida.azurewebsites.net

### Backend API
https://justeat-backend-rida.azurewebsites.net

### Swagger API Documentation
https://justeat-backend-rida.azurewebsites.net/docs

---


## 🎯 Key Features

### Customer Features

- ✅ User authentication with JWT tokens
- ✅ Browse restaurants by location and cuisine
- ✅ Search menu items
- ✅ Shopping cart management
- ✅ Place orders with special instructions
- ✅ Track order status in real-time
- ✅ View order history for quick reordering
- ✅ Save favorite restaurants
- ✅ Store dietary preferences

### Restaurant Owner Features

- ✅ Restaurant creation and management
- ✅ Menu item management (add, edit, mark specials)
- ✅ Order management dashboard
- ✅ Order status updates (pending → confirmed → preparing → ready → delivered)
- ✅ View analytics and order history

### Platform Features

- ✅ Role-based access control (CUSTOMER/OWNER)
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication with refresh
- ✅ Password reset via email
- ✅ CORS middleware for cross-origin requests
- ✅ Comprehensive error handling
- ✅ Database connection pooling
- ✅ Automatic API documentation (Swagger/OpenAPI)

## 🏗️ Technology Stack

### Backend

- **Framework:** FastAPI 0.104.1 (async Python web framework)
- **Database:** PostgreSQL 14+ with SQLAlchemy ORM
- **Authentication:** JWT (python-jose), Passlib+bcrypt for password hashing
- **Validation:** Pydantic v2 with Python 3.10
- **Server:** Uvicorn ASGI server

### Frontend

- **Framework:** React 18+ with TypeScript
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **Forms:** React Hook Form with Zod validation
- **UI Components:** React Toastify for notifications
- **Routing:** React Router v6

### DevOps

- **Containerization:** Docker & Docker Compose
- **Cloud:** Azure (App Service, PostgreSQL, Static Web Apps)
- **CI/CD:** GitHub Actions
- **Testing:** Pytest + httpx
- **Package Manager:** pip, npm

## 📁 Project Structure

```
module-6/
├── backend/                        # FastAPI backend
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   ├── routes/           # Route handlers
│   │   │   │   ├── auth.py       # Authentication endpoints
│   │   │   │   ├── restaurants.py # Restaurant CRUD
│   │   │   │   ├── menus.py      # Menu management
│   │   │   │   ├── carts.py      # Shopping cart
│   │   │   │   ├── orders.py     # Order management
│   │   │   │   └── users.py      # User profile
│   │   │   └── dependencies.py    # Dependency injection
│   │   ├── core/                  # Core utilities
│   │   │   ├── config.py          # Settings & environment
│   │   │   ├── security.py        # JWT & password hashing
│   │   │   └── exceptions.py      # Custom exceptions
│   │   ├── crud/                  # Database CRUD operations
│   │   ├── models/                # SQLAlchemy ORM models (10 tables)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # Business logic layer
│   │   ├── db/                    # Database configuration
│   │   └── main.py                # FastAPI app entry point
│   ├── tests/                      # Pytest test suite
│   │   ├── conftest.py            # Test fixtures
│   │   ├── test_auth.py           # Auth endpoint tests
│   │   ├── test_restaurants.py   # Restaurant endpoint tests
│   │   └── test_orders.py         # Order endpoint tests
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment template
│   ├── Dockerfile                  # Container image
│   └── run.py                      # Application startup
├── frontend/                       # React frontend (Vite + Redux Toolkit)
│   ├── src/
│   │   ├── pages/                 # Home, Login, Register pages
│   │   ├── store/                 # Redux store and slices
│   │   └── utils/                 # API client configuration
│   └── Dockerfile                 # Frontend container image
├── .github/workflows/
│   └── ci-cd.yml                  # GitHub Actions pipeline
├── docker-compose.yml              # Multi-service orchestration
├── SRS.md                          # Requirements specification
├── DATABASE_DESIGN.md              # Schema & ER diagrams
├── ARCHITECTURE.md                 # System design
├── API_SPEC.md                     # Endpoint documentation
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- OR: Python 3.10+, PostgreSQL 14+, Node.js 18+

## 🐳 Running with Docker

### Clone the Repository

```bash
git clone https://git-training.nagarro.com/nagarro_fresher_training/general-account/rida-khan-3221674.git

cd rida-khan-3221674/module_6
```

### Configure Environment Variables

```bash
cp backend/.env.example backend/.env
```

Update the `.env` file with your PostgreSQL database credentials, JWT secret, and other required environment variables.

### Build and Start Containers

```bash
docker compose up --build
```

### Stop Containers

```bash
docker compose down
```

### Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
# Create PostgreSQL database and update DATABASE_URL in .env

# Create .env
cp .env.example .env
# Edit with your settings

# Run database migrations
alembic upgrade head

# Start server
python run.py

# Server runs on http://localhost:8000
```

#### Frontend Setup

```bash
cd ../frontend

npm install
npm run dev

# Frontend runs on http://localhost:3000
```

## 📚 API Documentation

The API documentation is available online:

- **Swagger UI:** https://justeat-backend-rida.azurewebsites.net/docs
- **ReDoc:** https://justeat-backend-rida.azurewebsites.net/redoc
- **OpenAPI JSON:** https://justeat-backend-rida.azurewebsites.net/openapi.json


### Key Endpoints

#### Authentication (`/api/auth/`)

- `POST /register` - Create new account
- `POST /login` - Get JWT tokens
- `POST /refresh` - Refresh access token
- `POST /password-reset-request` - Request password reset
- `POST /password-reset-complete` - Complete password reset
- `GET /me` - Get current user profile

#### Restaurants (`/api/restaurants/`)

- `POST /` - Create restaurant (owner-only)
- `GET /{id}` - Get restaurant details
- `GET /search/city/{city}` - Search by location
- `GET /search/cuisine/{cuisine}` - Search by cuisine
- `GET /my/restaurants` - View my restaurants (owner-only)
- `PUT /{id}` - Update restaurant (owner-only)

#### Menu Items (`/api/menus/`)

- `POST /` - Create menu item (owner-only)
- `GET /{id}` - Get item details
- `GET /restaurant/{id}` - View restaurant menu
- `GET /restaurant/{id}/cuisine/{cuisine}` - Search menu by cuisine
- `PUT /{id}` - Update item (owner-only)
- `PATCH /{id}/mark-special` - Mark as today's special (owner-only)
- `PATCH /{id}/mark-deal` - Mark as deal of day (owner-only)
- `DELETE /{id}` - Make unavailable (owner-only)

#### Shopping Cart (`/api/cart/`)

- `GET /` - View cart
- `POST /items` - Add item to cart (customer-only)
- `PUT /items/{menu_id}` - Update quantity
- `DELETE /items/{menu_id}` - Remove item
- `DELETE /` - Clear cart
- `POST /checkout` - Create order from cart

#### Orders (`/api/orders/`)

- `GET /` - View customer orders (customer-only)
- `GET /{id}` - Get order details
- `PUT /{id}/status` - Update status (owner-only)
- `GET /restaurant/{id}` - View restaurant orders (owner-only)
- `POST /{id}/cancel` - Cancel order (customer-only)
- `GET /status/pending` - View pending orders

### Authentication Header

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

## 🧪 Testing

Run the test suite:

```bash
# All tests
pytest

# Specific test file
pytest tests/test_auth.py -v

# With coverage
pytest --cov=app tests/

# Watch mode
pytest-watch
```

Test files:

- `tests/conftest.py` - Pytest fixtures and test database setup
- `tests/test_auth.py` - Authentication endpoint tests
- `tests/test_restaurants.py` - Restaurant & menu endpoint tests
- `tests/test_orders.py` - Order & cart endpoint tests

## 🗄️ Database Schema

10 core tables with proper normalization:

1. **users** - Customers and restaurant owners
2. **restaurants** - Restaurant profiles with owner reference
3. **menu_items** - Food items for each restaurant
4. **orders** - Customer orders with status tracking
5. **order_items** - Line items in orders (stores historical price)
6. **carts** - Customer shopping carts (one per customer)
7. **cart_items** - Items in cart before checkout
8. **customer_preferences** - Dietary restrictions & favorite cuisines
9. **favorite_restaurants** - Many-to-many customer favorites
10. **password_reset_tokens** - Secure password reset flow

All tables include:

- Primary keys with auto-increment IDs
- Foreign keys with CASCADE delete
- UNIQUE constraints (email, cart_id, etc.)
- CHECK constraints (valid statuses, positive quantities)
- Indexes on frequently searched fields
- created_at/updated_at timestamps

See [DATABASE_DESIGN.md](DATABASE_DESIGN.md) for complete ER diagrams.

## 🔐 Security Features

- ✅ **Password Hashing:** bcrypt with 12 rounds ($2b$12$...)
- ✅ **JWT Tokens:** HS256 signed, short-lived access (15 min) & long-lived refresh (7 days)
- ✅ **Role-Based Access:** CUSTOMER and OWNER roles with dependency injection
- ✅ **CORS:** Whitelisted origins only
- ✅ **Input Validation:** Pydantic schemas for all endpoints
- ✅ **Email Validation:** Valid email checks before database operations
- ✅ **Password Reset:** One-time tokens with 1-hour expiration

## 📊 Code Quality

- ✅ **Type Hints:** Full type annotations throughout codebase
- ✅ **Documentation:** Docstrings for every function explaining WHY
- ✅ **Comments:** Inline comments for non-obvious logic
- ✅ **Package Structure:** Organized by concern (models, crud, services, routes)
- ✅ **DRY Principle:** Shared schemas, utilities, dependencies
- ✅ **Error Handling:** Custom exceptions with meaningful messages
- ✅ **Logging:** Structured logging for debugging
- ✅ **Testing:** Unit tests with pytest fixtures

## 🚢 Deployment

### Azure Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed Azure setup:

- App Service for backend
- PostgreSQL managed database
- Static Web Apps for frontend
- GitHub Actions CI/CD

### Docker Image

```bash
# Build image
docker build -f backend/Dockerfile -t justeat:latest backend/

# Run container
docker run -p 8000:8000 -e DATABASE_URL="..." justeat:latest

# Push to registry
docker tag justeat:latest myregistry.azurecr.io/justeat:latest
docker push myregistry.azurecr.io/justeat:latest
```

## 📈 Performance Optimizations

- Database connection pooling (pool_size=10, max_overflow=20)
- Denormalized cart totals for quick display
- Indexes on foreign keys and frequently searched fields
- Async/await throughout for concurrent request handling
- Pagination on list endpoints
- JWT caching with browser localStorage

## 🔄 Workflow Example

### Customer Journey

1. Register → Get account
2. Browse restaurants by city/cuisine
3. View restaurant menu
4. Add items to cart
5. Checkout → Create order (status: PENDING)
6. Track order status
7. Rate restaurant (future)
8. Reorder from history (future)

### Owner Journey

1. Register as OWNER
2. Create restaurant
3. Add menu items (with descriptions, prices)
4. Mark specials/deals
5. Dashboard shows incoming orders
6. Update order status as customers wait
7. View order history and analytics

## 📌 Project Status

**Status:** ✅ Completed

The project has been successfully designed, developed, tested, containerized, and deployed to Microsoft Azure. All planned features and milestones have been completed, including authentication, restaurant & menu management, cart, order processing, customer preferences, Docker support, CI/CD pipeline, and cloud deployment.


## 🐛 Troubleshooting

### Database Connection Error

```
SQLALCHEMY_DATABASE_URL must be set in .env
Example: postgresql://justeat:justeat123@localhost/justeat
```

### JWT Token Expired

```
Response: {"detail": "Token has expired"}
Solution: POST /api/auth/refresh with refresh_token
```

### Permission Denied Error

```
Ensure user role matches endpoint requirements:
- Customers only: /api/cart/*, /api/orders/* (own orders)
- Owners only: /api/restaurants/*, /api/menus/*
```

### CORS Issues

```
Add frontend URL to ALLOWED_ORIGINS in .env
Example: http://localhost:3000,https://app.example.com
```

## 📞 Support

For issues and questions:

1. Check [API_SPEC.md](API_SPEC.md) for endpoint details
2. Review [DATABASE_DESIGN.md](DATABASE_DESIGN.md) for schema
3. See [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
4. Check test files in `tests/` for usage examples

## 📝 License

This is a capstone project for educational purposes.

---

**Happy ordering! 🍕🍔🌮**
