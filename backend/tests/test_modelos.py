"""Tests de los modelos: que la BD haga cumplir lo que dice SPEC §3 y §4.

No usan la API (aún no hay endpoints): comprueban restricciones, valores por defecto, enums y
relaciones directamente contra la BD de tests.
"""
from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.models import (
    Disponibilidad,
    EstadoDisponibilidad,
    EstadoReserva,
    Orquesta,
    Reserva,
    TipoUsuario,
    Usuario,
)
from app.models.orquesta import TipoOrquesta


def assert_rechazado(db, objeto):
    """La BD debe rechazar el objeto al guardarlo."""
    db.add(objeto)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def nueva_orquesta(sin=None, **cambios):
    """Orquesta sin guardar; `sin` quita un campo y `cambios` sustituye valores."""
    datos = dict(email="nueva@ejemplo.com", password_hash="x", nombre="Orquesta", tipo=TipoOrquesta.DIRECTO,
                 provincia="León", telefono="987 123 456")
    datos.update(cambios)
    if sin:
        datos.pop(sin)
    return Orquesta(**datos)


# --- Valores por defecto (SPEC §3) ---

def test_usuario_nuevo_no_es_admin_y_tiene_fecha_de_alta_con_zona_horaria(db):
    usuario = Usuario(email="u@ejemplo.com", password_hash="x", nombre="U", tipo=TipoUsuario.PARTICULAR)
    db.add(usuario)
    db.commit()
    assert usuario.es_admin is False
    assert usuario.creado_en.tzinfo is not None


def test_orquesta_nueva_no_esta_verificada(db):
    orquesta = nueva_orquesta()
    db.add(orquesta)
    db.commit()
    assert orquesta.verificada is False
    assert orquesta.creado_en.tzinfo is not None


def test_disponibilidad_nueva_esta_libre(db, crear_orquesta):
    fecha = Disponibilidad(orquesta_id=crear_orquesta().id, fecha=date.today() + timedelta(days=30),
                           precio=Decimal("5000"))
    db.add(fecha)
    db.commit()
    assert fecha.estado == EstadoDisponibilidad.LIBRE


def test_reserva_nueva_esta_pendiente_con_campos_opcionales_vacios(db, crear_usuario, crear_orquesta,
                                                                   crear_disponibilidad):
    reserva = Reserva(usuario_id=crear_usuario().id,
                      disponibilidad_id=crear_disponibilidad(crear_orquesta()).id)
    db.add(reserva)
    db.commit()
    assert reserva.estado == EstadoReserva.PENDIENTE
    assert reserva.lugar is None and reserva.hora_inicio is None and reserva.mensaje is None


# --- Enums: en la BD se guarda el valor, que es lo que devuelve la API (SPEC §5.1) ---

def test_enums_se_guardan_por_su_valor(db, crear_usuario, crear_orquesta, crear_disponibilidad, crear_reserva):
    usuario = crear_usuario()
    fecha = crear_disponibilidad(crear_orquesta())
    reserva = crear_reserva(usuario, fecha)
    valor = lambda sql, id_: db.execute(text(sql), {"id": id_}).scalar_one()
    assert valor("SELECT tipo FROM usuarios WHERE id = :id", usuario.id) == "junta_vecinal"
    assert valor("SELECT estado FROM disponibilidades WHERE id = :id", fecha.id) == "libre"
    assert valor("SELECT estado FROM reservas WHERE id = :id", reserva.id) == "pendiente"


@pytest.mark.parametrize("estado", list(EstadoDisponibilidad))
def test_todos_los_estados_de_disponibilidad_existen_en_la_bd(crear_orquesta, crear_disponibilidad, estado):
    assert crear_disponibilidad(crear_orquesta(), estado=estado).estado == estado


@pytest.mark.parametrize("estado", list(EstadoReserva))
def test_todos_los_estados_de_reserva_existen_en_la_bd(crear_usuario, crear_orquesta, crear_disponibilidad,
                                                       crear_reserva, estado):
    fecha = crear_disponibilidad(crear_orquesta())
    assert crear_reserva(crear_usuario(), fecha, estado=estado).estado == estado


# --- Campos obligatorios (SPEC §3, con las decisiones de MEMORY: precio, provincia y teléfono) ---

@pytest.mark.parametrize("campo", ["email", "nombre", "tipo", "provincia", "telefono"])
def test_orquesta_sin_campo_obligatorio_se_rechaza(db, campo):
    assert_rechazado(db, nueva_orquesta(sin=campo))


def test_disponibilidad_sin_precio_se_rechaza(db, crear_orquesta):
    assert_rechazado(db, Disponibilidad(orquesta_id=crear_orquesta().id, fecha=date.today() + timedelta(days=30)))


# --- Unicidad ---

def test_email_repetido_entre_usuarios_se_rechaza(db, crear_usuario):
    usuario = crear_usuario()
    assert_rechazado(db, Usuario(email=usuario.email, password_hash="x", nombre="Otro",
                                 tipo=TipoUsuario.PARTICULAR))


def test_email_repetido_entre_orquestas_se_rechaza(db, crear_orquesta):
    orquesta = crear_orquesta()
    assert_rechazado(db, nueva_orquesta(email=orquesta.email))


def test_una_orquesta_no_puede_tener_dos_filas_el_mismo_dia(db, crear_orquesta, crear_disponibilidad):
    orquesta = crear_orquesta()
    fecha = crear_disponibilidad(orquesta)
    assert_rechazado(db, Disponibilidad(orquesta_id=orquesta.id, fecha=fecha.fecha, precio=Decimal("1")))


def test_dos_orquestas_pueden_ofrecer_el_mismo_dia(crear_orquesta, crear_disponibilidad):
    dia = date.today() + timedelta(days=30)
    assert crear_disponibilidad(crear_orquesta(), fecha=dia).id
    assert crear_disponibilidad(crear_orquesta(), fecha=dia).id


# --- Reservas: varias pendientes, solo una aceptada (SPEC §4.2 y §4.5) ---

def test_varios_usuarios_pueden_tener_reservas_pendientes_el_mismo_dia(crear_usuario, crear_orquesta,
                                                                       crear_disponibilidad, crear_reserva):
    fecha = crear_disponibilidad(crear_orquesta())
    crear_reserva(crear_usuario(), fecha)
    crear_reserva(crear_usuario(), fecha)
    assert len(fecha.reservas) == 2


def test_segunda_reserva_aceptada_del_mismo_dia_se_rechaza(db, crear_usuario, crear_orquesta,
                                                           crear_disponibilidad, crear_reserva):
    fecha = crear_disponibilidad(crear_orquesta())
    crear_reserva(crear_usuario(), fecha, estado=EstadoReserva.ACEPTADA)
    assert_rechazado(db, Reserva(usuario_id=crear_usuario().id, disponibilidad_id=fecha.id,
                                 estado=EstadoReserva.ACEPTADA))


@pytest.mark.parametrize("otro_estado", [EstadoReserva.PENDIENTE, EstadoReserva.RECHAZADA,
                                         EstadoReserva.CANCELADA])
def test_una_aceptada_convive_con_reservas_en_otros_estados(crear_usuario, crear_orquesta, crear_disponibilidad,
                                                            crear_reserva, otro_estado):
    fecha = crear_disponibilidad(crear_orquesta())
    crear_reserva(crear_usuario(), fecha, estado=EstadoReserva.ACEPTADA)
    assert crear_reserva(crear_usuario(), fecha, estado=otro_estado).id


def test_reservas_aceptadas_en_dias_distintos_no_chocan(crear_usuario, crear_orquesta, crear_disponibilidad,
                                                        crear_reserva):
    orquesta = crear_orquesta()
    usuario = crear_usuario()
    crear_reserva(usuario, crear_disponibilidad(orquesta), estado=EstadoReserva.ACEPTADA)
    otro_dia = crear_disponibilidad(orquesta, fecha=date.today() + timedelta(days=31))
    assert crear_reserva(usuario, otro_dia, estado=EstadoReserva.ACEPTADA).id


# --- Relaciones (SPEC §3, todas 1:N con back_populates) ---

def test_relaciones_en_los_dos_sentidos(crear_usuario, crear_orquesta, crear_disponibilidad, crear_reserva):
    usuario = crear_usuario()
    orquesta = crear_orquesta()
    fecha = crear_disponibilidad(orquesta)
    reserva = crear_reserva(usuario, fecha)
    assert orquesta.disponibilidades == [fecha] and fecha.orquesta is orquesta
    assert fecha.reservas == [reserva] and reserva.disponibilidad is fecha
    assert usuario.reservas == [reserva] and reserva.usuario is usuario


# --- Borrados en cascada ---
# Las fechas no se borran desde la API (se retiran, ver abajo), pero si se borra una cuenta
# (script, admin) el ON DELETE CASCADE de la BD tiene que poder actuar: para eso las
# relationship() llevan passive_deletes=True. Sin eso, el ORM pone a NULL la clave de los hijos
# antes de borrar y la BD lo rechaza (NotNullViolation).

def test_borrar_orquesta_borra_sus_fechas_y_sus_reservas(db, crear_usuario, crear_orquesta,
                                                         crear_disponibilidad, crear_reserva):
    orquesta = crear_orquesta()
    crear_reserva(crear_usuario(), crear_disponibilidad(orquesta))
    db.delete(orquesta)
    db.commit()
    assert db.query(Disponibilidad).count() == 0
    assert db.query(Reserva).count() == 0


def test_borrar_usuario_borra_sus_reservas_pero_no_las_fechas(db, crear_usuario, crear_orquesta,
                                                             crear_disponibilidad, crear_reserva):
    usuario = crear_usuario()
    crear_reserva(usuario, crear_disponibilidad(crear_orquesta()))
    db.delete(usuario)
    db.commit()
    assert db.query(Reserva).count() == 0
    assert db.query(Disponibilidad).count() == 1


# --- Fechas retiradas: borrado lógico (SPEC §4.9) ---
# La lógica (rechazar pendientes, prohibirlo si está reservada, reutilizar la fila al volver a
# publicar) es del Paso 5; aquí solo se comprueba lo que depende de la BD.

def test_retirar_una_fecha_conserva_sus_reservas(db, crear_usuario, crear_orquesta, crear_disponibilidad,
                                                 crear_reserva):
    usuario = crear_usuario()
    fecha = crear_disponibilidad(crear_orquesta())
    reserva = crear_reserva(usuario, fecha, estado=EstadoReserva.RECHAZADA)
    fecha.estado = EstadoDisponibilidad.RETIRADA
    db.commit()
    db.expire_all()  # vuelve a leer de la BD
    assert reserva.disponibilidad.estado == EstadoDisponibilidad.RETIRADA
    assert usuario.reservas == [reserva]  # sigue en «Mis reservas», con su fecha


def test_una_fecha_retirada_sigue_ocupando_el_dia(db, crear_orquesta, crear_disponibilidad):
    # Por eso, al volver a publicar ese día, el Paso 5 debe reutilizar la fila retirada en vez
    # de crear otra (SPEC §4.15)
    orquesta = crear_orquesta()
    fecha = crear_disponibilidad(orquesta, estado=EstadoDisponibilidad.RETIRADA)
    assert_rechazado(db, Disponibilidad(orquesta_id=orquesta.id, fecha=fecha.fecha, precio=Decimal("1")))
