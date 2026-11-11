# Backend Endpoint Connectivity Checklist

## Status legend
- ✅ Connected: the route is now reachable from the frontend through the app UI or existing pages
- ❌ Not Used: the route is defined in the backend but is not currently wired to the frontend

## Authentication
- POST /api/auth/login — ✅ Connected
- POST /api/auth/token — ❌ Not Used
- GET /api/auth/logout — ❌ Not Used
- POST /api/auth/password-reset-request — ✅ Connected
- POST /api/auth/password-reset-complete — ✅ Connected
- GET /api/auth/me — ❌ Not Used

## Users
- GET /api/users/profile — ✅ Connected
- PUT /api/users/profile — ✅ Connected
- POST /api/users/password-change — ✅ Connected
- DELETE /api/users/account — ❌ Not Used

## Restaurants
- GET /api/restaurants — ✅ Connected
- POST /api/restaurants — ✅ Connected
- GET /api/restaurants/search/city/{city} — ❌ Not Used
- GET /api/restaurants/search/cuisine/{cuisine} — ❌ Not Used
- GET /api/restaurants/{restaurant_id} — ✅ Connected
- GET /api/restaurants/my/restaurants — ✅ Connected
- PUT /api/restaurants/{restaurant_id} — ✅ Connected

## Menus
- POST /api/menus — ✅ Connected
- GET /api/menus/restaurant/{restaurant_id} — ✅ Connected
- GET /api/menus/{menu_id} — ✅ Connected
- GET /api/menus/restaurant/{restaurant_id}/cuisine/{cuisine} — ❌ Not Used
- PUT /api/menus/{menu_id} — ✅ Connected
- PATCH /api/menus/{menu_id}/mark-special — ❌ Not Used
- PATCH /api/menus/{menu_id}/mark-deal — ❌ Not Used
- DELETE /api/menus/{menu_id} — ❌ Not Used

## Cart
- GET /api/cart — ✅ Connected
- POST /api/cart/items — ✅ Connected
- PUT /api/cart/items/{menu_id} — ✅ Connected
- DELETE /api/cart/items/{menu_id} — ✅ Connected
- DELETE /api/cart/clear — ❌ Not Used
- POST /api/cart/checkout — ✅ Connected

## Orders
- GET /api/orders — ✅ Connected
- GET /api/orders/history — ❌ Not Used
- GET /api/orders/{order_id} — ❌ Not Used
- PUT /api/orders/{order_id}/status — ✅ Connected
- GET /api/orders/restaurant/{restaurant_id} — ✅ Connected
- POST /api/orders/{order_id}/cancel — ❌ Not Used
- GET /api/orders/status/pending — ✅ Connected

## Preferences
- GET /api/preferences — ✅ Connected
- POST /api/preferences/dietary — ✅ Connected
- POST /api/preferences/cuisine — ✅ Connected
- DELETE /api/preferences/dietary/{preference_id} — ✅ Connected

## Favorites
- POST /api/favorites/{restaurant_id} — ✅ Connected
- GET /api/favorites — ✅ Connected
- DELETE /api/favorites/{restaurant_id} — ✅ Connected

## Recommendations
- GET /api/recommendations — ✅ Connected
- GET /api/recommendations/cuisines — ✅ Connected
