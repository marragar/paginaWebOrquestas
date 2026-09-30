import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from backend.app.models.reserva import Reserva


class TipoUsuario(str, enum.Enum):
    AYUNTAMIENTO = "ayuntamiento"
    JUNTA_VECINAL = "junta_vecinal"
    COMISION_FIESTAS = "comision_fiestas"
    PARTICULAR = "particular"


# TODO (revisión frente al frontend):
#   - El import de TYPE_CHECKING debe ser "from app.models.reserva import ...", sin "backend.".


class Usuario(Base):
    """Modelo de ejemplo (SPEC §3 usuarios). Úsalo como referencia para el resto."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    nombre: Mapped[str] = mapped_column(String(255))
    # values_callable hace que en la BD se guarde el valor ("junta_vecinal")
    # y no el nombre del miembro ("JUNTA_VECINAL")
    tipo: Mapped[TipoUsuario] = mapped_column(
        Enum(TipoUsuario, name="tipo_usuario", values_callable=lambda e: [m.value for m in e])
    )
    # Mapped[... | None] -> columna opcional (NULL permitido)
    cif: Mapped[str | None] = mapped_column(String(20))
    municipio: Mapped[str | None] = mapped_column(String(255))
    provincia: Mapped[str | None] = mapped_column(String(100))
    telefono: Mapped[str | None] = mapped_column(String(20))
    es_admin: Mapped[bool] = mapped_column(default=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())

    # TODO: relationship con reservas (un usuario tiene muchas reservas)
    # passive_deletes: al borrar, los hijos los borra el ON DELETE CASCADE de la BD (si no, el ORM
    # intenta poner a NULL su clave foránea y la BD lo rechaza)
    reservas: Mapped[list["Reserva"]] = relationship(back_populates="usuario", passive_deletes=True)
