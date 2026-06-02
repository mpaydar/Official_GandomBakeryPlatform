"""bakery daily capacity

Revision ID: f8a2c1d4e5b6
Revises: 3a7809baad5f
Create Date: 2026-05-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8a2c1d4e5b6"
down_revision: Union[str, None] = "3a7809baad5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "bakery_daily_capacity",
        sa.Column("business_date", sa.Date(), nullable=False),
        sa.Column("max_loaves", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("business_date"),
    )


def downgrade() -> None:
    op.drop_table("bakery_daily_capacity")
