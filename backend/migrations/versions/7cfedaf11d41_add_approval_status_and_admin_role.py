"""Add approval status and admin role support.

Revision ID: 7cfedaf11d41
Revises: 0de89c4017d4
Create Date: 2026-11-13 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7cfedaf11d41"
down_revision: Union[str, None] = "0de89c4017d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _populate_approval_status() -> None:
    """Backfill approval_status while preserving all existing user rows and data."""
    op.execute(
        sa.text(
            """
            UPDATE users
            SET approval_status = CASE
                WHEN role = 'ADMIN' THEN 'APPROVED'
                WHEN role = 'CUSTOMER' THEN 'APPROVED'
                WHEN role = 'OWNER' AND is_active = TRUE THEN 'APPROVED'
                WHEN role = 'OWNER' AND is_active = FALSE THEN 'PENDING'
                ELSE 'APPROVED'
            END
            WHERE approval_status IS NULL OR approval_status = ''
            """
        )
    )


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}

    if "approval_status" not in columns:
        if bind.dialect.name == "sqlite":
            with op.batch_alter_table("users", schema=None) as batch_op:
                batch_op.add_column(
                    sa.Column("approval_status", sa.String(length=50), nullable=True)
                )
        else:
            op.add_column(
                "users",
                sa.Column("approval_status", sa.String(length=50), nullable=True),
            )

    _populate_approval_status()

    if bind.dialect.name == "postgresql":
        op.execute(
            sa.text(
                "ALTER TABLE users ALTER COLUMN approval_status SET DEFAULT 'APPROVED'"
            )
        )
        op.execute(
            sa.text(
                "ALTER TABLE users ALTER COLUMN approval_status SET NOT NULL"
            )
        )

        # Preserve existing CUSTOMER and OWNER roles, while allowing ADMIN.
        role_constraint_def = bind.execute(
            sa.text(
                """
                SELECT pg_get_constraintdef(oid)
                FROM pg_constraint
                WHERE conrelid = 'users'::regclass
                  AND conname = 'valid_user_role'
                """
            )
        ).scalar()

        if role_constraint_def is None:
            op.execute(
                sa.text(
                    "ALTER TABLE users ADD CONSTRAINT valid_user_role CHECK (role IN ('CUSTOMER', 'OWNER', 'ADMIN'))"
                )
            )
        elif "ADMIN" not in role_constraint_def.upper():
            op.execute(sa.text("ALTER TABLE users DROP CONSTRAINT valid_user_role"))
            op.execute(
                sa.text(
                    "ALTER TABLE users ADD CONSTRAINT valid_user_role CHECK (role IN ('CUSTOMER', 'OWNER', 'ADMIN'))"
                )
            )

        approval_constraint_exists = bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conrelid = 'users'::regclass
                      AND conname = 'valid_approval_status'
                )
                """
            )
        ).scalar()
        if not approval_constraint_exists:
            op.execute(
                sa.text(
                    "ALTER TABLE users ADD CONSTRAINT valid_approval_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'))"
                )
            )

    index_names = {index["name"] for index in inspector.get_indexes("users")}
    if "ix_users_approval_status" not in index_names:
        op.create_index(
            op.f("ix_users_approval_status"),
            "users",
            ["approval_status"],
            unique=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("users")}

    if "approval_status" in columns:
        admin_records = bind.execute(
            sa.text("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'")
        ).scalar()
        if admin_records:
            raise RuntimeError(
                "Cannot downgrade migration 7cfedaf11d41 while ADMIN users still exist. "
                "Convert or remove ADMIN records before downgrading, or migrate them to CUSTOMER/OWNER first."
            )

    index_names = {index["name"] for index in inspector.get_indexes("users")}
    if "ix_users_approval_status" in index_names:
        op.drop_index(op.f("ix_users_approval_status"), table_name="users")

    if bind.dialect.name == "sqlite":
        with op.batch_alter_table("users", schema=None) as batch_op:
            batch_op.drop_column("approval_status")
        return

    if bind.dialect.name == "postgresql":
        approval_constraint_exists = bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conrelid = 'users'::regclass
                      AND conname = 'valid_approval_status'
                )
                """
            )
        ).scalar()
        if approval_constraint_exists:
            op.execute(sa.text("ALTER TABLE users DROP CONSTRAINT valid_approval_status"))

        role_constraint_def = bind.execute(
            sa.text(
                """
                SELECT pg_get_constraintdef(oid)
                FROM pg_constraint
                WHERE conrelid = 'users'::regclass
                  AND conname = 'valid_user_role'
                """
            )
        ).scalar()
        if role_constraint_def is not None:
            op.execute(sa.text("ALTER TABLE users DROP CONSTRAINT valid_user_role"))
        op.execute(
            sa.text(
                "ALTER TABLE users ADD CONSTRAINT valid_user_role CHECK (role IN ('CUSTOMER', 'OWNER'))"
            )
        )

    op.drop_column("users", "approval_status")
