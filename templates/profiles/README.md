# Perfiles

## Qué es un perfil

El método (`prompts/00` a `prompts/08`) es agnóstico del lenguaje: define fases, artefactos y
puertas de salida, pero no dice si tu `typecheck` corre con `tsc` o con `mypy`. Un **perfil** es la
respuesta a esa pregunta para UN lenguaje concreto: qué herramienta cumple cada rol (lint, tipos,
tests, build, empaquetado), con qué configuración exacta, y por qué.

La fase 5 del método (Andamiaje, `prompts/05-andamiaje.md`) es la que consume un perfil. Su puerta
de salida es "`lint`, `typecheck`, `test`, `build` verdes en un repo vacío" — un perfil es
justamente lo que hace que esos cuatro comandos existan y tengan sentido antes de escribir una
sola línea de dominio.

Un perfil NO decide arquitectura (eso es fase 1, `ARQUITECTURA.md`) ni stack de negocio (fase 2,
`STACK.md` — framework web, ORM, cola). Decide **tooling de calidad**: cómo se lintea, cómo se
tipa, cómo se testea, cómo se empaqueta, cómo se audita, y cómo un humano o un agente reproduce
localmente, con un solo comando, exactamente lo que va a correr en CI.

## Qué aporta cada perfil

Los dos perfiles de este kit se extrajeron de proyectos reales en producción, no se diseñaron en
abstracto:

| Perfil | Fuente | Aporta |
|---|---|---|
| [`typescript/`](./typescript/README.md) | Dos monorepos reales en producción (pnpm + Turborepo + Biome + Vitest) | El patrón `pnpm verify` que reproduce CI 1:1, reglas de Biome con su porqué, `tsconfig` strict con `noUncheckedIndexedAccess`, hooks de Git separados por costo (`pre-commit` rápido / `pre-push` completo), Dockerfile multi-stage sin privilegios |
| [`python/`](./python/README.md) | Un servicio en producción (uv + Ruff + mypy + pytest) | Cobertura exigida en el comando de build y NUNCA en `addopts` de pytest, mypy estricto acotado al paquete de dominio, Ruff con selección explícita de reglas, empaquetado wheel-only con `hatchling` |

Ambos perfiles comparten dos decisiones no negociables, confirmadas en las dos fuentes:

- **El dinero nunca es un tipo de punto flotante.** TS usa `Decimal.js` en memoria y `NUMERIC(18,4)`
  en la base; Python usa enteros de centavos y `Decimal` — nunca `float`, ni siquiera "solo para
  mostrar".
- **El `Dockerfile` es multi-stage, corre con un usuario sin privilegios, y el `HEALTHCHECK`
  valida contenido de la respuesta — no solo que el puerto responda.** Un contenedor que devuelve
  `200` con un cuerpo vacío o incorrecto está "sano" para Docker y roto para el negocio.

## Tabla de equivalencias TS ↔ Python

| Rol | TypeScript | Comando TS | Python | Comando Python |
|---|---|---|---|---|
| Gestor de paquetes | pnpm (workspaces) | `pnpm install --frozen-lockfile` | uv | `uv sync --frozen` |
| Orquestador de tareas del monorepo | Turborepo | `pnpm turbo run build` | *(perfil de paquete único — ver nota)* | — |
| Lint | Biome | `pnpm lint` (`biome check .`) | Ruff | `uv run ruff check .` |
| Lint con autofix | Biome | `pnpm lint:fix` (`biome check --write .`) | Ruff | `uv run ruff check --fix .` |
| Formato | Biome | `pnpm format` (`biome format --write .`) | Ruff | `uv run ruff format .` |
| Chequeo de tipos | tsc | `pnpm typecheck` (`tsc -b --noEmit` vía Turbo) | mypy | `uv run mypy src` |
| Tests | Vitest + `@vitest/coverage-v8` | `pnpm test` | pytest + Hypothesis (opcional) | `uv run pytest` |
| Tests con cobertura | Vitest | `pnpm test:coverage` (`vitest run --coverage`) | pytest-cov | `uv run pytest --cov-fail-under=85` (el umbral va en el comando, no en `addopts` — ver el porqué en `python/README.md`) |
| Tests de integración | Vitest, `--concurrency=1` | `pnpm test:integration` | pytest, marcador dedicado | `uv run pytest -m integracion` |
| Build / empaquetado | tsup o `tsc` según la app → `dist/` | `pnpm build` | hatchling → wheel | `uv build --wheel` |
| Hooks de Git | Husky + lint-staged | `pnpm exec lint-staged` | *(no evidenciado en la fuente — extensión futura, no se inventa aquí)* | — |
| Gate local que reproduce CI 1:1 | script `verify` propio, con un guardrail que fuerza la paridad | `pnpm verify` | equivalente: un target de `Makefile` o el mismo comando que invoca el CI | `uv run ruff check . && uv run mypy src && uv run pytest --cov-fail-under=85 && uv build --wheel` |
| Auditoría de dependencias | `pnpm audit` | `pnpm audit --audit-level=high --prod` | *(sin equivalente evidenciado en la fuente Python; si lo necesitás, agregalo — no viene con el perfil base)* | — |
| Tipos estrictos, alcance | Todo el monorepo vía `tsconfig.base.json` | — | Solo el paquete de dominio (`[[tool.mypy.overrides]]`) | — |
| Dinero | `Decimal.js` + `NUMERIC(18,4)` | — | Enteros de centavos + `Decimal` | — |
| Contenedor | Multi-stage, usuario sin privilegios, `HEALTHCHECK` de contenido | — | Multi-stage con `uv`, wheel-only, usuario sin privilegios, `HEALTHCHECK` de contenido | — |

**Nota sobre Turborepo:** el perfil Python de este kit está pensado para un paquete único, no
para un monorepo Python. Si tu proyecto Python crece a
múltiples paquetes vas a
necesitar un orquestador de tareas (`uv` con workspaces, o herramientas como `Nx`/`Turborepo` en
modo agnóstico de lenguaje) — no está en la evidencia de este kit, así que no se prescribe acá.

## Cómo agregar un perfil nuevo

Un perfil nuevo (Go, Rust, lo que sea) tiene que cumplir este contrato para engranar con el resto
del método:

1. **Debe proveer, como mínimo, estos comandos** (el nombre exacto puede variar según la
   convención del ecosistema — `make lint` es tan válido como `pnpm lint` — pero el ROL tiene que
   existir y estar documentado):
   - `lint` — análisis estático + estilo
   - `typecheck` / `types` — chequeo de tipos (si el lenguaje lo tiene; en un lenguaje sin tipos
     estáticos, documentar explícitamente por qué este rol queda vacío, no omitirlo en silencio)
   - `test` (y una variante con cobertura, si el ecosistema la separa)
   - `build`
   - `verify` — la cadena de TODO lo anterior, en el mismo orden en que lo corre el CI. Este es
     el comando que un humano o un agente corre antes de hacer push. Si `verify` puede quedar
     desincronizado de CI sin que nada lo note, el perfil está incompleto — necesita un guardrail
     que compare ambos (ver `check:ci-parity` en el perfil TypeScript como referencia del patrón).
   - `audit` — chequeo de vulnerabilidades en dependencias de producción
   - `db:up` / `db:down` / `db:reset` / `db:wait` — levantar, apagar, recrear y **esperar a que
     estén sanos** los servicios de datos en contenedor. El `wait` no es un lujo: el contenedor
     arranca en milisegundos y la base acepta conexiones segundos después, así que sin espera el
     primer test revienta de forma intermitente — el peor tipo de fallo, porque parece aleatorio.
   - `db:migrate` — aplicar migraciones pendientes. El comando concreto lo define la herramienta
     elegida en la fase 2. El CI lo invoca en el job de integración: si el perfil no lo define,
     el job falla con un error que no explica nada.
2. **Declararlos en el mismo orden que el CI.** Si CI corre lint → typecheck → test → build →
   audit, `verify` encadena esos comandos en ESE orden. Un `verify` que pasa en local con un orden
   distinto al de CI no es un gate, es una ilusión de gate.
3. **Cada regla dura necesita su porqué, por escrito, al lado de la regla.** Una regla sin
   justificación es una regla que alguien desactiva la primera vez que le molesta, y nadie se
   acuerda de por qué estaba.
4. **El dinero, si el dominio lo maneja, nunca es de punto flotante.** Cada perfil documenta su
   propio mecanismo (tipo fijo, librería de precisión arbitraria, enteros de la unidad mínima).
5. **Si el perfil empaqueta en contenedor:** multi-stage, usuario sin privilegios, e instalación
   del artefacto empaquetado en vez de copiar el código fuente. El `HEALTHCHECK` apunta a
   *liveness* —una ruta que no toca dependencias externas— y valida el CONTENIDO de la respuesta,
   no solo que el puerto abra. Apuntarlo a *readiness* es el error caro: un hipo de la base
   reinicia todas las réplicas a la vez y convierte una degradación en una caída total.
6. **No inventes herramientas.** Si vas a documentar una decisión de tooling, tiene que venir de un
   proyecto real donde se usó, con su tradeoff — no de "lo que se estila".

Estructura de archivos esperada por perfil:

```
templates/profiles/<lenguaje>/
├── README.md                    # roles, versiones, decisiones y porqué
├── <manifiesto-de-paquete>.template
├── <config-de-lint>.template
├── <config-de-tipos>.template
├── Dockerfile.template
└── <lo que el ecosistema use para hooks de Git>/
```
