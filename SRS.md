# Software Requirement Specification (SRS)

## JustEat Food Ordering Application

**Project Name:** JustEat Food Ordering Application  
**Version:** 1.0.0  
**Date:** July 2026  
**Status:** In Progress

---

## 1. EXECUTIVE SUMMARY

JustEat is a full-stack web application that enables customers to browse restaurants, order food, and track their orders while allowing restaurant owners to manage menus and orders. The system uses Role-Based Access Control (RBAC) with JWT authentication to ensure secure and isolated user experiences.

---

## 2. PROJECT SCOPE

### 2.1 Functional Requirements

#### 2.1.1 COMMON FEATURES (Both Customers & Owners)

- **Role-Based Login:** Login with role (customer/owner)
- **JWT Authentication:** Secure token-based authentication
- **Authorization:** Role-based access control
- **Password Hashing:** Using bcrypt via Passlib
- **Password Reset:** Email-based password reset functionality
- **Logout:** Clear session and invalidate tokens
- **Protected Routes:** Frontend and backend route protection
- **Exception Handling:** Global error handling with consistent responses
- **Logging:** All operations logged with rotating files
- **Toast Notifications:** User feedback via React Toastify
- **Swagger Documentation:** Auto-generated API documentation

#### 2.1.2 CUSTOMER FEATURES

- **Authentication**
  - Login with email/password
  - Logout
  - Reset password
- **Profile Management**
  - View profile
  - Update profile (name, email, phone)
- **Restaurant Discovery**
  - Browse all restaurants
  - Search restaurants by name
  - Filter by cuisine, price range, rating
  - View restaurant details
  - Save favorite restaurants
- **Menu & Ordering**
  - View restaurant menu with prices
  - View cuisine information
  - Add items to cart
  - Update cart (increase/decrease quantity)
  - Remove items from cart
  - View cart total
- **Order Management**
  - Place orders from cart
  - View order history
  - Search order history
  - Track order status (pending, confirmed, preparing, ready, delivered)
- **Preferences & Recommendations**
  - Save dietary restrictions
  - Save favorite cuisines
  - Receive recommendations based on order history
  - View personalized recommendations

#### 2.1.3 RESTAURANT OWNER FEATURES

- **Authentication**
  - Login with email/password
  - Logout
  - Reset password
- **Restaurant Management**
  - View restaurant profile
  - Edit restaurant details (name, description, address)
- **Menu Management**
  - Add menu items (name, description, price, cuisine, image)
  - Update menu items
  - Delete menu items
  - Mark items as "Today's Special"
  - Mark items as "Deal of the Day"
- **Order Management**
  - View all incoming orders
  - Update order status
  - View order details with items breakdown
- **Analytics & Insights**
  - View most frequently ordered items
  - Track order statistics

### 2.2 Non-Functional Requirements

- **Performance:** API response time < 500ms
- **Scalability:** Handle 1000+ concurrent users
- **Security:** JWT authentication, password hashing, CORS protection
- **Availability:** 99.9% uptime
- **Maintainability:** Clean code, modular architecture
- **Documentation:** Comprehensive Swagger/OpenAPI docs

### 2.3 Out of Scope

- User signup (seeded data only)
- Online payment integration
- Delivery partner management
- Address management
- Real email notifications (mock only)

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Client App)  │
└────────┬────────┘
         │ HTTP/REST + JWT
         ▼
┌─────────────────────┐
│   FastAPI Backend   │
│   (API Server)      │
└────────┬────────────┘
         │ SQLAlchemy ORM
         ▼
┌─────────────────┐
│  PostgreSQL DB  │
│  (Data Store)   │
└─────────────────┘
```

### 3.2 Technology Stack

**Frontend:**

- React 18+ (UI Library)
- React Router v6 (Routing)
- Redux Toolkit (State Management)
- Axios (HTTP Client)
- React Hook Form (Form Handling)
- React Toastify (Notifications)
- CSS Modules (Styling)

**Backend:**

- Python 3.10+
- FastAPI (Web Framework)
- SQLAlchemy (ORM)
- Pydantic (Data Validation)
- Alembic (Database Migrations)
- Passlib + bcrypt (Password Hashing)
- PyJWT (JWT Handling)
- python-dotenv (Environment Variables)

**Database:**

- PostgreSQL 14+
- SQLAlchemy ORM for abstraction

**Deployment:**

- Docker & Docker Compose
- Azure App Service / Container Apps
- Azure Database for PostgreSQL
- Azure Static Web Apps (Frontend)
- GitHub Actions (CI/CD)

**Testing:**

- pytest (Unit & Integration Tests)
- Postman (API Testing)

---

## 4. DATA MODELS

### 4.1 User Roles

| Role     | Description                      |
| -------- | -------------------------------- |
| CUSTOMER | Can browse, order, track orders  |
| OWNER    | Can manage restaurant and menu   |
| ADMIN    | (Optional) System administration |

### 4.2 Core Entities

#### Users

- id (PK)
- email (unique)
- password_hash
- first_name
- last_name
- phone
- role (CUSTOMER/OWNER)
- is_active
- created_at
- updated_at

#### Restaurants

- id (PK)
- owner_id (FK to Users)
- name
- description
- address
- city
- cuisine_type
- average_rating
- delivery_time_minutes
- delivery_fee
- is_active
- created_at
- updated_at

#### Menus

- id (PK)
- restaurant_id (FK to Restaurants)
- name
- description
- price
- cuisine
- image_url
- is_available
- is_todays_special
- is_deal_of_day
- created_at
- updated_at

#### Orders

- id (PK)
- customer_id (FK to Users)
- restaurant_id (FK to Restaurants)
- total_amount
- status (PENDING, CONFIRMED, PREPARING, READY, DELIVERED)
- special_instructions
- created_at
- updated_at

#### OrderItems

- id (PK)
- order_id (FK to Orders)
- menu_id (FK to Menus)
- quantity
- price_at_order
- created_at

#### Cart

- id (PK)
- customer_id (FK to Users)
- restaurant_id (FK to Restaurants)
- total_items
- total_price
- created_at
- updated_at

#### CartItems

- id (PK)
- cart_id (FK to Cart)
- menu_id (FK to Menus)
- quantity
- price
- created_at
- updated_at

#### CustomerPreferences

- id (PK)
- customer_id (FK to Users)
- dietary_restriction (vegetarian/vegan/gluten_free/etc)
- favorite_cuisine
- created_at

#### FavoriteRestaurants

- id (PK)
- customer_id (FK to Users)
- restaurant_id (FK to Restaurants)
- created_at

#### PasswordResetTokens

- id (PK)
- user_id (FK to Users)
- token
- expires_at
- is_used
- created_at

---

## 5. API ENDPOINTS

### 5.1 Authentication APIs

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | /api/auth/login                  | Login user with email/password |
| POST   | /api/auth/refresh                | Refresh access token           |
| POST   | /api/auth/logout                 | Logout user                    |
| POST   | /api/auth/password-reset-request | Request password reset         |
| POST   | /api/auth/password-reset         | Reset password with token      |

### 5.2 User Profile APIs

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | /api/users/profile | Get current user profile |
| PUT    | /api/users/profile | Update user profile      |

### 5.3 Restaurant APIs (Customer)

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | /api/restaurants                 | Get all restaurants    |
| GET    | /api/restaurants?search=name     | Search restaurants     |
| GET    | /api/restaurants?cuisine=pizza   | Filter by cuisine      |
| GET    | /api/restaurants?price_range=low | Filter by price        |
| GET    | /api/restaurants/{id}            | Get restaurant details |

### 5.4 Restaurant APIs (Owner)

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ----------------------- |
| GET    | /api/owner/restaurants      | Get owner's restaurants |
| PUT    | /api/owner/restaurants/{id} | Update restaurant       |
| GET    | /api/owner/restaurants/{id} | Get restaurant details  |

### 5.5 Menu APIs (Customer)

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | /api/restaurants/{id}/menu | Get restaurant menu   |
| GET    | /api/menus/{id}            | Get menu item details |

### 5.6 Menu APIs (Owner)

| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| POST   | /api/owner/menus                 | Add menu item       |
| PUT    | /api/owner/menus/{id}            | Update menu item    |
| DELETE | /api/owner/menus/{id}            | Delete menu item    |
| GET    | /api/owner/restaurants/{id}/menu | Get restaurant menu |

### 5.7 Cart APIs

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| GET    | /api/cart                 | Get current cart          |
| POST   | /api/cart/items           | Add item to cart          |
| PUT    | /api/cart/items/{item_id} | Update cart item quantity |
| DELETE | /api/cart/items/{item_id} | Remove cart item          |
| DELETE | /api/cart                 | Clear cart                |

### 5.8 Order APIs (Customer)

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | /api/orders             | Create order from cart |
| GET    | /api/orders             | Get customer's orders  |
| GET    | /api/orders/{id}        | Get order details      |
| GET    | /api/orders/{id}/status | Get order status       |

### 5.9 Order APIs (Owner)

| Method | Endpoint                              | Description             |
| ------ | ------------------------------------- | ----------------------- |
| GET    | /api/owner/orders                     | Get restaurant's orders |
| PUT    | /api/owner/orders/{id}/status         | Update order status     |
| GET    | /api/owner/orders/{id}                | Get order details       |
| GET    | /api/owner/orders/analytics/top-items | Get top ordered items   |

### 5.10 Preferences APIs

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| GET    | /api/preferences              | Get user preferences    |
| POST   | /api/preferences/dietary      | Add dietary restriction |
| POST   | /api/preferences/cuisine      | Add favorite cuisine    |
| DELETE | /api/preferences/dietary/{id} | Remove dietary          |

### 5.11 Favorites APIs

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | /api/favorites                 | Get favorite restaurants |
| POST   | /api/favorites/{restaurant_id} | Add to favorites         |
| DELETE | /api/favorites/{restaurant_id} | Remove from favorites    |

### 5.12 Recommendations APIs

| Method | Endpoint                      | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| GET    | /api/recommendations          | Get personalized recommendations  |
| GET    | /api/recommendations/cuisines | Get cuisine-based recommendations |

---

## 6. AUTHENTICATION & AUTHORIZATION

### 6.1 Authentication Flow

1. User submits email/password
2. Backend validates credentials
3. Backend returns JWT token (access + refresh)
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header
6. Backend validates token for protected routes

### 6.2 JWT Token Structure

```
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "exp": 1234567890
}
```

### 6.3 Authorization Rules

| Action                 | Customer | Owner |
| ---------------------- | -------- | ----- |
| Browse Restaurants     | ✓        | ✗     |
| Place Orders           | ✓        | ✗     |
| Manage Menu            | ✗        | ✓     |
| View Own Orders        | ✓        | ✗     |
| View Restaurant Orders | ✗        | ✓     |

---

## 7. USER FLOWS

### 7.1 Customer Flow

```
Login → Browse Restaurants → Select Restaurant
→ View Menu → Add to Cart → View Cart
→ Place Order → View Order Status → Track Order
```

### 7.2 Restaurant Owner Flow

```
Login → View Restaurant → Manage Menu
→ View Incoming Orders → Update Order Status
→ View Analytics
```

---

## 8. SCREEN LIST

### Frontend Screens (Customer)

1. Login Page
2. Dashboard (Browse Restaurants)
3. Restaurant Detail Page
4. Cart Page
5. Order Confirmation Page
6. Order History Page
7. User Profile Page
8. Recommendations Page
9. Favorites Page

### Frontend Screens (Owner)

1. Owner Login Page
2. Owner Dashboard (Restaurant Overview)
3. Menu Management Page
4. Orders Dashboard
5. Order Management Page
6. Analytics Page

---

## 9. DATABASE CONSTRAINTS

- Email must be unique
- User passwords hashed with bcrypt
- Orders can only be created from cart with items
- Menu items can only be deleted if no active orders
- One cart per customer per restaurant
- Only owners can manage their own restaurants
- Only customers can place orders

---

## 10. ERROR HANDLING

### 10.1 Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

### 10.2 Error Codes

| Code                | HTTP Status | Description          |
| ------------------- | ----------- | -------------------- |
| INVALID_CREDENTIALS | 401         | Wrong email/password |
| TOKEN_EXPIRED       | 401         | JWT token expired    |
| UNAUTHORIZED        | 403         | User not authorized  |
| NOT_FOUND           | 404         | Resource not found   |
| DUPLICATE_EMAIL     | 409         | Email already exists |
| VALIDATION_ERROR    | 422         | Invalid input data   |
| INTERNAL_ERROR      | 500         | Server error         |

---

## 11. LOGGING REQUIREMENTS

- Login attempts (success/failure)
- Order creation/updates
- Restaurant updates
- Cart operations
- Exceptions and errors
- Password reset requests
- All file logs with rotation strategy

---

## 12. TESTING REQUIREMENTS

**Minimum 10 pytest unit tests:**

1. User authentication tests
2. Password hashing tests
3. User login/logout tests
4. Restaurant CRUD tests
5. Menu CRUD tests
6. Order creation tests
7. Cart operations tests
8. Recommendation generation tests
9. Authorization tests
10. Password reset tests

---

## 13. SEED DATA REQUIREMENTS

- 3 Restaurant Owners
- 15 Customers
- 6 Restaurants
- 10 Menu Items per Restaurant (60 total)
- 30-40 Random Orders
- Random customer preferences
- Random favorite restaurants

---

## 14. ACCEPTANCE CRITERIA

- [ ] All authentication features working
- [ ] All customer features working
- [ ] All owner features working
- [ ] Database migrations running smoothly
- [ ] Tests passing (minimum 10)
- [ ] Swagger documentation complete
- [ ] Docker containers working
- [ ] Deployment to Azure successful
- [ ] CI/CD pipeline configured
- [ ] README and documentation complete

---

## 15. SUCCESS METRICS

- System handles 1000+ concurrent users
- API response time < 500ms
- 95% test coverage for critical paths
- Zero data loss during transactions
- 99.9% application uptime
- All requirements implemented
