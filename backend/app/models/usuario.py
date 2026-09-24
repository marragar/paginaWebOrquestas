import enum
from datetime import datetime

from sqlalchemy import Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Rol(str, enum.Enum):
    ORQUESTA = "ORQUESTA"
    USUARIO = "USUARIO"
    ADMIN = "ADMIN"


class Usuario(Base):
    """Modelo de ejemplo (SPEC §3 usuario). Úsalo como referencia para el resto."""

    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[Rol] = mapped_column(Enum(Rol, name="rol"))
    activo: Mapped[bool] = mapped_column(default=True)
    creado_en: Mapped[datetime] = mapped_column(server_default=func.now())

    # TODO: relationships 1:1 con perfil_orquesta / perfil_contratante
