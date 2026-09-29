from fastapi import FastAPI

from app.routers import admin, auth, disponibilidades, mi_orquesta, orquestas, reservas

app = FastAPI(title="Plataforma de orquestas")

app.include_router(auth.router, prefix="/api")
app.include_router(orquestas.router, prefix="/api")
app.include_router(disponibilidades.router, prefix="/api")
app.include_router(mi_orquesta.router, prefix="/api")
app.include_router(reservas.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
