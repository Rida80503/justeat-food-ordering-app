# API Specification Document

## JustEat Food Ordering Application

---

## 1. API OVERVIEW

**Base URL:** `http://localhost:8000/api` (local)  
**Production URL:** `https://api.justeat.com/api` (to be deployed)  
**API Version:** v1  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`  
**Documentation:** `/docs` (Swagger UI)  
**Alternative Docs:** `/redoc` (ReDoc)

---

## 2. AUTHENTICATION ENDPOINTS

### 2.1 Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user with email and password. Returns JWT access token and refresh token.

**Request Body:**

```json
{
  "email": "customer1@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "customer1@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "CUSTOMER",
      "phone": "1234567890"
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "error_code": "INVALID_CREDENTIALS",
  "status_code": 401
}
```

**Status Codes:**

- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `422 Unprocessable Entity` - Validation error

---

### 2.2 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Generate new access token using refresh token.

**Request Headers:**

```
Authorization: Bearer <refresh_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

**Status Codes:**

- `200 OK` - Token refreshed
- `401 Unauthorized` - Invalid refresh token

---

### 2.3 Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout user (client-side mainly, token invalidation optional).

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Codes:**

- `200 OK` - Logout successful
- `401 Unauthorized` - Invalid token

---

### 2.4 Password Reset Request

**Endpoint:** `POST /auth/password-reset-request`

**Description:** Request password reset. Generates token (sent via email - mock).

**Request Body:**

```json
{
  "email": "customer1@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent (mock). Check logs for reset token."
}
```

**Status Codes:**

- `200 OK` - Reset request sent
- `404 Not Found` - User not found

---

### 2.5 Password Reset

**Endpoint:** `POST /auth/password-reset`

**Description:** Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error_code": "INVALID_TOKEN",
  "status_code": 400
}
```

**Status Codes:**

- `200 OK` - Password reset successful
- `400 Bad Request` - Invalid or expired token

---

## 3. USER PROFILE ENDPOINTS

### 3.1 Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Get current authenticated user's profile.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": 1,
    "email": "customer1@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Profile retrieved
- `401 Unauthorized` - Invalid token

---

### 3.2 Update User Profile

**Endpoint:** `PUT /users/profile`

**Description:** Update current user's profile information.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "9876543210"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "customer1@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "is_active": true,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Profile updated
- `401 Unauthorized` - Invalid token
- `422 Unprocessable Entity` - Validation error

---

## 4. RESTAURANT ENDPOINTS (CUSTOMER)

### 4.1 Get All Restaurants

**Endpoint:** `GET /restaurants`

**Description:** Get all restaurants with optional pagination.

**Query Parameters:**

```
page=1 (default: 1)
page_size=20 (default: 20)
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurants retrieved",
  "data": {
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "description": "Best pizza in town",
        "address": "123 Main St",
        "city": "New York",
        "cuisine_type": "Italian",
        "average_rating": 4.5,
        "delivery_time_minutes": 30,
        "delivery_fee": 2.99,
        "is_active": true
      }
    ],
    "total": 6,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
}
```

**Status Codes:**

- `200 OK` - Restaurants retrieved
- `401 Unauthorized` - Invalid token

---

### 4.2 Search Restaurants

**Endpoint:** `GET /restaurants?search=<name>`

**Description:** Search restaurants by name.

**Query Parameters:**

```
search=pizza
page=1
page_size=20
```

**Example Request:**

```
GET /restaurants?search=pizza
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Search results retrieved",
  "data": {
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "description": "Best pizza in town",
        "address": "123 Main St",
        "city": "New York",
        "cuisine_type": "Italian",
        "average_rating": 4.5,
        "delivery_time_minutes": 30,
        "delivery_fee": 2.99
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

**Status Codes:**

- `200 OK` - Search results
- `401 Unauthorized` - Invalid token

---

### 4.3 Filter Restaurants

**Endpoint:** `GET /restaurants?cuisine=<type>&price_range=<range>`

**Description:** Filter restaurants by cuisine and price range.

**Query Parameters:**

```
cuisine=Italian
price_range=low (or medium, high)
page=1
page_size=20
```

**Example Request:**

```
GET /restaurants?cuisine=Italian&price_range=low
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Filtered results retrieved",
  "data": {
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "cuisine_type": "Italian",
        "description": "Best pizza in town",
        "address": "123 Main St",
        "city": "New York",
        "average_rating": 4.5,
        "delivery_time_minutes": 30,
        "delivery_fee": 2.99
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

**Status Codes:**

- `200 OK` - Filtered results
- `401 Unauthorized` - Invalid token

---

### 4.4 Get Restaurant Details

**Endpoint:** `GET /restaurants/{restaurant_id}`

**Description:** Get detailed information about a specific restaurant.

**Path Parameters:**

```
restaurant_id = 1 (Restaurant ID)
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurant details retrieved",
  "data": {
    "id": 1,
    "owner_id": 10,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "123 Main St",
    "city": "New York",
    "cuisine_type": "Italian",
    "average_rating": 4.5,
    "delivery_time_minutes": 30,
    "delivery_fee": 2.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Restaurant not found",
  "error_code": "NOT_FOUND",
  "status_code": 404
}
```

**Status Codes:**

- `200 OK` - Details retrieved
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Restaurant not found

---

## 5. MENU ENDPOINTS (CUSTOMER)

### 5.1 Get Restaurant Menu

**Endpoint:** `GET /restaurants/{restaurant_id}/menu`

**Description:** Get all menu items for a restaurant.

**Path Parameters:**

```
restaurant_id = 1
```

**Query Parameters:**

```
page=1
page_size=50
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Menu retrieved",
  "data": {
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace",
    "menu_items": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Classic pizza with mozzarella and basil",
        "price": 12.99,
        "cuisine": "Italian",
        "image_url": "https://example.com/pizza.jpg",
        "is_available": true,
        "is_todays_special": true,
        "is_deal_of_day": false
      },
      {
        "id": 2,
        "name": "Pepperoni Pizza",
        "description": "Pizza with pepperoni",
        "price": 14.99,
        "cuisine": "Italian",
        "image_url": "https://example.com/pepperoni.jpg",
        "is_available": true,
        "is_todays_special": false,
        "is_deal_of_day": true
      }
    ],
    "total": 10,
    "page": 1,
    "page_size": 50
  }
}
```

**Status Codes:**

- `200 OK` - Menu retrieved
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Restaurant not found

---

### 5.2 Get Menu Item Details

**Endpoint:** `GET /menus/{menu_id}`

**Description:** Get details of a specific menu item.

**Path Parameters:**

```
menu_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Menu item retrieved",
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "name": "Margherita Pizza",
    "description": "Classic pizza with mozzarella and basil",
    "price": 12.99,
    "cuisine": "Italian",
    "image_url": "https://example.com/pizza.jpg",
    "is_available": true,
    "is_todays_special": true,
    "is_deal_of_day": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Item retrieved
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Menu item not found

---

## 6. OWNER RESTAURANT ENDPOINTS

### 6.1 Get Owner's Restaurants

**Endpoint:** `GET /owner/restaurants`

**Description:** Get all restaurants owned by the authenticated owner.

**Request Headers:**

```
Authorization: Bearer <access_token>
(Required: User role must be OWNER)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurants retrieved",
  "data": {
    "restaurants": [
      {
        "id": 1,
        "owner_id": 10,
        "name": "Pizza Palace",
        "description": "Best pizza in town",
        "address": "123 Main St",
        "city": "New York",
        "cuisine_type": "Italian",
        "average_rating": 4.5,
        "delivery_time_minutes": 30,
        "delivery_fee": 2.99,
        "is_active": true
      }
    ],
    "total": 1
  }
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Only restaurant owners can access this endpoint",
  "error_code": "UNAUTHORIZED",
  "status_code": 403
}
```

**Status Codes:**

- `200 OK` - Restaurants retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - User is not an owner

---

### 6.2 Get Owner's Restaurant Details

**Endpoint:** `GET /owner/restaurants/{restaurant_id}`

**Description:** Get detailed information about owner's restaurant.

**Path Parameters:**

```
restaurant_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurant details retrieved",
  "data": {
    "id": 1,
    "owner_id": 10,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "123 Main St",
    "city": "New York",
    "cuisine_type": "Italian",
    "average_rating": 4.5,
    "delivery_time_minutes": 30,
    "delivery_fee": 2.99,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Details retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - User is not the owner
- `404 Not Found` - Restaurant not found

---

### 6.3 Update Restaurant

**Endpoint:** `PUT /owner/restaurants/{restaurant_id}`

**Description:** Update restaurant details.

**Path Parameters:**

```
restaurant_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Pizza Palace Updated",
  "description": "The best pizza in town",
  "address": "123 Main St",
  "city": "New York",
  "cuisine_type": "Italian",
  "delivery_time_minutes": 35,
  "delivery_fee": 3.5
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurant updated successfully",
  "data": {
    "id": 1,
    "owner_id": 10,
    "name": "Pizza Palace Updated",
    "description": "The best pizza in town",
    "address": "123 Main St",
    "city": "New York",
    "cuisine_type": "Italian",
    "delivery_time_minutes": 35,
    "delivery_fee": 3.5,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Restaurant updated
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Restaurant not found
- `422 Unprocessable Entity` - Validation error

---

## 7. MENU MANAGEMENT ENDPOINTS (OWNER)

### 7.1 Get Owner's Restaurant Menu

**Endpoint:** `GET /owner/restaurants/{restaurant_id}/menu`

**Description:** Get all menu items for owner's restaurant.

**Path Parameters:**

```
restaurant_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Menu retrieved",
  "data": {
    "restaurant_id": 1,
    "menu_items": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Classic pizza",
        "price": 12.99,
        "cuisine": "Italian",
        "image_url": "https://example.com/pizza.jpg",
        "is_available": true,
        "is_todays_special": true,
        "is_deal_of_day": false
      }
    ],
    "total": 10
  }
}
```

**Status Codes:**

- `200 OK` - Menu retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner

---

### 7.2 Add Menu Item

**Endpoint:** `POST /owner/menus`

**Description:** Add a new menu item to restaurant.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "restaurant_id": 1,
  "name": "Margherita Pizza",
  "description": "Classic pizza with mozzarella and basil",
  "price": 12.99,
  "cuisine": "Italian",
  "image_url": "https://example.com/pizza.jpg",
  "is_available": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 11,
    "restaurant_id": 1,
    "name": "Margherita Pizza",
    "description": "Classic pizza with mozzarella and basil",
    "price": 12.99,
    "cuisine": "Italian",
    "image_url": "https://example.com/pizza.jpg",
    "is_available": true,
    "is_todays_special": false,
    "is_deal_of_day": false,
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Item created
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Restaurant not found
- `422 Unprocessable Entity` - Validation error

---

### 7.3 Update Menu Item

**Endpoint:** `PUT /owner/menus/{menu_id}`

**Description:** Update existing menu item.

**Path Parameters:**

```
menu_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Margherita Pizza Premium",
  "description": "Classic pizza with premium mozzarella",
  "price": 14.99,
  "is_available": true,
  "is_todays_special": true,
  "is_deal_of_day": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "id": 1,
    "name": "Margherita Pizza Premium",
    "description": "Classic pizza with premium mozzarella",
    "price": 14.99,
    "is_available": true,
    "is_todays_special": true,
    "is_deal_of_day": false,
    "updated_at": "2024-01-15T13:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Item updated
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Menu item not found
- `422 Unprocessable Entity` - Validation error

---

### 7.4 Delete Menu Item

**Endpoint:** `DELETE /owner/menus/{menu_id}`

**Description:** Delete menu item from restaurant.

**Path Parameters:**

```
menu_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Status Codes:**

- `200 OK` - Item deleted
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Menu item not found

---

## 8. CART ENDPOINTS

### 8.1 Get Cart

**Endpoint:** `GET /cart`

**Description:** Get current user's shopping cart.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cart retrieved",
  "data": {
    "id": 5,
    "customer_id": 1,
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace",
    "total_items": 2,
    "total_price": 27.98,
    "items": [
      {
        "id": 20,
        "menu_id": 1,
        "item_name": "Margherita Pizza",
        "quantity": 1,
        "price": 12.99,
        "subtotal": 12.99
      },
      {
        "id": 21,
        "menu_id": 2,
        "item_name": "Pepperoni Pizza",
        "quantity": 1,
        "price": 14.99,
        "subtotal": 14.99
      }
    ]
  }
}
```

**Error Response - No Cart (404):**

```json
{
  "success": false,
  "message": "Cart not found",
  "error_code": "NOT_FOUND",
  "status_code": 404
}
```

**Status Codes:**

- `200 OK` - Cart retrieved
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Cart not found

---

### 8.2 Add Item to Cart

**Endpoint:** `POST /cart/items`

**Description:** Add menu item to cart or update quantity if already in cart.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "menu_id": 1,
  "quantity": 2,
  "restaurant_id": 1
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": 5,
    "customer_id": 1,
    "restaurant_id": 1,
    "total_items": 2,
    "total_price": 25.98,
    "items": [
      {
        "id": 20,
        "menu_id": 1,
        "quantity": 2,
        "price": 12.99
      }
    ]
  }
}
```

**Error Response - Wrong Restaurant (400):**

```json
{
  "success": false,
  "message": "Cannot add items from different restaurants to cart",
  "error_code": "INVALID_REQUEST",
  "status_code": 400
}
```

**Status Codes:**

- `201 Created` - Item added
- `200 OK` - Item quantity updated
- `400 Bad Request` - Different restaurant item
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Menu item not found
- `422 Unprocessable Entity` - Validation error

---

### 8.3 Update Cart Item Quantity

**Endpoint:** `PUT /cart/items/{cart_item_id}`

**Description:** Update quantity of item in cart.

**Path Parameters:**

```
cart_item_id = 20
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": 20,
    "menu_id": 1,
    "quantity": 3,
    "price": 12.99,
    "subtotal": 38.97
  }
}
```

**Error Response - Invalid Quantity (400):**

```json
{
  "success": false,
  "message": "Quantity must be greater than 0",
  "error_code": "INVALID_REQUEST",
  "status_code": 400
}
```

**Status Codes:**

- `200 OK` - Item updated
- `400 Bad Request` - Invalid quantity
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Cart item not found

---

### 8.4 Remove Cart Item

**Endpoint:** `DELETE /cart/items/{cart_item_id}`

**Description:** Remove item from cart.

**Path Parameters:**

```
cart_item_id = 20
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Status Codes:**

- `200 OK` - Item removed
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Cart item not found

---

### 8.5 Clear Cart

**Endpoint:** `DELETE /cart`

**Description:** Clear entire cart (remove all items).

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

**Status Codes:**

- `200 OK` - Cart cleared
- `401 Unauthorized` - Invalid token

---

## 9. ORDER ENDPOINTS (CUSTOMER)

### 9.1 Create Order

**Endpoint:** `POST /orders`

**Description:** Create order from cart items. Clears cart after order creation.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "special_instructions": "Please ring doorbell twice"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 50,
    "customer_id": 1,
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace",
    "total_amount": 25.98,
    "status": "PENDING",
    "special_instructions": "Please ring doorbell twice",
    "items": [
      {
        "id": 100,
        "menu_id": 1,
        "item_name": "Margherita Pizza",
        "quantity": 2,
        "price_at_order": 12.99
      }
    ],
    "created_at": "2024-01-15T14:00:00Z"
  }
}
```

**Error Response - Empty Cart (400):**

```json
{
  "success": false,
  "message": "Cart is empty",
  "error_code": "INVALID_REQUEST",
  "status_code": 400
}
```

**Status Codes:**

- `201 Created` - Order created
- `400 Bad Request` - Cart empty
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Cart not found

---

### 9.2 Get Customer Orders

**Endpoint:** `GET /orders`

**Description:** Get all orders placed by customer.

**Query Parameters:**

```
page=1
page_size=20
status=PENDING (optional filter)
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Orders retrieved",
  "data": {
    "orders": [
      {
        "id": 50,
        "restaurant_id": 1,
        "restaurant_name": "Pizza Palace",
        "total_amount": 25.98,
        "status": "PREPARING",
        "special_instructions": "Please ring doorbell twice",
        "created_at": "2024-01-15T14:00:00Z",
        "updated_at": "2024-01-15T14:05:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "page_size": 20
  }
}
```

**Status Codes:**

- `200 OK` - Orders retrieved
- `401 Unauthorized` - Invalid token

---

### 9.3 Get Order Details

**Endpoint:** `GET /orders/{order_id}`

**Description:** Get detailed information about a specific order.

**Path Parameters:**

```
order_id = 50
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order details retrieved",
  "data": {
    "id": 50,
    "customer_id": 1,
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace",
    "total_amount": 25.98,
    "status": "PREPARING",
    "special_instructions": "Please ring doorbell twice",
    "items": [
      {
        "id": 100,
        "menu_id": 1,
        "item_name": "Margherita Pizza",
        "description": "Classic pizza with mozzarella and basil",
        "quantity": 2,
        "price_at_order": 12.99,
        "subtotal": 25.98
      }
    ],
    "created_at": "2024-01-15T14:00:00Z",
    "updated_at": "2024-01-15T14:05:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Details retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not order owner
- `404 Not Found` - Order not found

---

### 9.4 Get Order Status

**Endpoint:** `GET /orders/{order_id}/status`

**Description:** Get current status of an order.

**Path Parameters:**

```
order_id = 50
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order status retrieved",
  "data": {
    "order_id": 50,
    "status": "PREPARING",
    "updated_at": "2024-01-15T14:05:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Status retrieved
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Order not found

---

## 10. ORDER ENDPOINTS (OWNER)

### 10.1 Get Restaurant Orders

**Endpoint:** `GET /owner/orders`

**Description:** Get all orders for owner's restaurant.

**Query Parameters:**

```
page=1
page_size=20
status=PENDING (optional filter)
```

**Request Headers:**

```
Authorization: Bearer <access_token>
(Required: User role must be OWNER)
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Orders retrieved",
  "data": {
    "orders": [
      {
        "id": 50,
        "customer_id": 1,
        "customer_name": "John Doe",
        "customer_phone": "1234567890",
        "total_amount": 25.98,
        "status": "PENDING",
        "special_instructions": "Please ring doorbell twice",
        "created_at": "2024-01-15T14:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "page_size": 20
  }
}
```

**Status Codes:**

- `200 OK` - Orders retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner

---

### 10.2 Get Order Details (Owner)

**Endpoint:** `GET /owner/orders/{order_id}`

**Description:** Get detailed information about order for owner.

**Path Parameters:**

```
order_id = 50
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order details retrieved",
  "data": {
    "id": 50,
    "customer_id": 1,
    "customer_name": "John Doe",
    "customer_phone": "1234567890",
    "total_amount": 25.98,
    "status": "PENDING",
    "special_instructions": "Please ring doorbell twice",
    "items": [
      {
        "id": 100,
        "menu_id": 1,
        "item_name": "Margherita Pizza",
        "quantity": 2,
        "price_at_order": 12.99
      }
    ],
    "created_at": "2024-01-15T14:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Details retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Order not found

---

### 10.3 Update Order Status

**Endpoint:** `PUT /owner/orders/{order_id}/status`

**Description:** Update order status (PENDING → CONFIRMED → PREPARING → READY → DELIVERED).

**Path Parameters:**

```
order_id = 50
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "PREPARING"
}
```

**Valid Status Transitions:**

```
PENDING → CONFIRMED
CONFIRMED → PREPARING
PREPARING → READY
READY → DELIVERED
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": 50,
    "status": "PREPARING",
    "updated_at": "2024-01-15T14:10:00Z"
  }
}
```

**Error Response - Invalid Status (400):**

```json
{
  "success": false,
  "message": "Invalid status transitions",
  "error_code": "INVALID_REQUEST",
  "status_code": 400
}
```

**Status Codes:**

- `200 OK` - Status updated
- `400 Bad Request` - Invalid status
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner
- `404 Not Found` - Order not found

---

### 10.4 Get Top Ordered Items

**Endpoint:** `GET /owner/orders/analytics/top-items`

**Description:** Get most frequently ordered items for restaurant.

**Query Parameters:**

```
limit=10
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Top items retrieved",
  "data": {
    "restaurant_id": 1,
    "top_items": [
      {
        "menu_id": 1,
        "item_name": "Margherita Pizza",
        "total_ordered": 25
      },
      {
        "menu_id": 2,
        "item_name": "Pepperoni Pizza",
        "total_ordered": 18
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Items retrieved
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not restaurant owner

---

## 11. PREFERENCES ENDPOINTS

### 11.1 Get Preferences

**Endpoint:** `GET /preferences`

**Description:** Get user's dietary restrictions and favorite cuisines.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Preferences retrieved",
  "data": {
    "dietary_restrictions": ["vegetarian", "gluten_free"],
    "favorite_cuisines": ["Italian", "Indian"]
  }
}
```

**Status Codes:**

- `200 OK` - Preferences retrieved
- `401 Unauthorized` - Invalid token

---

### 11.2 Add Dietary Restriction

**Endpoint:** `POST /preferences/dietary`

**Description:** Add dietary restriction for user.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "dietary_restriction": "vegetarian"
}
```

**Valid Values:** `vegetarian`, `vegan`, `gluten_free`, `lactose_free`, `nut_free`, etc.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Dietary restriction added",
  "data": {
    "id": 5,
    "dietary_restriction": "vegetarian"
  }
}
```

**Status Codes:**

- `201 Created` - Restriction added
- `401 Unauthorized` - Invalid token

---

### 11.3 Add Favorite Cuisine

**Endpoint:** `POST /preferences/cuisine`

**Description:** Add favorite cuisine for user.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "favorite_cuisine": "Italian"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Favorite cuisine added",
  "data": {
    "id": 6,
    "favorite_cuisine": "Italian"
  }
}
```

**Status Codes:**

- `201 Created` - Cuisine added
- `401 Unauthorized` - Invalid token

---

### 11.4 Remove Dietary Restriction

**Endpoint:** `DELETE /preferences/dietary/{preference_id}`

**Description:** Remove dietary restriction.

**Path Parameters:**

```
preference_id = 5
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Dietary restriction removed"
}
```

**Status Codes:**

- `200 OK` - Restriction removed
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Preference not found

---

## 12. RECOMMENDATIONS ENDPOINTS

### 12.1 Get Recommendations

**Endpoint:** `GET /recommendations`

**Description:** Get personalized recommendations based on order history and preferences.

**Query Parameters:**

```
limit=10
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Recommendations retrieved",
  "data": {
    "recommendations": [
      {
        "id": 1,
        "restaurant_id": 1,
        "restaurant_name": "Pizza Palace",
        "reason": "You frequently order Italian food"
      },
      {
        "id": 3,
        "restaurant_id": 3,
        "restaurant_name": "Burger King",
        "reason": "Popular in your area"
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Recommendations retrieved
- `401 Unauthorized` - Invalid token

---

### 12.2 Get Cuisine-Based Recommendations

**Endpoint:** `GET /recommendations/cuisines`

**Description:** Get recommendations based on favorite cuisines.

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cuisine recommendations retrieved",
  "data": {
    "recommendations": [
      {
        "cuisine": "Italian",
        "restaurants": [
          {
            "id": 1,
            "name": "Pizza Palace"
          }
        ]
      }
    ]
  }
}
```

**Status Codes:**

- `200 OK` - Recommendations retrieved
- `401 Unauthorized` - Invalid token

---

## 13. FAVORITES ENDPOINTS

### 13.1 Add to Favorites

**Endpoint:** `POST /favorites/{restaurant_id}`

**Description:** Add restaurant to user's favorites.

**Path Parameters:**

```
restaurant_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Restaurant added to favorites",
  "data": {
    "id": 10,
    "restaurant_id": 1,
    "restaurant_name": "Pizza Palace"
  }
}
```

**Status Codes:**

- `201 Created` - Added to favorites
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Restaurant not found
- `409 Conflict` - Already in favorites

---

### 13.2 Get Favorites

**Endpoint:** `GET /favorites`

**Description:** Get all favorite restaurants for user.

**Query Parameters:**

```
page=1
page_size=20
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Favorites retrieved",
  "data": {
    "favorites": [
      {
        "id": 10,
        "restaurant_id": 1,
        "restaurant_name": "Pizza Palace",
        "cuisine_type": "Italian"
      }
    ],
    "total": 3
  }
}
```

**Status Codes:**

- `200 OK` - Favorites retrieved
- `401 Unauthorized` - Invalid token

---

### 13.3 Remove from Favorites

**Endpoint:** `DELETE /favorites/{restaurant_id}`

**Description:** Remove restaurant from favorites.

**Path Parameters:**

```
restaurant_id = 1
```

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurant removed from favorites"
}
```

**Status Codes:**

- `200 OK` - Removed from favorites
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Restaurant not found

---

## 14. ERROR RESPONSES

### 14.1 Standard Error Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "error_code": "ERROR_CODE_NAME",
  "status_code": 400,
  "details": {
    "field_name": ["error message 1", "error message 2"]
  }
}
```

### 14.2 Common HTTP Status Codes

| Code | Meaning               | Example                               |
| ---- | --------------------- | ------------------------------------- |
| 200  | OK                    | Request successful                    |
| 201  | Created               | Resource created                      |
| 400  | Bad Request           | Invalid input data                    |
| 401  | Unauthorized          | Invalid/missing token                 |
| 403  | Forbidden             | Insufficient permissions              |
| 404  | Not Found             | Resource not found                    |
| 409  | Conflict              | Duplicate email, already in favorites |
| 422  | Unprocessable Entity  | Validation error                      |
| 500  | Internal Server Error | Unexpected server error               |

---

## 15. PAGINATION

All list endpoints support pagination:

**Query Parameters:**

```
page=1 (default: 1, minimum: 1)
page_size=20 (default: 20, max: 100)
```

**Response Format:**

```json
{
  "success": true,
  "message": "...",
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "page_size": 20,
    "total_pages": 8
  }
}
```

---

## 16. RATE LIMITING

- **Limit:** 1000 requests per hour per IP
- **Header:** `X-RateLimit-Remaining`

---

## 17. SWAGGER/OPENAPI

Access Swagger UI at: `http://localhost:8000/docs`
Access ReDoc at: `http://localhost:8000/redoc`

Every endpoint includes:

- Summary
- Description
- Request/Response models
- Status codes
- Example values
