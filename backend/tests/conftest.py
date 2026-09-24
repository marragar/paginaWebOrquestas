import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


# TODO: fixture de BD de pruebas (base de datos postgres separada, crear/borrar tablas
#       por test o usar transacciones con rollback) y override de get_db:
#       app.dependency_overrides[get_db] = ...
