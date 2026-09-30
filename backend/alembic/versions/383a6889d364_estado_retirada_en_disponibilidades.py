"""estado retirada en disponibilidades

Revision ID: 383a6889d364
Revises: 257765868140
Create Date: 2026-09-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = '383a6889d364'
down_revision: Union[str, None] = '257765868140'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Borrado lógico de fechas (SPEC §4.9). A mano: autogenerate no detecta cambios en enums.
    op.execute("ALTER TYPE estado_disponibilidad ADD VALUE IF NOT EXISTS 'retirada'")


def downgrade() -> None:
    # Un valor no se puede quitar de un enum en PostgreSQL sin recrear el tipo: se queda.
    pass
