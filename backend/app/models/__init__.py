# Importa aquí todos los modelos para que Alembic los detecte en el autogenerate.
from app.models.usuario import TipoUsuario, Usuario  # noqa: F401

from app.models.orquesta import Orquesta
from app.models.disponibilidad import Disponibilidad, EstadoDisponibilidad
from app.models.reserva import EstadoReserva, Reserva
