from getpass import getpass

from app.db.database import SessionLocal
from app.models import User
from app.core.security import hash_password

db = SessionLocal()

try:
    admin = db.query(User).filter(
        User.email == "admin@justeat.com"
    ).first()

    if not admin:
        print("Admin account not found")
    else:
        password = getpass("Enter new admin password: ")
        confirm = getpass("Confirm new password: ")

        if len(password) < 12:
            print("Password must contain at least 12 characters")

        elif password != confirm:
            print("Passwords do not match")

        else:
            admin.password_hash = hash_password(password)
            db.commit()
            print("Admin password updated successfully!")

finally:
    db.close()