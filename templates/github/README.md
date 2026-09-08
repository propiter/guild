# El modelo de CI del kit

Esta carpeta no es una colección de workflows sueltos. Es UN modelo de integración continua, con
una sola regla que sostiene todo lo demás:

> **`pnpm verify` (o `make verify` / `uv run verify` según el perfil) es EXACTAMENTE lo que corre
> CI, en el MISMO orden.**

No es una convención de estilo. Es un candado: `templates/guardrails/check-ci-parity.mjs` falla el
build si el script local y el workflow se desincronizan. La razón por la que existe está contada en
la cabecera de ese script — se desincronizaron una vez, en silencio, y un `verify` local en verde
dejaba `main` en rojo.

## Por qué esto importa más de lo que parece

El costo real de un CI que "hace lo suyo" y un `verify` que "hace lo suyo" no es que estén
desalineados hoy. Es que CADA PR nuevo es una apuesta: ¿el paso que alguien sumó a CI la semana
pasada también está en `verify`? Si nadie lo comprueba mecánicamente, la respuesta la da el primer
push que falla — en CI, después de que el local dijo que todo estaba bien. Eso es exactamente la
divergencia que este modelo existe para hacer imposible.

## El pipeline

```
                         ┌─────────────────────────┐
   pull_request  ───────▶│         quality          │──────┐
   push a main           │  check:* (orden exacto)   │      │
                         │  lint · typecheck · test  │      │
                         │  build · knip · docs      │      │
                         └─────────────────────────┘      │
                                     │                       │
                                     ▼                       │
                         ┌─────────────────────────┐      │   BLOQUEAN el merge:
                         │       integracion         │      │   quality, integracion
                         │  DB real · aislamiento    │      │   y audit son checks
                         │  entre tenants (RLS)      │      │   requeridos en la
                         └─────────────────────────┘      │   protección de rama.
                                     │                       │
                                     ▼                       │
                         ┌─────────────────────────┐      │
                         │          audit            │──────┘
                         │  vulnerabilidades         │
                         │  high/critical            │
                         └─────────────────────────┘

   (en paralelo, sólo en push a main / tag)
                         ┌─────────────────────────┐
                         │       build-push          │──▶ registry ──▶ redeploy
                         │  matriz de imágenes        │      (webhook LAB/PROD)
                         │  smoke test real (2 rutas) │
                         └─────────────────────────┘

   (en cada PR, cuando CI de `quality` pasa)
                         ┌─────────────────────────┐
                         │        El Auditor         │──▶ APRUEBO + no-crítico
                         │  review con veredicto      │      + diff chico
                         │  + auto-merge condicionado  │      → auto-merge squash
                         └─────────────────────────┘
```

`quality`, `integracion` y `audit` son jobs **separados y bloqueantes**, no pasos de un job único.
La razón no es prolijidad: un fallo de RLS entre tenants tiene que verse SOLO, sin confundirse con
un test unitario roto o con una dependencia vulnerable. Mezclar todo en un job monolítico hace que
la lista de checks del PR deje de ser diagnóstico y pase a ser un semáforo mudo.

## Tabla de jobs

| Job | Qué valida | Bloquea merge | Duración objetivo |
|---|---|---|---|
| `quality` | Paridad verify↔CI, pares de versiones, config del linter leída de verdad, Dockerfiles sin drift, lint sin auto-fix, typecheck, tests + cobertura, build, smoke de arranque con DI real | Sí | < 10 min |
| `integracion` | Suites contra base de datos REAL (Postgres/similar): aislamiento entre tenants (RLS), orden de tests barajado | Sí | < 10 min |
| `audit` | Vulnerabilidades `high`/`critical` en dependencias de producción, distinguiendo "hay vulnerabilidad" de "el registry no contestó" | Sí | < 3 min |
| `build-push` (matriz) | La imagen construye, arranca, y responde en DOS rutas (liveness + una ruta que usa el provider inyectado) | No bloquea PRs (build sin push); si falla en `main`, no hay imagen nueva que desplegar | < 8 min por imagen |
| `El Auditor` | Revisión de PR con veredicto estructurado y auto-merge condicionado | No es un check requerido — es asesor, salvo que el equipo decida lo contrario | < 3 min |

## Dónde corren los workflows

Todos los jobs declaran:

```yaml
runs-on: ${{ vars.{{CI_RUNNER_VAR}} || 'ubuntu-24.04' }}
```

**Si no definís esa variable de repositorio, no tenés que configurar nada**: el workflow usa
runners de GitHub (`ubuntu-24.04`) y funciona tal cual está. Esa es la ruta por defecto y la que
debería usar cualquiera que arranque con el kit.

La indirección existe solo por si algún día necesitás mover los jobs a tu propia infraestructura:
definís la variable en `Settings → Secrets and variables → Actions → Variables` con la etiqueta de
tu runner y no tocás ni un workflow. Es un gancho de coste cero — mientras no lo uses, no existe.

Cambiá `{{CI_RUNNER_VAR}}` por el nombre que quieras para esa variable (por ejemplo `CI_RUNNER`) al
instanciar la plantilla, o reemplazá la expresión entera por `ubuntu-24.04` si preferís no tener el
gancho.

## Los dos perfiles

El template de CI (`workflows/ci.yml.template`) trae bloques para dos perfiles de proyecto:

- **TypeScript** (pnpm/npm workspace, Node) — extraído de monorepos reales en producción.
- **Python** (uv, pytest, ruff, mypy) — extraído de un servicio en producción.

Los bloques están marcados con comentarios `# --- PERFIL TYPESCRIPT ---` / `# --- PERFIL PYTHON
---`. Al bootstrapear un proyecto nuevo, se borra el perfil que no corresponde — dejar los dos vivos
produce un workflow que no corre (jobs con nombres duplicados, pasos que referencian herramientas
que el proyecto no instala).

## El principio en una frase para el onboarding de un agente

> Antes de empujar, corré el `verify` local. Si pasa, CI pasa. Si algún día eso deja de ser cierto,
> es un bug de `check-ci-parity.mjs` — no del agente que confió en él.
