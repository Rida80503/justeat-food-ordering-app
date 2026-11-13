"""Make restaurant_id nullable in cart

Revision ID: 0de89c4017d4
Revises: c1f1d8a0b6b3
Create Date: 2026-07-21 14:53:12.413126

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0de89c4017d4'
down_revision: Union[str, None] = 'c1f1d8a0b6b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'sqlite':
        with op.batch_alter_table('cart', schema=None) as batch_op:
            batch_op.alter_column('restaurant_id', existing_type=sa.INTEGER(), nullable=True)
        op.drop_index('ix_menus_cuisine', table_name='menus')
        return

    op.alter_column('cart', 'restaurant_id', existing_type=sa.INTEGER(), nullable=True)
    op.drop_index('ix_menus_cuisine', table_name='menus')


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'sqlite':
        with op.batch_alter_table('cart', schema=None) as batch_op:
            batch_op.alter_column('restaurant_id', existing_type=sa.INTEGER(), nullable=False)
        op.create_index('ix_menus_cuisine', 'menus', ['cuisine'], unique=False)
        return

    op.create_index('ix_menus_cuisine', 'menus', ['cuisine'], unique=False)
    op.alter_column('cart', 'restaurant_id', existing_type=sa.INTEGER(), nullable=False)
