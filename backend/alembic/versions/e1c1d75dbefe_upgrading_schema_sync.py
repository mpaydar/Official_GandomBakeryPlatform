"""upgrading  schema sync

Revision ID: e1c1d75dbefe
Revises: 7b5170611681
Create Date: 2026-05-05 13:17:50.338205

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = 'e1c1d75dbefe'
down_revision: Union[str, None] = '7b5170611681'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No-op: previous autogenerate tried to make PK column nullable, which is invalid.
    pass


def downgrade() -> None:
    # No-op to mirror upgrade.
    pass
