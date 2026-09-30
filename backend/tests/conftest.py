import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from itertools import count
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.main import app
import app.models as models

from app.config import settings

from app.database import Base, get_db
from app.main import app

from app.core.security import TipoCuenta, create_access_token, hash_password
from app.models import Disponibilidad, Orquesta, TipoUsuario, Usuario, EstadoDisponibilidad, EstadoReserva, Reserva

from app.models.orquesta import TipoOrquesta
_numero = count(1)

# bcrypt es lento a propósito (~0,2 s por hash): la contraseña por defecto se hashea una sola vez
PASSWORD_TESTS = "secreto123"
_HASH_TESTS = hash_password(PASSWORD_TESTS)


def _hash(password):
    return _HASH_TESTS if password == PASSWORD_TESTS else hash_password(password)

URL_TESTS = settings.database_url.rsplit("/", 1)[0] + "/orquestas_test"

engine_test = create_engine(URL_TESTS)



@pytest.fixture(scope="session", autouse=True)
def tablas():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)
    
@pytest.fixture
def db():
    conexion = engine_test.connect()
    transaccion = conexion.begin()
    sesion = Session(bind=conexion, join_transaction_mode="create_savepoint")
    yield sesion
    sesion.close()
    transaccion.rollback()
    conexion.close()
    
@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()

    

@pytest.fixture
def crear_usuario(db):
    def _crear(es_admin=False, password="secreto123", **campos):
        usuario = Usuario(
            email=f"usuario{next(_numero)}@ejemplo.com",
            password_hash=_hash(password),
            nombre="Junta Vecinal de Prueba",
            tipo=TipoUsuario.JUNTA_VECINAL,
            es_admin=es_admin,
            **campos,              # para cambiar lo que quieras: crear_usuario(provincia="León")
        )
        db.add(usuario)
        db.commit()
        return usuario
    return _crear

    
@pytest.fixture
def crear_orquesta(db):
    def _crear(verificada=True,password="secreto123",**campos):
        orquesta = Orquesta(
            nombre=f"Orquesta de Prueba {next(_numero)}",
            password_hash=_hash(password),
            tipo=TipoOrquesta.DIRECTO,
            precio_base=Decimal("100.00"),
            email=f"orquesta{next(_numero)}@ejemplo.com",
            provincia="Madrid",
            telefono="123456789",
            verificada=verificada,
            **campos,              # para cambiar lo que quieras: crear_orquesta(provincia="León")   
        )
        db.add(orquesta)
        db.commit()
        return orquesta
    return _crear

@pytest.fixture
def crear_disponibilidad(db):
    def _crear(orquesta, fecha=date.today()+timedelta(days=30), estado=EstadoDisponibilidad.LIBRE, precio=Decimal("100.00"), **campos):
        disponibilidad = Disponibilidad(
            orquesta_id=orquesta.id,
            fecha=fecha,
            estado=estado,
            precio=precio,
            **campos,              # para cambiar lo que quieras: crear_disponibilidad(notas="Prueba")   
        )
        db.add(disponibilidad)
        db.commit()
        return disponibilidad
    return _crear

@pytest.fixture
def headers_de():
    def _headers(cuenta):
        tipo = TipoCuenta.ORQUESTA if isinstance(cuenta, Orquesta) else TipoCuenta.USUARIO
        return {"Authorization": f"Bearer {create_access_token(cuenta.id, tipo)}"}
    return _headers

@pytest.fixture
def crear_reserva(db):
    def _crear(usuario, disponibilidad, estado=EstadoReserva.PENDIENTE, **campos):
        reserva = Reserva(
            usuario_id=usuario.id,
            disponibilidad_id=disponibilidad.id,
            estado=estado,
            **campos,              # para cambiar lo que quieras: crear_reserva(u, d, lugar="Plaza Mayor")
        )
        db.add(reserva)
        db.commit()
        return reserva
    return _crear


# TODO: fixture de BD de pruebas (base de datos postgres separada, crear/borrar tablas
#       por test o usar transacciones con rollback) y override de get_db:
#       app.dependency_overrides[get_db] = ...
