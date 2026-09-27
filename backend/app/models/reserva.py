# TODO: modelo "Reserva" (tabla "reservas") y enum EstadoReserva — ver SPEC §3.
# Regla §4.5: como mucho una reserva aceptada por disponibilidad, garantizado en BD.
# Pista: índice único parcial sobre disponibilidad_id WHERE estado = 'aceptada'
#        (Index(..., unique=True, postgresql_where=...)).

import enum
from datetime import datetime, time

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Time, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from backend.app.models.disponibilidad import Disponibilidad
from backend.app.models.usuario import Usuario


class EstadoReserva(str, enum.Enum):
    PENDIENTE = "pendiente"
    ACEPTADA = "aceptada"
    RECHAZADA = "rechazada"


class Reserva(Base):
    __tablename__ = "reservas"
    __table_args__ = (
        Index(
            "uq_reserva_aceptada_por_disponibilidad",
            "disponibilidad_id",
            unique=True,
            postgresql_where=text("estado = 'aceptada'"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    disponibilidad_id: Mapped[int] = mapped_column(
        ForeignKey("disponibilidades.id", ondelete="CASCADE")
    )
    estado: Mapped[EstadoReserva] = mapped_column(
        Enum(
            EstadoReserva,
            name="estado_reserva",
            values_callable=lambda e: [m.value for m in e],
        ),
        default=EstadoReserva.PENDIENTE,
    )
    hora_inicio: Mapped[time] = mapped_column(Time)
    notas: Mapped[str | None] = mapped_column(String(255))
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    usuario: Mapped["Usuario"] = relationship(back_populates="reservas")
    disponibilidad: Mapped["Disponibilidad"] = relationship(back_populates="reservas")