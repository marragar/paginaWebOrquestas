# CORRECCIÓN: quitado el comentario TODO del principio (el modelo ya está hecho).

# TODO (revisión frente a SPEC §3 y el frontend):
#   1. "tipo" (directo/playback) no está en el SPEC ni en el frontend: decisión abierta en SPEC §9.
#   2. El import de TYPE_CHECKING debe ser "from app.models.disponibilidad import ...", sin "backend.".

# CORRECCIÓN: imports agrupados (primero librería estándar, luego librerías externas)
import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from backend.app.models.disponibilidad import Disponibilidad


class TipoOrquesta(str, enum.Enum):
    DIRECTO = "orquesta_directo"  # Musicos en Directo
    PLAYBACK = "orquesta_playback"  # Sin Musicos en Directo


class Orquesta(Base):
    __tablename__ = "orquestas"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    nombre: Mapped[str] = mapped_column(String(255))
    tipo: Mapped[TipoOrquesta] = mapped_column(
        Enum(TipoOrquesta, name="tipo_orquesta", values_callable=lambda e: [m.value for m in e])
    )
    descripcion: Mapped[str | None] = mapped_column(Text)
    provincia: Mapped[str] = mapped_column(String(100))
    num_musicos: Mapped[int | None] = mapped_column()
    precio_base: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    telefono: Mapped[str] = mapped_column(String(20))
    verificada: Mapped[bool] = mapped_column(default=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())

    # TODO: relationship con disponibilidades (una orquesta tiene muchas), cuando exista el modelo:
    # passive_deletes: ver el comentario en Usuario.reservas
    disponibilidades: Mapped[list["Disponibilidad"]] = relationship(back_populates="orquesta", passive_deletes=True)
