<!-- ============================================================
INSTRUCCIONES DE USO — BORRAR ESTE BLOQUE AL LLENAR EL DOCUMENTO

Este documento NO se llena con datos del proyecto — es genérico, se copia
tal cual al bootstrapear (ajustando sólo los comandos concretos si tu
proyecto usa nombres de tarea distintos a los del perfil base). Vive junto a
`AGENT-ONBOARDING.md` como lectura de arranque: cualquier agente (o persona)
que empieza a tocar código en este repo debería conocer estos seis niveles
ANTES de escribir la primera línea.
============================================================ -->

# El bucle rápido de retroalimentación

## Por qué existe este documento

Todo bug que llega a producción pasó, en algún momento, por una ventana en la que YA existía pero
todavía NADIE lo sabía. Esa ventana tiene un nombre: **latencia del error** — cuánto tiempo pasa
entre que se comete el error y que algo (un humano o un agente) se entera.

Para un agente que escribe código de forma autónoma, esa latencia importa más que para una
persona, por una razón concreta: un agente no "siente" que algo está mal a mitad de escribir —
sigue generando código sobre la base que tiene, hasta que algo se lo dice. Si lo primero que se lo
dice es `verify` completo, corrido recién antes del PR, el agente pudo haber construido cientos de
líneas sobre un error de tipos que el editor ya sabía a los cinco segundos de cometerlo. El costo
de deshacer ese trabajo no es el mismo que el costo de no haberlo empezado.

**La regla que resuelve esto no es "correr más tests". Es correr el test MÁS BARATO que puede
detectar el error que acabás de cometer, apenas lo cometiste — y subir de nivel sólo cuando el
anterior está limpio.**

## Los seis niveles

| Nivel | Qué corre | Objetivo | Detecta | NO detecta | Cuándo lo dispara un agente |
|---|---|---|---|---|---|
| **0 · editor** | Servidor de lenguaje / diagnósticos del IDE (tsserver, pyright/mypy en modo watch) | Instantáneo | Sintaxis rota, imports que no resuelven, tipos incompatibles en la línea que estás tocando | Lógica de negocio incorrecta, efectos entre archivos, nada que dependa de correr el programa | Mientras escribís — no es un comando que se "dispare", es feedback continuo. Un agente que edita un archivo y sigue de largo sin mirar los diagnósticos está ignorando el nivel más barato que existe. |
| **1 · archivo** | Lint + typecheck del archivo tocado (no del proyecto entero) | < 3 s | Estilo, tipos que el nivel 0 no marcó (algunos analizadores son perezosos hasta que se guarda el archivo), imports circulares locales | Que la lógica haga lo que debería, cualquier interacción con OTRO archivo que no sea una firma de tipos | Después de CADA edición no trivial — antes de seguir escribiendo la función siguiente. |
| **2 · unidad** | Tests del módulo/paquete tocado, no la suite entera | < 10 s | Que la lógica que acabás de escribir haga lo que el test dice que debería hacer | Que otro módulo siga funcionando con este cambio, cualquier cosa que dependa de infraestructura real (DB, red) | Después de cada función o método con lógica — el ciclo rojo→verde de TDD vive acá. |
| **3 · proyecto** | Lint + typecheck completos (todo el repo, no un archivo) | < 60 s | Roturas CRUZADAS: un cambio de firma que rompe un caller en otro paquete, un tipo que dejó de ser compatible en un archivo que ni tocaste esta sesión | Aislamiento entre tenants, contratos con servicios reales, que el ARTEFACTO empaquetado arranque — nada de esto lo prueba un typecheck | Antes de comitear. Un commit no debería entrar con el proyecto roto en OTRO archivo, aunque el tuyo esté perfecto. |
| **4 · integración** | Tests contra infraestructura REAL en contenedor (Postgres/Redis vía `docker-compose.dev.yml`, ver `templates/docker/`) | Pocos minutos | Contratos con la base real (una migración que no aplica, una query que un ORM generó mal), aislamiento entre tenants (RLS) — nada de esto se ve contra un mock, que por definición responde lo que el test espera | Que el ARTEFACTO empaquetado (la imagen Docker real) arranque con las variables de producción, vulnerabilidades de dependencias | Antes de pushear. Es el nivel que un mock no puede reemplazar — una política RLS mal escrita se ve IDÉNTICA contra un mock y ROTA contra una base real. |
| **5 · verify** | Todo lo anterior en cadena, en el MISMO orden que corre el CI, más build + arranque del artefacto + auditoría | Minutos | Todo lo de arriba, más: que el artefacto empaquetado (no el código fuente) arranque de verdad, que no haya vulnerabilidades `high`/`critical` sin resolver, que `verify` y `ci.yml` no se hayan desincronizado (`check:ci-parity`) | Nada que el propio pipeline no mida — si `verify` está en verde y algo sigue roto, es un hueco en el pipeline, no un falso positivo de este nivel | Antes de abrir el PR. Si esto no está verde, el PR no debería existir todavía. |

## Reglas que este documento fija

### 1. Un agente NUNCA salta del nivel 1 al 5

Escribe una línea, la verifica en el nivel MÁS BARATO que puede detectar el tipo de error que
acaba de cometer, y sólo sube de nivel cuando el anterior queda limpio. Correr `verify` completo
después de cada edición no es "ser prolijo" — es quemar minutos en un chequeo que un typecheck de
archivo (3 segundos) ya iba a atrapar. Y al revés: quedarse sólo en el nivel 0-1 y abrir un PR sin
haber corrido nunca el nivel 4 es exactamente el patrón que este documento existe para prevenir —
"local en verde, CI en rojo" no es un accidente, es la consecuencia de no haber subido de nivel a
tiempo.

### 2. Cada nivel dice qué NO detecta — esa es la parte que evita el falso "listo"

Un nivel 3 en verde (lint + typecheck completos) no dice ABSOLUTAMENTE NADA sobre si una política
de aislamiento entre tenants está bien escrita — esa propiedad sólo la prueba una base de datos
real (nivel 4). Un agente que ve "todo verde" en el nivel 3 y lo interpreta como "todo listo" está
leyendo mal la señal: cada nivel prueba lo que prueba, y punto. La columna "NO detecta" de la
tabla de arriba no es relleno — es, literalmente, la lista de formas en que "verde" puede
convivir con "roto".

### 3. El mensaje de error tiene que decir qué hacer, no sólo qué falló

"Test falló" es información para nadie. "`test_calcular_impuesto` esperaba `Decimal('10.50')` y
recibió `Decimal('10.5000000001')` — revisá el redondeo en `calcular_impuesto()`, línea 42" es
información que un agente sin contexto previo puede accionar sin tener que releer todo el archivo.
Los guardrails de este kit (`templates/guardrails/`) siguen esta regla explícitamente: cada uno
termina con una sección "Para arreglarlo" — nunca sólo el diagnóstico. Aplicá el mismo estándar a
cualquier aserción de test que escribas: el mensaje de fallo es para la próxima persona (o el
próximo vos, en otra sesión) que no tiene el contexto que tenés ahora.

### 4. Fallar rápido y ruidoso vence a fallar tarde y silencioso

El peor modo de falla no es "el nivel 2 tardó 15 segundos en vez de 10". Es el que deja todo en
VERDE mientras algo está roto — un `catch` que traga un error, un test que no hace ninguna
aserción real, un healthcheck que sólo mira que el puerto responda y no el contenido (ver
`templates/profiles/*/Dockerfile.template`: el `HEALTHCHECK` valida el CUERPO de la respuesta,
justamente para no caer en esto). Un nivel que falla ruidosamente en 3 segundos es infinitamente
más barato que uno que queda en silencio y deja que el error suba, sin que nadie lo note, hasta el
nivel 5 — o peor, hasta producción.

## Comandos concretos, por perfil

| Nivel | TypeScript | Python |
|---|---|---|
| 0 · editor | `tsserver` vía tu editor (diagnósticos en vivo) | `pyright`/`mypy` en modo watch, o los diagnósticos nativos del editor |
| 1 · archivo | `pnpm biome check <archivo>` · `pnpm tsc --noEmit <archivo>` (o el equivalente que exponga tu editor) | `uv run ruff check <archivo>` · `uv run mypy <archivo>` |
| 2 · unidad | `pnpm vitest run <archivo-o-carpeta>` | `uv run pytest <archivo-o-carpeta>` |
| 3 · proyecto | `pnpm lint && pnpm typecheck` | `make lint && make typecheck` |
| 4 · integración | `pnpm db:up && pnpm test:integration` | `make db-up && make test-integration` |
| 5 · verify | `pnpm verify` | `make verify` |

`db:up` / `make db-up` levantan Postgres + Redis en contenedores locales y ESPERAN a que estén
`healthy` antes de devolver el control — ver `templates/docker/README.md`. Sin ese wait explícito,
el nivel 4 falla de forma intermitente con `ECONNREFUSED` (el contenedor "arrancado" no es lo
mismo que el proceso "listo para aceptar conexiones") — exactamente el tipo de fallo silencioso e
inconsistente que la regla 4 de arriba pide evitar.

## Cómo lo usa un agente

El bucle, explícito, paso a paso:

1. **Antes de escribir**, mirá si el editor (nivel 0) ya te está marcando algo en el archivo que
   vas a tocar. Un error de tipos preexistente en la zona que vas a editar es más barato de
   arreglar ANTES de sumar código nuevo encima.
2. **Escribís una unidad de cambio pequeña** (una función, un método, un bloque cohesivo — no un
   archivo entero de una sentada).
3. **Subís al nivel más barato que puede confirmar que esa unidad está bien**: normalmente nivel 1
   (lint + typecheck del archivo) si es un cambio de forma, o nivel 2 (test del módulo) si hay
   lógica nueva.
4. **Si ese nivel falla**: parás ahí. No seguís escribiendo la función siguiente sobre una base que
   el nivel más barato ya te dijo que está mal. Arreglás, volvés a correr ESE MISMO nivel — no uno
   más caro — hasta que esté limpio.
5. **Repetís 2-4** hasta completar la tarea (una función, un endpoint, un módulo).
6. **Antes de comitear**, subís al nivel 3 (proyecto completo) — no porque tu archivo esté mal, sino
   porque el nivel 3 es el primero que puede ver que ROMPISTE algo en un archivo que ni tocaste esta
   sesión.
7. **Antes de pushear**, subís al nivel 4 — el pre-push del perfil (`templates/profiles/*/husky/
   pre-push` o `templates/profiles/python/hooks/pre-push`) ya corre `verify` completo (nivel 5), que
   incluye el 4. No hace falta correrlo dos veces a mano si el hook está instalado.
8. **Antes de abrir el PR**, `verify` (nivel 5) tiene que estar en verde. Si no lo está, el PR no se
   abre — abrir un PR con `verify` roto traslada el costo de diagnosticar a quien lo revisa, que
   tiene MENOS contexto que vos en este momento, no más.

La regla resumen: **nunca uses un nivel más caro que el necesario, y nunca declares "listo" con un
nivel más barato que el que hacía falta.** Las dos direcciones importan — la primera por velocidad,
la segunda porque es exactamente como se cuela un bug a producción con todo "en verde".
