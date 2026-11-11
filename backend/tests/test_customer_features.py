
"""
Tests for customer preference, favorites, recommendation, and restaurant search endpoints.
"""


class TestCustomerFeatures:
    def test_restaurant_search_endpoint(self, client, test_restaurant):
        response = client.get("/api/restaurants", params={"search": "Test"})

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["total"] >= 1

    def test_preferences_flow(self, client, customer_token):
        add = client.post(
            "/api/preferences/dietary",
            json={"dietary_restriction": "vegetarian"},
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert add.status_code == 201

        get_pref = client.get(
            "/api/preferences",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert get_pref.status_code == 200

        dietary_restrictions = get_pref.json()["data"]["dietary_restrictions"]

        assert any(
            item.get("value") == "vegetarian"
            for item in dietary_restrictions
        )

    def test_favorites_flow(self, client, customer_token, test_restaurant):
        add = client.post(
            f"/api/favorites/{test_restaurant.id}",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert add.status_code == 201

        get_favorites = client.get(
            "/api/favorites",
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert get_favorites.status_code == 200
        assert get_favorites.json()["data"]["total"] == 1

    def test_recommendations_endpoint(self, client, customer_token, test_restaurant):
        response = client.get(
            "/api/recommendations",
            headers={"Authorization": f"Bearer {customer_token}"},
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["success"] is True
        assert "recommendations" in payload["data"]
