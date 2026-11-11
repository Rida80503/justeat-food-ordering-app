# Project Architecture & Folder Structure

## JustEat Food Ordering Application

---

## 1. COMPLETE FOLDER STRUCTURE

```
justeat-app/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   │
│   │   ├── api/                     # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── users.py         # User profile endpoints
│   │   │   │   ├── restaurants.py   # Restaurant endpoints (customer)
│   │   │   │   ├── owner.py         # Owner-specific endpoints
│   │   │   │   ├── menus.py         # Menu endpoints (customer)
│   │   │   │   ├── cart.py          # Cart endpoints
│   │   │   │   ├── orders.py        # Order endpoints (customer)
│   │   │   │   ├── recommendations.py # Recommendations endpoints
│   │   │   │   ├── preferences.py   # Preferences endpoints
│   │   │   │   └── favorites.py     # Favorites endpoints
│   │   │   │
│   │   │   └── dependencies.py      # Shared dependencies (auth, db)
│   │   │
│   │   ├── core/                    # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Environment variables
│   │   │   ├── constants.py         # App constants
│   │   │   └── security.py          # JWT, password hashing logic
│   │   │
│   │   ├── db/                      # Database
│   │   │   ├── __init__.py
│   │   │   ├── database.py          # Database connection
│   │   │   ├── session.py           # Session management
│   │   │   └── base.py              # Base model for SQLAlchemy
│   │   │
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── restaurant.py        # Restaurant model
│   │   │   ├── menu.py              # Menu model
│   │   │   ├── order.py             # Order model
│   │   │   ├── order_item.py        # OrderItem model
│   │   │   ├── cart.py              # Cart model
│   │   │   ├── cart_item.py         # CartItem model
│   │   │   ├── preference.py        # Preference model
│   │   │   ├── favorite_restaurant.py # Favorite model
│   │   │   └── password_reset_token.py # Reset token model
│   │   │
│   │   ├── schemas/                 # Pydantic schemas (validation)
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User schemas
│   │   │   ├── restaurant.py        # Restaurant schemas
│   │   │   ├── menu.py              # Menu schemas
│   │   │   ├── order.py             # Order schemas
│   │   │   ├── cart.py              # Cart schemas
│   │   │   ├── preference.py        # Preference schemas
│   │   │   └── common.py            # Common/reusable schemas
│   │   │
│   │   ├── crud/                    # Create, Read, Update, Delete logic
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User CRUD
│   │   │   ├── restaurant.py        # Restaurant CRUD
│   │   │   ├── menu.py              # Menu CRUD
│   │   │   ├── order.py             # Order CRUD
│   │   │   ├── cart.py              # Cart CRUD
│   │   │   ├── preference.py        # Preference CRUD
│   │   │   └── favorite_restaurant.py # Favorite CRUD
│   │   │
│   │   ├── services/                # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # Auth logic (login, register)
│   │   │   ├── restaurant_service.py # Restaurant business logic
│   │   │   ├── menu_service.py      # Menu business logic
│   │   │   ├── order_service.py     # Order business logic
│   │   │   ├── cart_service.py      # Cart business logic
│   │   │   ├── recommendation_service.py # Recommendation logic
│   │   │   ├── preference_service.py # Preference logic
│   │   │   ├── password_reset_service.py # Password reset logic
│   │   │   └── email_service.py     # Mock email service
│   │   │
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── __init__.py
│   │   │   ├── error_handler.py     # Global exception handler
│   │   │   └── logging_middleware.py # Logging middleware
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── logger.py            # Logging setup
│   │   │   ├── exceptions.py        # Custom exceptions
│   │   │   └── helpers.py           # Helper functions
│   │   │
│   │   └── background_tasks/        # Background jobs
│   │       ├── __init__.py
│   │       ├── tasks.py             # Background task definitions
│   │       └── cache.py             # Cache generation tasks
│   │
│   ├── migrations/                  # Alembic database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   │
│   ├── tests/                       # Unit and integration tests
│   │   ├── __init__.py
│   │   ├── conftest.py              # Pytest fixtures
│   │   ├── test_auth.py             # Auth tests
│   │   ├── test_users.py            # User tests
│   │   ├── test_restaurants.py      # Restaurant tests
│   │   ├── test_menus.py            # Menu tests
│   │   ├── test_orders.py           # Order tests
│   │   ├── test_cart.py             # Cart tests
│   │   ├── test_recommendations.py  # Recommendation tests
│   │   └── test_preferences.py      # Preference tests
│   │
│   ├── seed/                        # Seed data
│   │   ├── __init__.py
│   │   ├── seed_data.py             # Seed execution script
│   │   └── data.py                  # Seed data definitions
│   │
│   ├── logs/                        # Log files
│   │   └── app.log                  # Rotating log file
│   │
│   ├── .env.example                 # Example environment variables
│   ├── .env                         # Local environment variables (not in git)
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Docker container definition
│   ├── docker-compose.yml           # Docker services orchestration
│   ├── alembic.ini                  # Alembic configuration
│   ├── pytest.ini                   # Pytest configuration
│   ├── README.md                    # Backend README
│   └── setup.py                     # Package setup (optional)
│
├── frontend/                        # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── index.js                 # React app entry
│   │   ├── App.jsx                  # Root component
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Toast.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── restaurant/
│   │   │   │   ├── RestaurantCard.jsx
│   │   │   │   ├── RestaurantList.jsx
│   │   │   │   └── RestaurantFilter.jsx
│   │   │   │
│   │   │   ├── menu/
│   │   │   │   ├── MenuCard.jsx
│   │   │   │   └── MenuList.jsx
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CartSummary.jsx
│   │   │   │
│   │   │   └── order/
│   │   │       ├── OrderCard.jsx
│   │   │       └── OrderStatus.jsx
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── PasswordResetPage.jsx
│   │   │   │   └── PasswordResetRequestPage.jsx
│   │   │   │
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.jsx
│   │   │   │   ├── RestaurantDetailPage.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   ├── OrderConfirmationPage.jsx
│   │   │   │   ├── OrderHistoryPage.jsx
│   │   │   │   ├── RecommendationsPage.jsx
│   │   │   │   ├── FavoritesPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   │
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── MenuManagementPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── AnalyticsPage.jsx
│   │   │   │   └── RestaurantSettingsPage.jsx
│   │   │   │
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── layouts/                 # Layout wrappers
│   │   │   ├── MainLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── OwnerLayout.jsx
│   │   │
│   │   ├── redux/                   # Redux state management
│   │   │   ├── store.js             # Redux store configuration
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js     # Auth state
│   │   │   │   ├── userSlice.js     # User state
│   │   │   │   ├── restaurantSlice.js # Restaurant state
│   │   │   │   ├── menuSlice.js     # Menu state
│   │   │   │   ├── cartSlice.js     # Cart state
│   │   │   │   ├── orderSlice.js    # Order state
│   │   │   │   └── uiSlice.js       # UI state (loaders, errors)
│   │   │   │
│   │   │   └── selectors/
│   │   │       ├── authSelectors.js
│   │   │       ├── restaurantSelectors.js
│   │   │       ├── cartSelectors.js
│   │   │       └── orderSelectors.js
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── userService.js       # User API calls
│   │   │   ├── restaurantService.js # Restaurant API calls
│   │   │   ├── menuService.js       # Menu API calls
│   │   │   ├── cartService.js       # Cart API calls
│   │   │   ├── orderService.js      # Order API calls
│   │   │   ├── recommendationService.js # Recommendation API calls
│   │   │   ├── preferenceService.js # Preference API calls
│   │   │   └── favoriteService.js   # Favorite API calls
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Auth hook
│   │   │   ├── usePagination.js     # Pagination hook
│   │   │   ├── useFilter.js         # Filter hook
│   │   │   └── useLocalStorage.js   # LocalStorage hook
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js         # App constants
│   │   │   ├── formatters.js        # Date/currency formatters
│   │   │   ├── validators.js        # Form validators
│   │   │   └── helpers.js           # Helper functions
│   │   │
│   │   ├── styles/                  # Global styles
│   │   │   ├── index.css            # Global CSS
│   │   │   ├── variables.css        # CSS variables
│   │   │   └── reset.css            # CSS reset
│   │   │
│   │   ├── assets/                  # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   └── config/                  # Frontend config
│   │       └── apiConfig.js         # API endpoint configuration
│   │
│   ├── .env.example                 # Example environment variables
│   ├── .env                         # Local environment variables (not in git)
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── public/index.html
│   ├── Dockerfile                   # Docker container for frontend
│   ├── nginx.conf                   # Nginx configuration for static hosting
│   ├── README.md                    # Frontend README
│   └── .env.production              # Production environment variables
│
├── docker/                          # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .github/                         # GitHub Actions CI/CD
│   └── workflows/
│       ├── backend-test.yml         # Test backend on push
│       ├── build-deploy.yml         # Build and deploy to Azure
│       └── frontend-build.yml       # Build frontend
│
├── scripts/                         # Utility scripts
│   ├── setup.sh                     # Initial setup script
│   ├── run-backend.sh               # Run backend locally
│   ├── run-frontend.sh              # Run frontend locally
│   └── deploy.sh                    # Deployment script
│
├── docs/                            # Documentation
│   ├── SRS.md                       # Software Requirements
│   ├── DATABASE_DESIGN.md           # Database schema
│   ├── API_SPEC.md                  # API specifications
│   ├── ARCHITECTURE.md              # Architecture documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── AI_USAGE.md                  # AI usage documentation
│   ├── ASSUMPTIONS.md               # Project assumptions
│   ├── SETUP.md                     # Setup instructions
│   └── POSTMAN_COLLECTION.json      # Postman API collection
│
├── deployment/                      # Deployment configurations
│   ├── azure-deploy.yml             # Azure DevOps pipeline
│   ├── kubernetes/                  # K8s configs (optional)
│   └── terraform/                   # Infrastructure as Code (optional)
│
├── .gitignore
├── .env.example
├── README.md                        # Main project README
├── CONTRIBUTING.md                  # Contribution guidelines
└── LICENSE                          # Project license


Total Files: ~80+
Total Directories: ~40+
```

---

## 2. SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          JUSTEAT ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Frontend)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  React Application                                            │     │
│   ├────────────────────────┬───────────────────────────────────┤     │
│   │ Components             │ Redux State Management             │     │
│   │ ├─ Auth Pages          │ ├─ auth slice                     │     │
│   │ ├─ Restaurant Pages    │ ├─ user slice                     │     │
│   │ ├─ Menu Pages          │ ├─ restaurant slice               │     │
│   │ ├─ Cart Pages          │ ├─ menu slice                     │     │
│   │ ├─ Order Pages         │ ├─ cart slice                     │     │
│   │ └─ Profile Pages       │ ├─ order slice                    │     │
│   │                        │ └─ ui slice                       │     │
│   └────────────────────────┴───────────────────────────────────┘     │
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Services (API Layer)                                          │     │
│   │ ├─ authService.js      ├─ cartService.js                     │     │
│   │ ├─ userService.js      ├─ orderService.js                    │     │
│   │ ├─ restaurantService.js├─ recommendationService.js           │     │
│   │ ├─ menuService.js      └─ preferenceService.js               │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                   │                                     │
│                          Axios HTTP Client                              │
│                                   │                                     │
└─────────────────────────────────────┬─────────────────────────────────┘
                                      │
                         ┌────────────┘
                         │
                         ▼ REST API Calls (JSON)

┌─────────────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER (Backend)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FastAPI Application (Port 8000)                                         │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ API Routes (/api/)                                               │   │
│  │ ├─ /auth          (Login, Logout, Password Reset)               │   │
│  │ ├─ /users         (Profile Management)                          │   │
│  │ ├─ /restaurants   (Browse, Search, Filter)                      │   │
│  │ ├─ /menus         (View Menu Items)                             │   │
│  │ ├─ /cart          (Add, Remove, Update Items)                   │   │
│  │ ├─ /orders        (Create, View, Track Orders)                  │   │
│  │ ├─ /owner         (Owner-specific Operations)                   │   │
│  │ ├─ /recommendations (Get Recommendations)                       │   │
│  │ ├─ /preferences   (Manage Preferences)                          │   │
│  │ └─ /favorites     (Manage Favorites)                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ Middleware Layer                                                 │   │
│  │ ├─ JWT Authentication Middleware                                │   │
│  │ ├─ Role Authorization Middleware                                │   │
│  │ ├─ Request Validation Middleware                                │   │
│  │ ├─ Error Handling Middleware                                    │   │
│  │ └─ Logging Middleware                                           │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ Service Layer (Business Logic)                                   │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ ├─ auth_service.py         ├─ recommendation_service.py        │   │
│  │ ├─ user_service.py         ├─ preference_service.py            │   │
│  │ ├─ restaurant_service.py   ├─ password_reset_service.py        │   │
│  │ ├─ menu_service.py         └─ email_service.py                │   │
│  │ ├─ cart_service.py                                             │   │
│  │ └─ order_service.py                                            │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ CRUD Layer (Data Operations)                                     │   │
│  │ ├─ user.py (CRUD)     ├─ order.py (CRUD)                       │   │
│  │ ├─ restaurant.py (CRUD) ├─ cart.py (CRUD)                      │   │
│  │ ├─ menu.py (CRUD)     ├─ preference.py (CRUD)                  │   │
│  │ └─ order_item.py (CRUD)─ favorite_restaurant.py (CRUD)        │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ Schema Validation Layer (Pydantic)                               │   │
│  │ ├─ User Schemas       ├─ Order Schemas                          │   │
│  │ ├─ Restaurant Schemas ├─ Cart Schemas                           │   │
│  │ ├─ Menu Schemas       └─ Common Schemas                         │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ ORM Layer (SQLAlchemy)                                           │   │
│  │ ├─ User Model        ├─ Order Model                             │   │
│  │ ├─ Restaurant Model  ├─ Cart Model                             │   │
│  │ ├─ Menu Model        ├─ Preference Model                        │   │
│  │ └─ OrderItem Model   └─ FavoriteRestaurant Model               │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │ Background Tasks                                                │   │
│  │ ├─ Order Logging Task                                           │   │
│  │ ├─ Recommendation Cache Task                                    │   │
│  │ ├─ Mock Email Task                                              │   │
│  │ └─ Notification Task                                            │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────┬─────────────────────────────────┘
                                      │
                        ┌─────────────┘
                        │ SQLAlchemy ORM
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER (Database)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PostgreSQL Database                                                     │
│  ├─ users table               ├─ favorite_restaurants table             │
│  ├─ restaurants table         ├─ password_reset_tokens table            │
│  ├─ menus table               ├─ Indexes for performance                │
│  ├─ orders table              ├─ Foreign Key Constraints                │
│  ├─ order_items table         ├─ Check Constraints                      │
│  ├─ cart table                └─ Unique Constraints                     │
│  ├─ cart_items table                                                    │
│  └─ customer_preferences table                                          │
│                                                                           │
│  Database Features:                                                      │
│  ├─ Transactions for data consistency                                    │
│  ├─ Indexes for query performance                                       │
│  ├─ Foreign Keys for referential integrity                              │
│  ├─ Rotating log files for audit trail                                  │
│  └─ Alembic for version control & migrations                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DATA FLOW DIAGRAM

### 3.1 Customer Placing Order Flow

```
Customer                  Frontend           Backend           Database
   │                         │                  │                 │
   │─── Click Browse ────────►│                  │                 │
   │                         │                  │                 │
   │                         │─ GET /restaurants──►│                 │
   │                         │                  │                 │
   │                         │                  │─ Query DB ─────►│
   │                         │                  │◄─ Return data ──│
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │                         │                  │                 │
   │◄─ Display Restaurants ──│                  │                 │
   │                         │                  │                 │
   │─── Select Restaurant ─ ►│                  │                 │
   │                         │                  │                 │
   │                         │ GET /menu/{id} ──►│                 │
   │                         │                  │                 │
   │                         │                  │─ Query DB ─────►│
   │                         │                  │◄─ Return data ──│
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │◄─ Display Menu ────────│                  │                 │
   │                         │                  │                 │
   │─── Add to Cart ────────►│                  │                 │
   │                         │                  │                 │
   │                         │ POST /cart/items──►│                 │
   │                         │ {menu_id, qty}  │                 │
   │                         │                  │                 │
   │                         │                  │─ Update DB ────►│
   │                         │                  │◄─ Success ──────│
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │◄─ Confirm Add ────────│                  │                 │
   │                         │                  │                 │
   │─── View Cart ─────────►│                  │                 │
   │                         │                  │                 │
   │                         │─ GET /cart ─────►│                 │
   │                         │                  │                 │
   │                         │                  │─ Query DB ─────►│
   │                         │                  │◄─ Return items  │
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │◄─ Display Cart ───────│                  │                 │
   │                         │                  │                 │
   │─── Place Order ───────►│                  │                 │
   │                         │                  │                 │
   │                         │ POST /orders ────►│                 │
   │                         │ {items, total}  │                 │
   │                         │                  │                 │
   │                         │                  │─ Validate ─────►│
   │                         │                  │◄─ Cart exists ──│
   │                         │                  │                 │
   │                         │                  │─ Create Order ─►│
   │                         │                  │─ Create Items ──►
   │                         │                  │─ Clear Cart ───►
   │                         │                  │◄─ Success ──────│
   │                         │                  │                 │
   │                         │◄─ JSON (order_id)│                 │
   │                         │                  │                 │
   │◄─ Order Confirmed ────│                  │                 │
   │                         │                  │                 │
```

### 3.2 Owner Managing Orders Flow

```
Owner                     Frontend           Backend           Database
   │                         │                  │                 │
   │─── Click Dashboard ───►│                  │                 │
   │                         │                  │                 │
   │                         │ GET /owner/orders─►│                 │
   │                         │ (JWT token)    │                 │
   │                         │                  │                 │
   │                         │                  │─ Validate JWT ─►│
   │                         │                  │◄─ Valid ────────│
   │                         │                  │                 │
   │                         │                  │─ Query Orders ─►│
   │                         │                  │◄─ Return list ──│
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │◄─ Display Orders ─────│                  │                 │
   │                         │                  │                 │
   │─── Update Order ────────►│                  │                 │
   │    Status to READY    │                  │                 │
   │                         │                  │                 │
   │                         │ PUT /owner/orders/1
   │                         │     /status    │                 │
   │                         │ {status:"READY"} │                 │
   │                         │                  │                 │
   │                         │                  │─ Validate JWT ─►│
   │                         │                  │◄─ Valid ────────│
   │                         │                  │                 │
   │                         │                  │─ Update DB ────►│
   │                         │                  │◄─ Success ──────│
   │                         │                  │                 │
   │                         │◄─ JSON response──│                 │
   │                         │                  │                 │
   │◄─ Status Updated ──────│                  │                 │
   │                         │                  │                 │
```

---

## 4. AUTHENTICATION FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│                      JWT AUTHENTICATION FLOW                          │
└──────────────────────────────────────────────────────────────────────┘

User                    Frontend          Backend            Database
│                          │                 │                  │
│─── Email/Password ──────►│                 │                  │
│                          │                 │                  │
│                          │ POST /auth/login│                  │
│                          │ {email, pass}  │                  │
│                          │────────────────►│                  │
│                          │                 │                  │
│                          │                 │─ Query User ────►│
│                          │                 │◄─ Return user ──│
│                          │                 │                  │
│                          │                 │ Verify password  │
│                          │                 │ (bcrypt.compare) │
│                          │                 │                  │
│                          │                 ├─ Generate JWT ──┐│
│                          │                 │ {  sub: id,    ││
│                          │                 │    email,      ││
│                          │                 │    role,       ││
│                          │                 │    exp: time   ││
│                          │                 │ }              ││
│                          │                 └─────────────────┘│
│                          │◄─ Tokens (access/refresh)         │
│                          │                 │                  │
│◄─ Login Success ────────│                 │                  │
│ {token, user_data}      │                 │                  │
│                          │                 │                  │
│ Store in localStorage   │                 │                  │
│ token = "JWT_TOKEN"     │                 │                  │
│                          │                 │                  │
│─── Browse Restaurants ──►│                 │                  │
│                          │                 │                  │
│                          │ GET /restaurants
│                          │ Header: Auth: Bearer JWT_TOKEN
│                          │────────────────►│                  │
│                          │                 │                  │
│                          │                 │ Verify JWT ─┐   │
│                          │                 │ - Check sig │   │
│                          │                 │ - Check exp │   │
│                          │                 │ - Extract payload
│                          │                 └─────────────┘   │
│                          │                 │                  │
│                          │                 ├─ Check Role ────┐
│                          │                 │ (CUSTOMER OK)   │
│                          │                 └─────────────────┘
│                          │                 │                  │
│                          │                 │─ Query DB ──────►│
│                          │                 │◄─ Restaurants ──│
│                          │                 │                  │
│                          │◄─ JSON Data ───│                  │
│                          │                 │                  │
│◄─ Display Results ─────│                  │                  │
│                          │                 │                  │
│                          │                 │                  │
│─── Logout ──────────────►│                 │                  │
│                          │                 │                  │
│                          │ Remove token from localStorage   │
│                          │ Clear auth state in Redux       │
│                          │                 │                  │
│◄─ Logged Out ──────────│                  │                  │
│                          │                 │                  │
```

---

## 5. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AZURE DEPLOYMENT ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────┘

GitHub Repository
│
├─ Push to main/develop
│
└─► GitHub Actions (CI/CD Pipeline)
    │
    ├─► Run Tests (pytest)
    │
    ├─► Build Docker Image (Backend)
    │   └─► Push to Azure Container Registry
    │
    ├─► Build React App (Frontend)
    │   └─► Push to Azure Static Web Apps
    │
    └─► Deploy to Azure
        │
        ├─► Azure App Service / Container Apps
        │   └─ Runs FastAPI Backend
        │       └─ Docker Container
        │           └─ Python 3.10+
        │           └─ All dependencies
        │
        ├─► Azure Database for PostgreSQL
        │   └─ Database Server
        │       └─ schemas, tables, indexes
        │
        └─► Azure Static Web Apps
            └─ CDN for React App
                └─ Frontend Assets (HTML, JS, CSS)


Architecture Benefits:
- Containerized backend (Docker)
- Managed PostgreSQL database
- Auto-scaling capabilities
- CI/CD automated deployments
- Environment variables via Azure Key Vault
- Logging via Azure Monitor
- Backup & disaster recovery
- Global CDN for frontend
- SSL/TLS certificates managed by Azure
```

---

## 6. SECURITY ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                                   │
└──────────────────────────────────────────────────────────────────────┘

Client Side (Frontend):
├─ HTTPS only (SSL/TLS)
├─ Token stored in localStorage
├─ Protected Routes (check token before rendering)
├─ CORS configuration
└─ XSS Protection (React escapes by default)

Network Level:
├─ CORS headers
├─ HTTPS enforced
├─ API Gateway with rate limiting
└─ DDoS protection

Backend API:
├─ JWT Token Validation
├─ Role-Based Authorization Middleware
├─ Input Validation (Pydantic schemas)
├─ SQL Injection Prevention (SQLAlchemy ORM)
├─ CORS middleware
├─ Request/Response logging
└─ Error handling (no sensitive info leaked)

Database Level:
├─ Password hashing (bcrypt)
├─ Connection pooling
├─ Prepared statements (via ORM)
├─ Encryption at rest (optional)
├─ Regular backups
├─ Row-level security (via roles)
└─ Audit logging

Environment Variables:
├─ .env files (not in git)
├─ Azure Key Vault for production
├─ Different secrets for dev/prod
├─ Rotation policies
└─ Access logs
```

---

## 7. KEY DESIGN PATTERNS

### 7.1 Design Patterns Used

| Pattern                       | Used In              | Purpose                                        |
| ----------------------------- | -------------------- | ---------------------------------------------- |
| **MVC (Modified)**            | Backend              | Controllers (routes), Models, Services         |
| **Repository**                | CRUD layer           | Abstract data access                           |
| **Service Layer**             | Services folder      | Encapsulate business logic                     |
| **Dependency Injection**      | FastAPI dependencies | Decouple DB, auth, services                    |
| **Middleware**                | FastAPI middleware   | Cross-cutting concerns (auth, logging, errors) |
| **Redux**                     | Frontend             | State management & predictable state           |
| **Container Components**      | React                | Smart components that handle logic             |
| **Presentational Components** | React                | Dumb components that just render               |
| **Custom Hooks**              | React                | Reusable React logic                           |
| **Factory**                   | Pydantic schemas     | Schema creation                                |
| **Singleton**                 | Database session     | Single database connection pool                |
| **Strategy**                  | Recommendation logic | Different recommendation algorithms            |

---

## 8. CODE ORGANIZATION PRINCIPLES

### 8.1 Separation of Concerns

```
API Routes
    ↓ (Calls)
Services (Business Logic)
    ↓ (Calls)
CRUD Operations (Data Access)
    ↓ (Uses)
Models (ORM)
    ↓ (Interacts)
Database
```

### 8.2 Dependency Direction

```
Routes → Services → CRUD → Models → Database
  ↑        ↑         ↑       ↑        ↑
  └────────┴─────────┴───────┴────────┘
       Dependencies injected downward
```

### 8.3 Modularity

- Each entity (user, restaurant, menu, order) has its own:
  - Model (ORM definition)
  - Schema (validation)
  - CRUD operations
  - Service (business logic)
  - API route

- Easy to extend and maintain
- Easy to test in isolation

---

## 9. API VERSIONING STRATEGY

Current: `/api/` (v1 implicit)

Future: `/api/v2/` for breaking changes

**Benefits:**

- Backward compatibility
- Gradual migration
- Multiple versions supported

---

## 10. CACHING STRATEGY

```
Level 1: Frontend Redux Store
Level 2: Browser LocalStorage (tokens, preferences)
Level 3: Backend In-Memory Cache (optional)
Level 4: Database Query Results

Invalidation:
- Cart: Invalidate when items added/removed
- Restaurants: Cache for 5 minutes
- Menu: Cache for 10 minutes
- Recommendations: Cache for 1 hour
```

---

## 11. ERROR HANDLING STRATEGY

```
Client Error (4xx)
├─ 400: Bad Request (validation error)
├─ 401: Unauthorized (invalid token)
├─ 403: Forbidden (insufficient permissions)
├─ 404: Not Found (resource doesn't exist)
└─ 409: Conflict (duplicate email, etc)

Server Error (5xx)
├─ 500: Internal Server Error (unexpected error)
└─ 503: Service Unavailable (database down)

All errors return:
{
    "success": false,
    "message": "User-friendly message",
    "error_code": "ERROR_CODE",
    "status_code": 400
}
```

---

## 12. FOLDER STRUCTURE RATIONALE

**Why separate into modular folders?**

1. **Scalability** - Easy to add new features
2. **Maintainability** - Find related code quickly
3. **Testability** - Test each module independently
4. **Reusability** - Share components/hooks/services
5. **Readability** - Clear organization
6. **Performance** - Code splitting possible
7. **Collaboration** - Multiple developers can work in parallel
