# Database Design & ER Diagram

## JustEat Food Ordering Application

---

## 1. ER DIAGRAM (Text Format)

```
┌─────────────────────────────────────────────────────────────────┐
│                         JUSTEAT DATABASE                         │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │    USERS     │
                              ├──────────────┤
                              │ id (PK)      │
                              │ email (U)    │◄──────────────┐
                              │ password     │               │
                              │ first_name   │               │
                              │ last_name    │               │
                              │ phone        │               │
                              │ role         │               │
                              │ is_active    │               │
                              │ created_at   │               │
                              └──────────────┘               │
                                    ▲                        │
                                    │                        │
                ┌───────────────────┼───────────────────┐   │
                │                   │                   │   │
         FK(owner_id)       FK(customer_id)  FK(user_id)   │
                │                   │                   │   │
                ▼                   ▼                   ▼   │
          ┌──────────────┐   ┌──────────────┐  ┌────────────────────┐
          │ RESTAURANTS  │   │    ORDERS    │  │PASSWORD_RESET_TOKENS
          ├──────────────┤   ├──────────────┤  ├────────────────────┤
          │ id (PK)      │   │ id (PK)      │  │ id (PK)            │
          │ owner_id(FK) │───│ customer_id(FK)
          │ name         │   │ restaurant_id(FK)─┐
          │ description  │   │ total_amount │  │ token              │
          │ address      │   │ status       │  │ expires_at         │
          │ city         │   │ created_at   │  │ is_used            │
          │ cuisine_type │   └──────────────┘  └────────────────────┘
          │ rating       │         │
          │ delivery_fee │         │
          │ is_active    │   FK(order_id)
          │ created_at   │         │
          └──────────────┘         ▼
                │          ┌──────────────────┐
                │          │  ORDER_ITEMS     │
                │          ├──────────────────┤
                │          │ id (PK)          │
          FK(restaurant_id) │ order_id(FK)     │
                │          │ menu_id(FK)      │
                ▼          │ quantity         │
         ┌──────────────┐  │ price_at_order   │
         │    MENUS     │  │ created_at       │
         ├──────────────┤  └──────────────────┘
         │ id (PK)      │         ▲
         │ restaurant_id(FK)     │
         │ name         │   FK(menu_id)
         │ description  │         │
         │ price        │         │
         │ cuisine      │         │
         │ image_url    │  ┌──────────────────┐
         │ is_available │  │  CART            │
         │ is_special   │  ├──────────────────┤
         │ is_deal      │  │ id (PK)          │
         │ created_at   │  │ customer_id(FK)──┼─────┐
         └──────────────┘  │ restaurant_id(FK)│────┐│
                │          │ total_items      │    ││
                │          │ total_price      │    ││
                │          │ created_at       │    ││
                │          └──────────────────┘    ││
                │                  ▲               ││
                │                  │               ││
          FK(menu_id)        FK(cart_id)   FK(restaurant_id)
                │                  │               │
                ▼                  ▼               ▼
         ┌──────────────────┐ ┌─────────────┐   │
         │  CART_ITEMS      │ │CUSTOMER_PREFS
         ├──────────────────┤ ├─────────────┤
         │ id (PK)          │ │ id (PK)     │
         │ cart_id(FK)      │ │ customer_id │
         │ menu_id(FK)      │ │ dietary     │
         │ quantity         │ │ cuisine     │
         │ price            │ │ created_at  │
         │ created_at       │ └─────────────┘
         └──────────────────┘

         ┌──────────────────────────┐
         │ FAVORITE_RESTAURANTS     │
         ├──────────────────────────┤
         │ id (PK)                  │
         │ customer_id(FK)→USERS    │
         │ restaurant_id(FK)→RESTAURANTS
         │ created_at               │
         └──────────────────────────┘
```

---

## 2. TABLE DEFINITIONS

### 2.1 Users Table

**Purpose:** Store all user accounts (customers and restaurant owners)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('CUSTOMER', 'OWNER')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

**Why:**

- Centralized user management
- Email unique for login
- Role-based access control
- Password hashing for security
- Timestamps for audit trail

---

### 2.2 Restaurants Table

**Purpose:** Store restaurant information owned by owners

```sql
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    cuisine_type VARCHAR(100),
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    delivery_time_minutes INTEGER DEFAULT 30,
    delivery_fee DECIMAL(10,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_city (city)
);
```

**Why:**

- Links to owner (one owner → many restaurants)
- Complete restaurant information
- Delivery details for customers
- Active flag for soft deletes

---

### 2.3 Menus Table

**Purpose:** Store menu items for each restaurant

```sql
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cuisine VARCHAR(100),
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    is_todays_special BOOLEAN DEFAULT FALSE,
    is_deal_of_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_cuisine (cuisine)
);
```

**Why:**

- One restaurant → many menu items
- Price tracking for orders
- Special pricing flags
- Cuisine categorization

---

### 2.4 Orders Table

**Purpose:** Store customer orders

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN
        ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED')),
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

**Why:**

- Links customer to orders
- Links restaurant to orders
- Status tracking for order flow
- Amount tracking for analytics

---

### 2.5 OrderItems Table

**Purpose:** Store line items for each order

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id),
    INDEX idx_order_id (order_id),
    INDEX idx_menu_id (menu_id)
);
```

**Why:**

- One order → many items
- Capture price at time of order (for historical accuracy)
- Detailed order breakdown

---

### 2.6 Cart Table

**Purpose:** Store shopping carts for customers

```sql
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE,
    restaurant_id INTEGER NOT NULL,
    total_items INTEGER DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_restaurant_id (restaurant_id)
);
```

**Why:**

- One cart per customer (UNIQUE constraint)
- Tracks cart totals
- Links to specific restaurant

---

### 2.7 CartItems Table

**Purpose:** Store items in shopping carts

```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_menu_id (menu_id),
    UNIQUE (cart_id, menu_id)
);
```

**Why:**

- One cart → many items
- UNIQUE constraint prevents duplicate items (use quantity instead)
- Price stored for consistency

---

### 2.8 CustomerPreferences Table

**Purpose:** Store customer dietary and cuisine preferences

```sql
CREATE TABLE customer_preferences (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    dietary_restriction VARCHAR(100),
    favorite_cuisine VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_dietary (dietary_restriction),
    INDEX idx_cuisine (favorite_cuisine)
);
```

**Why:**

- Stores multiple preferences per customer
- Used for recommendations
- Flexible for adding more restriction types

---

### 2.9 FavoriteRestaurants Table

**Purpose:** Store customer's favorite restaurants

```sql
CREATE TABLE favorite_restaurants (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE (customer_id, restaurant_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_restaurant_id (restaurant_id)
);
```

**Why:**

- Many-to-many relationship
- UNIQUE prevents duplicate favorites
- Used for quick access to favorites

---

### 2.10 PasswordResetTokens Table

**Purpose:** Store password reset tokens for secure password changes

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);
```

**Why:**

- Secure password reset flow
- Token expiration tracking
- One-time use flag
- Audit trail for security

---

## 3. RELATIONSHIPS

### 3.1 One-to-Many Relationships

| From                 | To            | Description                             |
| -------------------- | ------------- | --------------------------------------- |
| USERS → RESTAURANTS  | owner_id      | One owner can have multiple restaurants |
| RESTAURANTS → MENUS  | restaurant_id | One restaurant has multiple menu items  |
| RESTAURANTS → ORDERS | restaurant_id | One restaurant receives multiple orders |
| USERS → ORDERS       | customer_id   | One customer can place multiple orders  |
| ORDERS → ORDER_ITEMS | order_id      | One order has multiple items            |
| CART → CART_ITEMS    | cart_id       | One cart has multiple items             |

### 3.2 Many-to-Many Relationships

| Table 1 | Junction             | Table 2     | Description                                 |
| ------- | -------------------- | ----------- | ------------------------------------------- |
| USERS   | FAVORITE_RESTAURANTS | RESTAURANTS | Customers can favorite multiple restaurants |
| USERS   | CUSTOMER_PREFERENCES | (Self)      | Customers can have multiple preferences     |

### 3.3 One-to-One Relationships

| From         | To          | Description                         |
| ------------ | ----------- | ----------------------------------- |
| USERS → CART | customer_id | Each customer has one cart (UNIQUE) |

---

## 4. INDEXES

**Indexes created for performance:**

```
users:
  - idx_email: Fast lookups by email (login)
  - idx_role: Filter by user role

restaurants:
  - idx_owner_id: Owner's restaurants
  - idx_city: City-based search

menus:
  - idx_restaurant_id: Restaurant's menu items
  - idx_cuisine: Cuisine-based filtering

orders:
  - idx_customer_id: Customer's orders
  - idx_restaurant_id: Restaurant's orders
  - idx_status: Find orders by status
  - idx_created_at: Order timeline queries

cart:
  - idx_customer_id: Find customer's cart
  - idx_restaurant_id: Filter carts by restaurant

cart_items:
  - idx_cart_id: Find items in cart
  - idx_menu_id: Find item details

customer_preferences:
  - idx_customer_id: Find customer prefs
  - idx_dietary: Filter by dietary restriction
  - idx_cuisine: Filter by cuisine

favorite_restaurants:
  - idx_customer_id: Customer's favorites
  - idx_restaurant_id: Restaurant's favorited by

password_reset_tokens:
  - idx_user_id: User's reset tokens
  - idx_token: Find token details
  - idx_expires_at: Clean up expired tokens
```

---

## 5. CONSTRAINTS

### 5.1 Primary Keys

- All tables have `id` as primary key
- Auto-increment SERIAL type

### 5.2 Foreign Keys

- All FKs use ON DELETE CASCADE (when parent deleted, children deleted)
- Maintains referential integrity

### 5.3 Unique Constraints

- Users.email (no duplicate accounts)
- Cart.customer_id (one cart per customer)
- CartItems (unique combination of cart + menu)
- FavoriteRestaurants (unique combination of customer + restaurant)
- PasswordResetTokens.token (unique token)

### 5.4 Check Constraints

- Users.role IN ('CUSTOMER', 'OWNER')
- Orders.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED')
- OrderItems.quantity > 0
- CartItems.quantity > 0

### 5.5 NOT NULL Constraints

- All essential fields marked NOT NULL
- Email, password_hash, names for users
- Prices, quantities for transactions

---

## 6. NORMALIZATION

### Database Normalization: 3NF (Third Normal Form)

**1NF - Atomic Values:**

- All fields contain single atomic values
- No repeating groups
- Price stored as decimal (not "100 USD")

**2NF - No Partial Dependencies:**

- All non-key attributes depend on entire primary key
- No transitive dependencies within a table

**3NF - No Transitive Dependencies:**

- CustomerPreferences separated from Users
- OrderItems at order time separate from current menu

**Denormalization Areas:**

- `orders.total_amount`: Stored for quick access (also calculated from order_items)
- `cart.total_items` and `cart.total_price`: Stored for quick access
- `price_at_order` in OrderItems: Stores historical price

---

## 7. SEED DATA DISTRIBUTION

**Users (18 total):**

- 3 Restaurant Owners
- 15 Customers

**Restaurants (6):**

- 2 Restaurant A (owner 1)
- 2 Restaurant B (owner 2)
- 1 Restaurant C (owner 3)
- 1 Restaurant D (owner 1)

**Menus (60 total, 10 per restaurant):**

- Various cuisines
- Prices ranging $5-$50

**Orders (30-40):**

- Randomly distributed among customers
- Random statuses
- Varying items per order

**Preferences & Favorites:**

- Random customer preferences
- Random favorite restaurants

---

## 8. MIGRATION STRATEGY

**Using Alembic:**

1. Initial migration creates all tables
2. Subsequent migrations for:
   - Adding columns
   - Modifying constraints
   - Creating indexes
   - Seed data

---

## 9. QUERY EXAMPLES

### Find customer's orders

```sql
SELECT o.* FROM orders o
WHERE o.customer_id = 1
ORDER BY o.created_at DESC;
```

### Find restaurant's menu with availability

```sql
SELECT * FROM menus m
WHERE m.restaurant_id = 1 AND m.is_available = TRUE;
```

### Get order details with items

```sql
SELECT o.id, oi.menu_id, m.name, oi.quantity, oi.price_at_order
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menus m ON oi.menu_id = m.id
WHERE o.id = 1;
```

### Top ordered items for restaurant

```sql
SELECT m.id, m.name, SUM(oi.quantity) as total_ordered
FROM menus m
JOIN order_items oi ON m.id = oi.menu_id
JOIN orders o ON oi.order_id = o.id
WHERE m.restaurant_id = 1
GROUP BY m.id, m.name
ORDER BY total_ordered DESC
LIMIT 10;
```

### Customer preferences for recommendations

```sql
SELECT DISTINCT cp.favorite_cuisine
FROM customer_preferences cp
WHERE cp.customer_id = 1;
```
