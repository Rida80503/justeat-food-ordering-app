"""add_richer_customer_preferences

Revision ID: c1f1d8a0b6b3
Revises: ced8e7893f56
Create Date: 2026-07-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f1d8a0b6b3'
down_revision: Union[str, None] = 'ced8e7893f56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('customer_preferences', sa.Column('spice_level', sa.String(length=50), nullable=True))
    op.add_column('customer_preferences', sa.Column('veg_non_veg', sa.String(length=50), nullable=True))
    op.add_column('customer_preferences', sa.Column('budget_range', sa.String(length=50), nullable=True))
    op.add_column('customer_preferences', sa.Column('delivery_preference', sa.String(length=50), nullable=True))
    op.add_column('customer_preferences', sa.Column('dietary_preference', sa.String(length=100), nullable=True))

    op.create_index(op.f('ix_customer_preferences_budget_range'), 'customer_preferences', ['budget_range'], unique=False)
    op.create_index(op.f('ix_customer_preferences_delivery_preference'), 'customer_preferences', ['delivery_preference'], unique=False)
    op.create_index(op.f('ix_customer_preferences_dietary_preference'), 'customer_preferences', ['dietary_preference'], unique=False)
    op.create_index(op.f('ix_customer_preferences_spice_level'), 'customer_preferences', ['spice_level'], unique=False)
    op.create_index(op.f('ix_customer_preferences_veg_non_veg'), 'customer_preferences', ['veg_non_veg'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_customer_preferences_veg_non_veg'), table_name='customer_preferences')
    op.drop_index(op.f('ix_customer_preferences_spice_level'), table_name='customer_preferences')
    op.drop_index(op.f('ix_customer_preferences_dietary_preference'), table_name='customer_preferences')
    op.drop_index(op.f('ix_customer_preferences_delivery_preference'), table_name='customer_preferences')
    op.drop_index(op.f('ix_customer_preferences_budget_range'), table_name='customer_preferences')
    op.drop_column('customer_preferences', 'dietary_preference')
    op.drop_column('customer_preferences', 'delivery_preference')
    op.drop_column('customer_preferences', 'budget_range')
    op.drop_column('customer_preferences', 'veg_non_veg')
    op.drop_column('customer_preferences', 'spice_level')
