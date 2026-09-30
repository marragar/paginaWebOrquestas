# TODO (revisión frente a SPEC §3):
#   - El import de TYPE_CHECKING debe ser "from app.models.orquesta import ...", sin "backend.".

import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from typing import TYPE_CHECKING



if TYPE_CHECKING:
    from backend.app.models.orquesta import Orquesta
    from backend.app.models.reserva import Reserva



class EstadoDisponibilidad(str, enum.Enum):
    LIBRE = "libre"
    RESERVADA = "reservada"
    BLOQUEADA = "bloqueada"
    # "Borrada" por la orquesta: la fila se conserva para que las reservas no pierdan su fecha
    # (borrado lógico, SPEC §4.9). No aparece en ningún listado.
    RETIRADA = "retirada"
    
    
class Disponibilidad(Base):
    __tablename__="disponibilidades"
    __table_args__ = (
        # Restricción única (orquesta_id, fecha)
        # Esto asegura que una orquesta no tenga dos disponibilidades para la misma fecha
        # y que no haya conflictos al reservar.
        UniqueConstraint("orquesta_id", "fecha", name="uix_orquesta_fecha"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    orquesta_id: Mapped[int] = mapped_column(ForeignKey("orquestas.id", ondelete="CASCADE"))
    fecha: Mapped[date] = mapped_column(Date)
    estado: Mapped[EstadoDisponibilidad] = mapped_column(
        Enum(EstadoDisponibilidad, name="estado_disponibilidad", values_callable=lambda e: [m.value for m in e]),
        default=EstadoDisponibilidad.LIBRE
    )
    precio: Mapped[Decimal] = mapped_column(Numeric(10,2))
    notas: Mapped[str | None] = mapped_column(String(255))
    orquesta: Mapped["Orquesta"] = relationship("Orquesta", back_populates="disponibilidades")
    reservas: Mapped[list["Reserva"]] = relationship(back_populates="disponibilidad", passive_deletes=True)