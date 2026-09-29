# Público objetivo

> Informe para orientar el diseño del frontend. Complementa a [SPEC.md](SPEC.md).
>
> **Aviso:** no se basa en entrevistas ni en datos propios. Está hecho a partir del SPEC y del
> conocimiento general del sector de las orquestas de verbena en el noroeste de España. Todo lo que
> dice sobre hábitos y necesidades son **hipótesis que hay que validar** con usuarios reales
> (ver sección 6).

## 1. El contexto

- **Qué se contrata:** orquestas de verbena para fiestas patronales, fiestas de verano, romerías,
  Nochevieja y, en menor medida, bodas y eventos privados.
- **Dónde:** sobre todo en el noroeste (Galicia, Asturias y Castilla y León). León es un caso
  especial por su número de **juntas vecinales** (entidades locales menores): concentra una parte
  muy grande de las que hay en España. Son pueblos pequeños con presupuesto propio para las fiestas.
- **Cuándo:** la temporada fuerte va de junio a septiembre, con los fines de semana de julio y
  agosto (y en especial el puente del 15 de agosto) como fechas más disputadas. Estas fechas se
  cierran con muchos meses de antelación, así que buena parte de la contratación ocurre en otoño,
  invierno y primavera.
- **Cómo se hace hoy:** por teléfono y WhatsApp, a través de representantes o agencias, por
  recomendaciones de otros pueblos y viendo actuaciones en persona. La web tiene que ser **más
  cómoda que una llamada**, porque la llamada es su competencia real.
- **Dinero:** cuestan desde unos pocos miles de euros hasta más de diez mil. Es el gasto más
  grande de la fiesta y una decisión que se habla en grupo.

## 2. Perfiles

La plataforma tiene dos lados: quien **organiza** la fiesta (cuenta *usuario*) y quien **toca**
(cuenta *orquesta*). En el lado organizador hay perfiles muy distintos.

### 2.1 Comisión de fiestas

| | |
|---|---|
| Quién | Grupo de vecinos voluntarios, con frecuencia jóvenes (20-45 años). Cambia cada año o cada pocos años. |
| Dispositivo | **Móvil**, casi siempre. Coordinación por grupos de WhatsApp. |
| Nivel digital | Medio-alto. |
| Presupuesto | Justo: sale de cuotas de vecinos, rifas y patrocinios. El precio pesa mucho. |
| Cómo decide | En grupo. Alguien busca opciones, las comparte en el grupo y se vota o se discute. |

**Necesita:**
- Buscar por **fecha concreta** (su fiesta es un día fijo) y ver precios claros desde el principio.
- **Compartir** una orquesta o una fecha con el resto de la comisión en un toque.
- Comparar varias orquestas para el mismo día.
- Saber qué incluye el precio: duración, número de sesiones (vermú y noche), escenario, sonido.

**Le frustra:** tener que llamar para saber precio y disponibilidad, y las webs que no funcionan
bien en el móvil.

### 2.2 Junta vecinal

| | |
|---|---|
| Quién | Presidente o pedáneo de un pueblo pequeño. Con frecuencia es una persona mayor (55-75 años). |
| Dispositivo | Móvil (a veces con letra grande activada) u ordenador compartido. |
| Nivel digital | **Bajo-medio.** Usa WhatsApp, pero no está acostumbrado a registrarse ni a rellenar formularios largos. |
| Presupuesto | Pequeño y público: necesita factura y CIF de la orquesta. |
| Cómo decide | Suele repetir con orquestas conocidas o que le recomiendan otros pueblos. Muchas veces quiere hablar por teléfono antes de comprometerse. |

**Necesita:**
- **Letra grande, alto contraste y botones grandes.** Pocos pasos y palabras sencillas.
- **Teléfono visible y pulsable** en todo momento: es su vía de escape si algo no queda claro.
- Tener claro en qué estado está su petición, con palabras que entienda. "Pendiente" dice menos
  que "Esperando respuesta de la orquesta".
- Datos de la orquesta para la factura (nombre fiscal, CIF).

**Le frustra:** el vocabulario técnico ("usuario", "disponibilidad"), los formularios largos, la
letra pequeña y el texto gris claro, y las animaciones que distraen o ralentizan un móvil antiguo.

### 2.3 Ayuntamiento

| | |
|---|---|
| Quién | Concejal de fiestas o personal técnico o administrativo de un ayuntamiento pequeño o mediano. |
| Dispositivo | **Ordenador**, en horario de oficina. |
| Nivel digital | Medio. |
| Presupuesto | Público. Estas contrataciones suelen hacerse como **contrato menor** (Ley 9/2017 de Contratos del Sector Público), que exige expediente, presupuesto y factura. |
| Cómo decide | Pide presupuesto a varias orquestas, deja constancia y lo aprueba internamente. |

**Necesita:**
- Datos formales de la orquesta: razón social, CIF y contacto.
- Un **resumen imprimible o descargable** de la solicitud y de la reserva aceptada para
  adjuntarlo al expediente.
- Saber si el precio lleva IVA.
- Poder gestionar **varias fiestas al año** (patrón, verano, Nochevieja) desde la misma cuenta.

**Le frustra:** no tener nada "en papel", y los precios ambiguos.

### 2.4 Particular

Bodas, cumpleaños grandes, fiestas de empresa. Usuario **ocasional**: entra, contrata una vez y
no vuelve. Busca sobre todo formatos pequeños (dúos, tríos) y precio. Necesita el mismo flujo
sencillo que la junta vecinal, sin nada que dé por supuesto que es una institución.

### 2.5 Orquesta (o su representante)

| | |
|---|---|
| Quién | Dueño, mánager o representante de la orquesta. A veces una agencia lleva varias. |
| Dispositivo | **Móvil**, de viaje y a deshoras (en temporada tocan casi todas las noches). Ordenador para planificar la temporada. |
| Nivel digital | Medio-alto. Ya usan calendarios compartidos y WhatsApp Business. |
| Objetivo | Llenar el calendario, sobre todo las fechas flojas (entre semana, fuera de temporada), sin dejar escapar las fechas fuertes a un precio bajo. |
| Cómo decide | Además del precio, pesa **dónde es** (kilómetros y logística con la fecha anterior y la siguiente) y quién lo pide (clientes que repiten). |

**Necesita:**
- **Ver la temporada entera de un vistazo**, no mes a mes.
- Publicar muchas fechas de golpe, por ejemplo "todos los sábados de julio y agosto".
- Precios distintos por fecha, sobre todo en los días fuertes.
- Responder solicitudes **rápido y desde el móvil**, con el lugar y la distancia bien visibles.
- Cuando varios pueblos piden el mismo día, **compararlos lado a lado** antes de aceptar.
- Un aviso claro de las solicitudes nuevas.

**Le frustra:** perder tiempo con peticiones que no encajan, y tener que mantener el calendario
en varios sitios.

### 2.6 Administración

Uso interno y poco frecuente, en ordenador. Necesita revisar orquestas nuevas con la información
suficiente para verificarlas. No condiciona el diseño general.

## 3. Lo que tienen en común

1. **La fecha manda.** El organizador no busca "una orquesta", busca una orquesta **para su día**.
   La fecha debe ser el punto de entrada principal.
2. **El teléfono es el plan B de todos.** Esconderlo no hace que la gente lo use menos; hace que
   desconfíe más.
3. **Se decide en grupo** (comisión, pleno, junta), así que compartir es parte del flujo.
4. **Hay que confiar en la orquesta.** Importan la verificación, los años de experiencia y los
   pueblos donde ha tocado. Fotos, vídeos y reseñas están fuera del MVP (SPEC §8), pero son lo que
   más confianza daría.
5. **La mayor parte del uso es en móvil**, salvo en ayuntamientos y en la planificación de
   temporada de las orquestas.
6. **Hay muchas edades y niveles digitales distintos.** El diseño debe funcionar para quien tiene
   menos soltura: si le sirve a una persona de 70 años con el móvil, le sirve a todo el mundo.

## 4. Implicaciones para el frontend

Ordenadas por prioridad. Las marcadas con ⚙️ necesitarán cambios en el backend o en el SPEC más
adelante; ahora solo se maquetarían.

### Prioridad alta (afecta a todos)

| # | Cambio | Para quién |
|---|---|---|
| A1 | **Accesibilidad de lectura:** texto base a 17-18 px, texto secundario más oscuro, contraste AA como mínimo y botones y zonas táctiles de 48 px. | Junta vecinal, todos |
| A2 | **Lenguaje de las personas, no del sistema:** "Organizo fiestas" en vez de "Soy usuario"; "Esperando respuesta" en vez de "Pendiente"; "Días libres" en vez de "Disponibilidad". | Junta vecinal, particular |
| A3 | **Teléfono pulsable (`tel:`)** en la ficha, en las reservas y en las solicitudes, con botón "Llamar". | Todos |
| A4 | **Compartir por WhatsApp** una orquesta o una fecha, con enlace directo. | Comisión, ayuntamiento |
| A5 | **Móvil primero** en la ficha y en las solicitudes: la acción principal abajo y siempre a mano (botón fijo "Pedir este día" o "Aceptar"). | Comisión, orquesta |
| A6 | **Animaciones solo en la portada.** En el resto, movimiento solo como respuesta a lo que hace la persona. | Junta vecinal, móviles modestos |

### Prioridad media

| # | Cambio | Para quién |
|---|---|---|
| M1 | Buscar **"cualquier fin de semana"** o un rango de fechas, además de un día concreto. | Comisión, particular |
| M2 | **Precio claro:** indicar si lleva IVA y qué incluye (duración, sesiones, escenario). ⚙️ | Ayuntamiento, comisión |
| M3 | **Resumen imprimible** de una reserva, con los datos de las dos partes, para el expediente. | Ayuntamiento |
| M4 | **Vista de temporada** para la orquesta: el año entero en miniatura, además del mes. | Orquesta |
| M5 | **Publicar en serie:** "todos los sábados de julio y agosto" con un solo gesto. | Orquesta |
| M6 | En las solicitudes, el **municipio y la provincia de quien pide** bien visibles, porque determinan la logística. | Orquesta |
| M7 | Datos fiscales de la orquesta (razón social, CIF) en la ficha o en la reserva aceptada. ⚙️ | Ayuntamiento, junta vecinal |

### Prioridad baja o futura

| # | Cambio | Para quién |
|---|---|---|
| B1 | Comparar dos o tres orquestas lado a lado. | Comisión |
| B2 | Buscar por distancia o comarca en vez de por provincia. ⚙️ | Todos |
| B3 | Espacio en la ficha para fotos, vídeos y "dónde hemos tocado" (fuera del MVP). ⚙️ | Todos |
| B4 | Interfaz en gallego y asturiano. ⚙️ | Galicia, Asturias |

## 5. Lo que **no** cambia

- El flujo del MVP (publicar → solicitar → aceptar) sigue igual.
- La identidad visual de verbena se mantiene. Ayuda a que la web se reconozca como algo del mundo
  de las fiestas y no como una herramienta genérica.

## 6. Hipótesis a validar

Antes de invertir en las prioridades medias y bajas, convendría hablar con **3 a 5 personas de cada
lado** (una comisión, una junta vecinal, un ayuntamiento y dos o tres orquestas o representantes):

1. ¿Con cuánta antelación se contrata realmente, y en qué meses?
2. ¿Quién de la comisión o la junta hace la búsqueda y cómo lo comparte con el resto?
3. ¿Qué datos piden siempre antes de decidir? (precio, IVA, duración, escenario, vídeo...)
4. ¿Los ayuntamientos necesitan algún documento concreto para el contrato menor?
5. ¿Las orquestas gestionan el calendario ellas mismas o a través de un representante?
6. ¿Qué parte de los organizadores se registraría para pedir una fecha, y qué parte prefiere
   llamar sin más?
