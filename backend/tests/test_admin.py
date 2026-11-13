from app.core.security import hash_password
from app.models.user import User


def test_admin_can_login_and_view_dashboard(client, db, override_get_db):
    admin = User(
        email="admin@test.com",
        password_hash=hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="User",
        phone="1111111111",
        role="ADMIN",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin@test.com", "password": "AdminPass123!"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["data"]["access_token"]

    stats_response = client.get(
        "/api/admin/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert stats_response.status_code == 200
    assert stats_response.json()["success"] is True


def test_pending_owner_is_blocked_from_login_until_approved(client, db, override_get_db):
    owner = User(
        email="owner.pending@test.com",
        password_hash=hash_password("Password123!"),
        first_name="Pending",
        last_name="Owner",
        phone="2222222222",
        role="OWNER",
        is_active=False,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    response = client.post(
        "/api/auth/login",
        data={"username": "owner.pending@test.com", "password": "Password123!"},
    )

    assert response.status_code == 403
    assert "approval" in response.json()["detail"].lower()


def test_admin_can_approve_owner_application(client, db, override_get_db):
    admin = User(
        email="admin2@test.com",
        password_hash=hash_password("AdminPass123!"),
        first_name="Admin",
        last_name="Two",
        phone="3333333333",
        role="ADMIN",
        is_active=True,
    )
    db.add(admin)

    owner = User(
        email="owner.approve@test.com",
        password_hash=hash_password("Password123!"),
        first_name="Approve",
        last_name="Owner",
        phone="4444444444",
        role="OWNER",
        is_active=False,
    )
    db.add(owner)
    db.commit()
    db.refresh(admin)
    db.refresh(owner)

    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin2@test.com", "password": "AdminPass123!"},
    )
    token = login_response.json()["data"]["access_token"]

    response = client.patch(
        f"/api/admin/owners/{owner.id}/approve",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True

    db.refresh(owner)
    assert owner.is_active is True
