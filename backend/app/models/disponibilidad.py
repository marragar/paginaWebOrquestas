# TODO: modelo "Disponibilidad" (tabla "disponibilidades") y enum EstadoDisponibilidad — ver SPEC §3.
# Recuerda la restricción única (orquesta_id, fecha) -> UniqueConstraint en __table_args__.

import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from backend.app.models.orquesta import Orquesta


class EstadoDisponibilidad(str, enum.Enum):
    DISPONIBLE = "disponible"
    RESERVADO = "reservado"
    NO_DISPONIBLE = "no_disponible"
    
    
class Disponibilidad(Base):
    __tablename__="disponibilidades"
    __table_args__ = (
        # Restricción única (orquesta_id, fecha)
        # Esto asegura que una orquesta no tenga dos disponibilidades para la misma fecha
        # y que no haya conflictos al reservar.
        UniqueConstraint("orquesta", "fecha", name="uix_orquesta_fecha"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    orquesta_id: Mapped[int] = mapped_column(ForeignKey("orquestas.id", ondelete="CASCADE"))
    fecha: Mapped[datetime] = mapped_column(Date)
    estado: Mapped[EstadoDisponibilidad] = mapped_column(
        Enum(EstadoDisponibilidad, name="estado_disponibilidad", values_callable=lambda e: [m.value for m in e]),
        default=EstadoDisponibilidad.DISPONIBLE
    ),
    precio: Mapped[Decimal] = mapped_column(Numeric(10,2))
    notas: Mapped[str | None] = mapped_column(String(255))
    orquesta: Mapped["Orquesta"] = relationship("Orquesta", back_populates="disponibilidades")