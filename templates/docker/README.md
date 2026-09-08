# Docker local — desarrollo, test, y el artefacto real

## Por qué existe esta carpeta

El principio central de este kit es que **`verify` local reproduce EXACTAMENTE lo que corre el
CI, en el mismo orden** (ver `templates/github/README.md` y el guardrail
`templates/guardrails/check-ci-parity.mjs`). El CI levanta Postgres con los `services:` nativos de
GitHub Actions — gratis, sin infraestructura propia. En LOCAL no existía nada equivalente: sin esta
carpeta, correr los tests de integración exigía instalar Postgres a mano, con la versión que a
cada quien le tocó, sin healthcheck, sin aislamiento entre proyectos del mismo autor. Eso rompe el
principio de arriba dos veces: `verify` no puede reproducir un paso que en local ni siquiera tiene
dónde correr, y cada persona (o agente) que lo intenta lo resuelve distinto.

## Qué hay acá

| Archivo | Qué levanta |
|---|---|
| `docker-compose.dev.yml.template` | Postgres (desarrollo, datos persistentes) + Postgres (test, datos en tmpfs) + Redis. Para correr el código SUELTO (`pnpm dev`, `uv run uvicorn ...`) contra infraestructura real. |
| `docker-compose.yml.template` | La APLICACIÓN dockerizada (con el `Dockerfile` real del perfil) + Postgres + Redis, todo en la red interna de Compose. Para probar el ARTEFACTO empaquetado, igual que corre en producción. |
| `.env.example.template` | Todas las variables que consumen los dos compose de arriba. Copiar a `.env` (sin trackear) antes de usar cualquiera de los dos. |
| `scripts/wait-for-healthy.sh` | Espera a que servicios de Compose estén `healthy` (no sólo "arrancados"), con timeout y mensaje accionable. |
| `scripts/db-up.sh` | `docker compose up -d` + espera a healthy, en un solo comando idempotente. |
| `scripts/db-reset.sh` | `docker compose down -v` + `db-up.sh` — estado limpio de verdad, a propósito separado de un `down` de rutina. |

**No se usan los dos compose a la vez.** Son dos modos de uso distintos (código suelto vs. artefacto
empaquetado) que compartirían puertos y nombres de contenedor si se levantan juntos.

## Comandos

Copiá las variables una sola vez, después de clonar:

```sh
cp docker/.env.example docker/.env
```

### Modo desarrollo (código suelto + infraestructura en contenedores)

```sh
docker compose -f docker/docker-compose.dev.yml --env-file docker/.env up -d
bash docker/scripts/wait-for-healthy.sh docker/docker-compose.dev.yml db db-test redis
# ... corré tu código o tus tests contra localhost:$DB_PORT / $REDIS_PORT ...
docker compose -f docker/docker-compose.dev.yml --env-file docker/.env down
```

En la práctica no se escribe esto a mano: los dos perfiles del kit ya lo encadenan.

| Acción | TypeScript (`package.json`) | Python (`Makefile`) |
|---|---|---|
| Levantar y esperar a que esté listo | `pnpm db:up` | `make db-up` |
| Bajar (conserva los datos de `db`) | `pnpm db:down` | `make db-down` |
| Bajar CON los volúmenes + levantar limpio | `pnpm db:reset` | `make db-reset` |
| Sólo esperar a que esté healthy (sin levantar) | `pnpm db:wait` | `make db-wait` |

`db:up` (o `make db-up`) ya corre antes de los tests de integración dentro de `verify` — ver
`templates/profiles/typescript/package.json.template` (script `verify`) y
`templates/profiles/python/Makefile.template` (target `verify`).

### Modo artefacto real (probar la imagen igual que en producción)

```sh
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d --build
curl http://localhost:$APP_PORT/health
docker compose -f docker/docker-compose.yml --env-file docker/.env down
```

## Cómo resetear

`db:reset` / `make db-reset` baja los contenedores CON sus volúmenes (`down -v`) y los vuelve a
levantar. Es distinto de `db:down` a propósito: bajar sin `-v` es la operación de rutina (no perder
datos de desarrollo por accidente); borrar datos es una decisión explícita, nunca un efecto
colateral de apagar los servicios al final del día.

La base de TEST (`db-test`) ni siquiera necesita este comando para "resetearse": al vivir en
`tmpfs` (ver el comentario en `docker-compose.dev.yml.template`), CUALQUIER `down` (con o sin `-v`)
ya le borra los datos — es una propiedad del contenedor, no algo que haya que recordar hacer.

## Por qué el healthcheck no es opcional

Sin `healthcheck` + `wait-for-healthy.sh`, el modo de falla más común y más difícil de diagnosticar
en un entorno de test con contenedores es este: el contenedor de Postgres arranca (figura "Up") en
un puñado de cientos de milisegundos, pero el proceso real tarda 1-3 segundos más en terminar de
inicializar y aceptar conexiones. El primer test que corre en esa ventana falla con `ECONNREFUSED`
— y falla INTERMITENTE: a veces la máquina fue rápida ese día y pasó, a veces no. Nadie sospecha de
"faltó esperar" cuando el fallo es intermitente; se sospecha del test, de la red, de todo menos de
la carrera real. `healthcheck` + `wait-for-healthy.sh` convierten esa carrera en una espera
explícita y determinística: "listo" deja de ser una suposición y pasa a ser un estado que alguien
preguntó de verdad.

## Decisiones de diseño y su porqué

- **Puertos no estándar y parametrizables (`DB_PORT`, `DB_TEST_PORT`, `REDIS_PORT`).** El puerto de
  fábrica de cada motor (5432, 6379) es justo el que más probablemente ya esté ocupado por una
  instalación nativa o por otro proyecto en la misma máquina. Publicar ahí produce "port is already
  allocated" en el primer `db:up` de cualquiera, con un mensaje que no dice qué otro proceso lo
  tiene. Un puerto alto por defecto (55432/55433/56379) hace la colisión rara, y si igual ocurre,
  cambiar un número en `.env` la resuelve sin tocar nada más.
- **Datos en `tmpfs` para la base de test, nunca para la de desarrollo.** `tmpfs` compra velocidad
  (sin I/O de disco real, una suite de integración que crea/destruye esquemas corre sensiblemente
  más rápido) y un estado limpio GARANTIZADO en cada arranque (no hay archivo en disco que
  sobreviva a un `down`, así que no hay forma de que quede basura de la corrida anterior). El
  trade-off — se pierde todo al apagar — es exactamente lo que se busca en test, y exactamente lo
  que NO se busca en desarrollo (por eso `db` usa un volumen nombrado persistente y `db-test` no).
- **Nombres de proyecto y de volúmenes parametrizados por `PROJECT_NAME`.** Sin esto, dos checkouts
  distintos de este kit (del mismo autor, en la misma máquina) generan contenedores y volúmenes con
  el mismo nombre por defecto que Compose derivaría del nombre de la carpeta — y uno termina
  leyendo o pisando los datos del otro. Un valor explícito en `.env` corta esa ambigüedad de raíz.
