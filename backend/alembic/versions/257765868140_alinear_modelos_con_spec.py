"""alinear modelos con SPEC

Revision ID: 257765868140
Revises: 8bb80d9ea6c1
Create Date: 2026-09-29 21:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '257765868140'
down_revision: Union[str, None] = '8bb80d9ea6c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # usuarios.telefono: 9 -> 20 caracteres (los teléfonos se guardan con espacios)
    op.alter_column('usuarios', 'telefono',
               existing_type=sa.String(length=9),
               type_=sa.String(length=20),
               existing_nullable=True)

    # reservas: "notas" se sustituye por "lugar" y "mensaje"; hora_inicio pasa a opcional
    op.drop_column('reservas', 'notas')
    op.add_column('reservas', sa.Column('lugar', sa.String(length=255), nullable=True))
    op.add_column('reservas', sa.Column('mensaje', sa.Text(), nullable=True))
    op.alter_column('reservas', 'hora_inicio',
               existing_type=sa.Time(),
               nullable=True)

    # Enums: autogenerate no detecta estos cambios, van a mano.
    # RENAME VALUE conserva las filas existentes con el valor nuevo.
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'disponible' TO 'libre'")
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'reservado' TO 'reservada'")
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'no_disponible' TO 'bloqueada'")
    op.execute("ALTER TYPE estado_reserva ADD VALUE IF NOT EXISTS 'cancelada'")


def downgrade() -> None:
    # 'cancelada' no se puede quitar de un enum en PostgreSQL sin recrear el tipo: se queda.
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'bloqueada' TO 'no_disponible'")
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'reservada' TO 'reservado'")
    op.execute("ALTER TYPE estado_disponibilidad RENAME VALUE 'libre' TO 'disponible'")

    # Falla si hay reservas sin hora_inicio: habría que rellenarlas antes.
    op.alter_column('reservas', 'hora_inicio',
               existing_type=sa.Time(),
               nullable=False)
    op.drop_column('reservas', 'mensaje')
    op.drop_column('reservas', 'lugar')
    op.add_column('reservas', sa.Column('notas', sa.String(length=255), nullable=True))

    op.alter_column('usuarios', 'telefono',
               existing_type=sa.String(length=20),
               type_=sa.String(length=9),
               existing_nullable=True)
