"""Tests de la infraestructura de tests: BD aislada y ayudantes de conftest.py."""
from datetime import date, timedelta

from app.models import TipoUsuario, Usuario


def test_bd_limpia_entre_test(db):
    # Con email fijo: si la BD no se limpiara entre tests, fallaría al ejecutarlo dos veces
    db.add(Usuario(email="fijo@gmail.com", password_hash="x", nombre="Prueba", tipo=TipoUsuario.PARTICULAR))
    db.commit()
    assert db.query(Usuario).count() == 1


def test_crear_usuario(crear_usuario):
    usuario = crear_usuario()
    admin = crear_usuario(es_admin=True, provincia="León")
    assert usuario.id and not usuario.es_admin
    assert admin.es_admin and admin.provincia == "León"
    assert usuario.email != admin.email


def test_crear_orquesta(crear_orquesta):
    assert crear_orquesta().verificada
    assert not crear_orquesta(verificada=False).verificada


def test_crear_disponibilidad(crear_orquesta, crear_disponibilidad):
    orquesta = crear_orquesta()
    fecha = crear_disponibilidad(orquesta)
    otra = crear_disponibilidad(orquesta, fecha=date.today() + timedelta(days=31))
    assert fecha.orquesta_id == orquesta.id
    assert fecha.fecha > date.today()
    assert otra.fecha != fecha.fecha


def test_headers_de(crear_usuario, crear_orquesta, headers_de):
    assert headers_de(crear_usuario())["Authorization"].startswith("Bearer ")
    assert headers_de(crear_orquesta())["Authorization"].startswith("Bearer ")
