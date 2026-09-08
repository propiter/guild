# Perfil TypeScript

Extraído de dos monorepos reales en producción, en dominios sin relación entre sí. Donde los dos
coinciden, es convención. Donde difieren, este
perfil elige una opción y documenta la alternativa.

## Quién cumple cada rol

| Rol | Herramienta | Por qué esta y no otra |
|---|---|---|
| Gestor de paquetes + workspaces | **pnpm** | Instalación por content-addressable store (rápida, sin duplicar en disco) y `workspace:*` para dependencias internas del monorepo. Las dos fuentes lo usan sin excepción. |
| Orquestador de tareas | **Turborepo** | Cachea por hash de inputs y resuelve el grafo de dependencias entre paquetes (`^build` antes de `build`). Sin esto, cada paquete tendría que saber el orden de build de sus dependencias a mano. |
| Lint + formato + organización de imports | **Biome** | Un solo binario en Rust reemplaza ESLint + Prettier + import-sort. Ambas fuentes migraron a Biome completo (no hay ESLint en ninguna). |
| Chequeo de tipos | **tsc** (`--noEmit`, vía Turbo) | El compilador oficial. No hay atajo: es la única fuente de verdad del sistema de tipos. |
| Tests + cobertura | **Vitest** + `@vitest/coverage-v8` | Corre sobre el mismo motor que Vite/esbuild que ya usan los builds, arranque en frío mucho más rápido que Jest en un monorepo con decenas de paquetes. |
| Hooks de Git | **Husky** + **lint-staged** | Hook versionado en el repo (no en `.git/hooks`, que no se comparte). |
| Runtime de producción | **Node.js** | `>=22` (LTS activa en ambas fuentes; `.nvmrc` = `22` en las dos). |
| Dinero | **Decimal.js** en memoria, **`NUMERIC(18,4)`** en Postgres | Ningún cálculo de plata pasa por `number`. `NUMERIC(18,4)` admite 18 dígitos EN TOTAL (14 enteros + 4 decimales) — confirmado con tests que prueban el desborde exacto en uno de los monorepos. |

## Versiones

- **Node.js:** `>=22` (`engines.node` en ambas fuentes; `.nvmrc` = `22`)
- **pnpm:** `10.x` (`packageManager: "pnpm@10.32.1"` en ambas fuentes — fijado con `corepack`, no
  instalado global)
- **Biome:** `2.x` con extensión **`.jsonc`** (no `.json`) — ver el porqué en la sección de
  `biome.jsonc.template` más abajo. Uno de los monorepos de referencia todavía está en Biome 1.9.4
  (`biome.json`, sin comentarios); el otro ya migró a Biome 2.5.11. Este perfil sigue a ese segundo
  monorepo porque Biome 2 tiene el parser de CSS necesario para Tailwind (`tailwindDirectives`)
  y una regla `noConsole` más estricta
  que la `noConsoleLog` de Biome 1 (ver abajo).
- **TypeScript:** pin exacto en `package.json`, no rango abierto. Este template usa `^5.7.2`
  (la versión estable que usa uno de los monorepos de referencia). Advertencia honesta: el otro
  ya fijó `typescript: "7.0.2"` (el compilador nativo en preview) — si tu proyecto lo adopta,
  revisá que Biome y `ts-node`/`tsx`
  sigan siendo compatibles antes de migrar el resto del stack.
- **Turborepo:** `^2.10.x`

## Decisiones y por qué

### `pnpm verify` reproduce CI 1:1, en el mismo orden

Es el patrón central de este perfil (confirmado en producción en uno de los monorepos de
referencia). El problema que resuelve: sin esto, CI
va sumando pasos con el tiempo (un umbral de cobertura nuevo, un build de Storybook, una auditoría
de dependencias) y el script `verify` local se queda atrás — el resultado es un `verify` en verde
que igual deja `main` en rojo, que es exactamente lo que un gate local existe para impedir.

Ese monorepo lo resuelve con un guardrail (`check:ci-parity`) que extrae los comandos `pnpm …` del YAML
de CI y exige que cada uno aparezca, literal y en el mismo orden relativo, dentro de la cadena de
`verify`. Ese guardrail es un artefacto de la fase de Andamiaje (`templates/guardrails/` en este
kit, fuera del alcance de este perfil) — este `package.json.template` deja el punto de enganche
(`pnpm check:ci-parity` como primer paso de `verify`) documentado en el paso a paso de abajo, pero
no incluye la implementación: copiala desde ahí cuando exista, o sacá esa línea si tu proyecto
todavía no la tiene.

### Biome con reglas duras, cada una con su porqué

- **`suspicious.noExplicitAny: error`** — un `any` explícito apaga el chequeo de tipos exactamente
  donde más hace falta (los bordes: parseo de I/O, respuestas de terceros). Si hace falta escapar
  el sistema de tipos, `unknown` + un type guard deja rastro; `any` no.
- **`suspicious.noConsole: error`** — en Biome 2 (`noConsoleLog` en Biome 1 solo bloqueaba
  `console.log`; `noConsole` bloquea la consola entera). El motivo, confirmado en producción: código de
  librería o de servicio que escribe en la consola de un proceso ajeno (el navegador del usuario,
  el stdout de un servicio en producción) tiene un bug, no un log. Los scripts de línea de
  comandos (`scripts/**`) llevan un override explícito: ahí la salida por consola ES el producto.
- **`style.noNonNullAssertion: error`**, desactivada en tests — `variable!` le miente al
  compilador ("esto nunca es null/undefined") sin ninguna prueba en runtime. En código de
  producción es una promesa que se rompe silenciosamente el día que la premisa deja de ser
  cierta. En tests, construir fixtures a veces exige afirmar un valor que el test mismo garantiza
  por construcción — ahí el costo de la regla supera el beneficio.
- **`correctness.noUnusedImports` / `noUnusedVariables`: error** — código muerto que un `tsc`
  suelto no siempre marca con la misma agresividad.
- **`style.useImportType: error`** — separa imports de tipo de imports de valor. Importante: en
  código con decoradores (NestJS y similares), este override tiene que estar OFF para los paths que
  usan inyección por constructor — ver el gotcha de `unsafeParameterDecoratorsEnabled` más abajo.

### El gotcha de `.jsonc` vs `.json`

Biome acepta comentarios en `biome.jsonc`. En `biome.json` los acepta también, pero al encontrar el
primer comentario **descarta el archivo entero en silencio** y corre con su configuración por
defecto — sin avisar. Medido en producción: un solo comentario suelto en el archivo equivocado hizo que
Biome pasara de revisar 90 archivos a 351 (entró a `dist/`, `coverage/`, `storybook-static/`), con
tabulaciones y 80 columnas en vez de espacios y 100. Por eso este perfil entrega
`biome.jsonc.template` — la extensión no es cosmética, es la diferencia entre "mi configuración
corre" y "Biome corre con otra configuración distinta sin que nadie lo note".

### `tsconfig.base.json` con `noUncheckedIndexedAccess: true`

Confirmado en ambas fuentes. Sin este flag, `array[i]` tiene tipo `T`, no `T | undefined` — TypeScript
te deja acceder a un índice fuera de rango como si siempre existiera. Con el flag, cada acceso por
índice fuerza a manejar el caso "no está", que es el 100% de los bugs reales de "cannot read
property of undefined" en producción.

### Hooks separados por costo: `pre-commit` rápido, `pre-push` completo

Confirmado en ambas fuentes, con el mismo argumento: si el hook de pre-commit corriera typecheck y
tests, la gente empezaría a usar `--no-verify` como hábito — que es peor que no tener hook, porque
además de perder la verificación, se pierde la señal de que algo se está saltando. `pre-commit`
corre solo `lint-staged` (formato + lint sobre lo que se va a commitear, ~1 segundo). `pre-push`
corre `pnpm verify` completo (~20s con caché de Turbo, ~1 min en frío) — es la última barrera antes
de que el código salga de la máquina y potencialmente rompa `main` para otra persona o agente.

### `HEALTHCHECK` apunta a liveness, nunca a readiness — y valida contenido

Esta es una corrección a un supuesto, no una copia directa de lo que hoy corre en los monorepos de
referencia: sus Dockerfiles actuales solo comprueban código de estado HTTP (`wget --spider`,
`fetch(...).ok`), no el cuerpo de la respuesta. Lo que SÍ está confirmado, y por partida doble
(ambos monorepos documentan la misma decisión de forma independiente, cada uno en su propio ADR):
el endpoint de salud tiene que estar partido en dos, y el `HEALTHCHECK` del contenedor solo puede
mirar uno de los dos.

- **Liveness (`/health`)** — "¿hay que reiniciarme?". No hace I/O (no toca DB ni Redis). Contesta
  `200` mientras el proceso esté vivo y el framework haya terminado de levantar.
- **Readiness (`/ready`)** — "¿me mandás tráfico?". Sí hace I/O (prueba la conexión real a DB/Redis)
  y devuelve `503` si algo está caído.

El `HEALTHCHECK` de Docker (y el liveness probe de cualquier orquestador) tiene una sola
consecuencia posible cuando falla: **reiniciar el proceso**. Apuntarlo a `/ready` significa que un
parpadeo de Postgres —que un reinicio del proceso Node no arregla— tira las conexiones sanas y, en
una caída real de la base, reinicia en bucle todas las instancias a la vez. Por eso este perfil
apunta el `HEALTHCHECK` a `/health`, y además valida el CUERPO de la respuesta
(`{"status":"ok"}`), no solo el código HTTP — un `200` de un proxy o de un servicio equivocado
respondiendo en el mismo puerto no es lo mismo que tu proceso respondiendo con la forma esperada.

### Auditoría de dependencias alineada con lo que el Dockerfile realmente empaqueta

`pnpm audit --prod` (excluye devDependencies) solo es un gate real si el Dockerfile también podó
las devDependencies antes de empaquetar (`pnpm install --prod` + `pnpm prune --prod`, confirmado en
producción). Medido ahí: sin la poda, la imagen llevaba 397 MB de `node_modules` con dos vulnerabilidades
reales en `esbuild` — invisibles para `pnpm audit --prod` porque viajaban como dependencias de
desarrollo (`tsup`, `drizzle-kit`) que la imagen no debería llevar. Un audit que no mira lo mismo
que la imagen despacha es un verde falso con fecha de vencimiento.

## El comando `verify`, paso a paso

```jsonc
"verify": "pnpm check:ci-parity && pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm test:integration && pnpm audit"
```

1. **`check:ci-parity`** — primero, y sin depender de ningún build previo: si `verify` ya se
   desincronizó de lo que corre CI, no tiene sentido seguir. (Guardrail de la fase de Andamiaje;
   ver nota arriba si todavía no lo copiaste a tu proyecto.)
2. **`lint`** (`biome check .`) — estático, rápido, no necesita que nada esté compilado.
3. **`typecheck`** (`turbo run typecheck` → `tsc --noEmit` por paquete) — atrapa errores de tipos
   antes de gastar tiempo corriendo tests que de todos modos fallarían.
4. **`test:coverage`** (`turbo run test:coverage` → `vitest run --coverage`) — tests unitarios con
   el umbral de cobertura que tu CI exija.
5. **`build`** — si lint, tipos y tests unitarios pasaron, recién ahí vale la pena compilar.
6. **`test:integration`** — corre DESPUÉS del build a propósito: si tu suite de integración
   levanta el binario compilado (`dist/main.js`) en vez de correr contra fuente, sin este orden
   `verify` pasaría en local (porque encadena `build` antes) y fallaría en un CI que no respete el
   mismo orden. Corre con `--concurrency=1` si dos paquetes de integración comparten la misma base
   de datos — correrlos en paralelo produce carreras de datos que no se ven en local con baja
   carga y sí en CI.
7. **`audit`** (`pnpm audit --audit-level=high --prod`) — último paso: es el gate de "qué es
   seguro publicar", y solo tiene sentido evaluarlo sobre lo mismo que el `build` anterior produjo.

Si tu CI corre estos pasos en un orden distinto, `verify` tiene que seguir a CI — no al revés.
