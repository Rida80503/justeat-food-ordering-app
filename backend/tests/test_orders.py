"""
Unit tests for order and cart endpoints.

WHY: Verify order and cart operations work correctly.
Test checkout flow from cart to order.
"""

import pytest


class TestCart:
    """Shopping cart endpoint tests."""
    
    def test_add_to_cart_success(self, client, customer_token, test_menu_item, test_restaurant):
        """Test adding item to cart."""
        response = client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 2
            }
        )
        
        assert response.status_code == 201
        assert response.json()["success"] == True
        assert response.json()["data"]["total_items"] == 2
        assert response.json()["data"]["total_price"] == 2 * float(test_menu_item.price)
    
    def test_get_cart(self, client, customer_token, test_menu_item, test_restaurant):
        """Test retrieving shopping cart."""
        # Add item first
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 1
            }
        )
        
        # Get cart
        response = client.get(
            "/api/cart",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert response.json()["data"]["total_items"] == 1
    
    def test_update_cart_item(
        self, client, customer_token, test_menu_item, test_restaurant
    ):
        """Test updating cart item quantity."""
        # Add to cart
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 1
            }
        )
        
        # Update quantity
        response = client.put(
            f"/api/cart/items/{test_menu_item.id}",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={"quantity": 3}
        )
        
        assert response.status_code == 200
        assert response.json()["data"]["total_items"] == 3
    
    def test_remove_from_cart(
        self, client, customer_token, test_menu_item, test_restaurant
    ):
        """Test removing item from cart."""
        # Add item
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 2
            }
        )
        
        # Remove item
        response = client.delete(
            f"/api/cart/items/{test_menu_item.id}",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["data"]["total_items"] == 0
    
    def test_clear_cart(self, client, customer_token, test_menu_item, test_restaurant):
        """Test clearing entire cart."""
        # Add items
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 2
            }
        )
        
        # Clear cart
        response = client.delete(
            "/api/cart",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["data"]["total_items"] == 0


class TestOrders:
    """Order endpoint tests."""
    
    def test_checkout_from_cart(
        self, client, customer_token, test_menu_item, test_restaurant
    ):
        """Test converting cart to order."""
        # Add items to cart
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 2
            }
        )
        
        # Checkout
        response = client.post(
            "/api/cart/checkout",
            headers={"Authorization": f"Bearer {customer_token}"},
            params={
                "restaurant_id": test_restaurant.id,
                "special_instructions": "Extra sauce please"
            }
        )
        
        assert response.status_code == 201
        assert response.json()["success"] == True
        assert "order_id" in response.json()["data"]
        assert response.json()["data"]["status"] == "PENDING"
    
    def test_get_customer_orders(self, client, customer_token, db, test_customer):
        """Test retrieving customer orders."""
        response = client.get(
            "/api/orders",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert isinstance(response.json()["data"], list)
    
    def test_get_order_details(
        self, client, customer_token, test_menu_item, test_restaurant
    ):
        """Test getting order details."""
        # Add item so checkout can create an order
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 1,
            }
        )

        # Create order
        checkout_response = client.post(
            "/api/cart/checkout",
            headers={"Authorization": f"Bearer {customer_token}"},
            params={"restaurant_id": test_restaurant.id}
        )
        order_id = checkout_response.json()["data"]["order_id"]
        
        # Get order details
        response = client.get(
            f"/api/orders/{order_id}",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["success"] == True
    
    def test_update_order_status(
        self, client, owner_token, customer_token,
        test_menu_item, test_restaurant
    ):
        """Test owner updating order status."""
        # Add item so checkout can create an order
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 1,
            }
        )

        # Create order as customer
        checkout_response = client.post(
            "/api/cart/checkout",
            headers={"Authorization": f"Bearer {customer_token}"},
            params={"restaurant_id": test_restaurant.id}
        )
        order_id = checkout_response.json()["data"]["order_id"]
        
        # Update status as owner
        response = client.put(
            f"/api/orders/{order_id}/status",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"status": "CONFIRMED"}
        )
        
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "CONFIRMED"
    
    def test_cancel_order(
        self, client, customer_token, test_menu_item, test_restaurant
    ):
        """Test customer canceling pending order."""
        # Add item so checkout can create an order
        client.post(
            "/api/cart/items",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "menu_id": test_menu_item.id,
                "restaurant_id": test_restaurant.id,
                "quantity": 1,
            }
        )

        # Create order
        checkout_response = client.post(
            "/api/cart/checkout",
            headers={"Authorization": f"Bearer {customer_token}"},
            params={"restaurant_id": test_restaurant.id}
        )
        order_id = checkout_response.json()["data"]["order_id"]
        
        # Cancel order
        response = client.post(
            f"/api/orders/{order_id}/cancel",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "CANCELLED"
