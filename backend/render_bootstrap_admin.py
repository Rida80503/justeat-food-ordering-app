
from app.core.config import settings
from app.db.database import SessionLocal
from app.models.user import User
from seed.data import ensure_admin_user


def main():
    email = (settings.ADMIN_EMAIL or "").strip().lower()

    if not email or not settings.ADMIN_PASSWORD:
        raise RuntimeError("ADMIN_EMAIL or ADMIN_PASSWORD is missing")

    db = SessionLocal()

    try:
        existing = db.query(User).filter(User.email == email).first()

        if existing:
            print("Admin email already exists. No changes made.")
            print("Role:", existing.role)
            print("Active:", existing.is_active)
            print("Approval:", existing.approval_status)
            return

        ensure_admin_user(db)

        admin = db.query(User).filter(User.email == email).first()

        if not admin:
            raise RuntimeError("Admin creation failed")

        print("Admin created successfully.")
        print("Role:", admin.role)
        print("Active:", admin.is_active)
        print("Approval:", admin.approval_status)

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
