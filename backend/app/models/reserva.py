# TODO: modelo "reserva" — ver SPEC §3.
# Regla §4.8: solo una reserva activa por fecha, garantizado en BD.
# Pista: índice único parcial sobre disponibilidad_id WHERE estado IN ('PENDIENTE','ACEPTADA')
#        (Index(..., unique=True, postgresql_where=...)).
