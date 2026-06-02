"""upgrading  schema sync

Revision ID: 282ba3e603cc
Revises: d59865d3a6bd
Create Date: 2026-05-05 12:07:25.409820

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '282ba3e603cc'
down_revision: Union[str, None] = 'd59865d3a6bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    op.alter_column(
        "users",
        "id",
        existing_type=postgresql.UUID(as_uuid=True),
        server_default=sa.text("gen_random_uuid()"),
        existing_nullable=False,
    )
    op.alter_column(
    "users",
    "created_at",
    server_default=sa.text("now()"),
    existing_nullable=False,
)
    # ### end Alembic commands ###


def downgrade():
    op.alter_column(
        "users",
        "id",
        existing_type=postgresql.UUID(as_uuid=True),
        existing_nullable=False,
    )
    op.alter_column(
        "users",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=False),
        existing_nullable=False,
    )


    # ### end Alembic commands ###
