"""upgrading  schema sync

Revision ID: 7e0cc2afcad4
Revises: 97a8b18b64f2
Create Date: 2026-05-06 13:35:50.897773

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e0cc2afcad4'
down_revision: Union[str, None] = '97a8b18b64f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "bread_order" not in inspector.get_table_names():
        op.create_table(
            "bread_order",
            sa.Column(
                "product_id",
                sa.UUID(),
                server_default=sa.text("gen_random_uuid()"),
                nullable=False,
            ),
            sa.Column("customer_name", sa.String(), nullable=True),
            sa.Column("bread_type", sa.String(), nullable=True),
            sa.Column("base_price", sa.Float(), nullable=True),
            sa.Column("total_price", sa.Float(), nullable=True),
            sa.Column("unit", sa.String(), nullable=True),
            sa.Column("phone_number", sa.String(), nullable=True),
            sa.Column("order_time", sa.TIMESTAMP(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("product_id"),
        )

    op.execute(
        "ALTER TABLE bread_order ALTER COLUMN product_id SET DEFAULT gen_random_uuid()"
    )
    index_names = {index["name"] for index in inspector.get_indexes("bread_order")}
    target_index = op.f("ix_bread_order_product_id")
    if target_index not in index_names:
        op.create_index(target_index, "bread_order", ["product_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "bread_order" in inspector.get_table_names():
        index_names = {index["name"] for index in inspector.get_indexes("bread_order")}
        target_index = op.f("ix_bread_order_product_id")
        if target_index in index_names:
            op.drop_index(target_index, table_name="bread_order")
        op.drop_table("bread_order")
