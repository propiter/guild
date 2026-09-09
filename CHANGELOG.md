# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto
usa [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-09-08

Primer release coherente del gremio: los cinco pipelines, su columna compartida y su registro de
oficios funcionando juntos, con un instalador de un solo comando.

### Added

- **Los 5 pipelines de producción**, cada uno con sus fases delegadas a oficios especializados:
  - `landing-craft` (`/landing`) — sitio de marketing investigado, diseñado, construido y
    desplegado.
  - `app-craft` (`/app`) — la interfaz de una aplicación contra un contrato tipado con el
    backend, con modos greenfield, adopción de proyecto existente, una pantalla suelta y
    rescate de UI mal construida.
  - `system-craft` (`/proyecto`) — el método completo en 9 fases para arrancar un sistema:
    descubrimiento, arquitectura sin nombrar tecnología, stack justificado, modelo de datos,
    estándares, andamiaje con CI y guardrails, onboarding, roadmap y ciclo de cambio.
  - `security-craft` (`/seguridad`) — modelado de amenazas, explotación real contra el entorno
    propio del usuario, remediación de raíz y candados permanentes (test de regresión +
    guardrail de CI) por cada hallazgo.
  - `delivery-craft` (`/entrega`) — diagnóstico de rastros de IA y huecos de entrega, limpieza
    en olas verificadas, prueba integral del sistema real, y firma o rechazo de la entrega.
- **`craft-core`**, la columna compartida entre `landing-craft` y `app-craft`: la doctrina de
  cero deuda técnica, cambio a la raíz, el loop de revisión cerrado, el bus de artefactos, los
  defaults de stack, la barra de producción/hardening, el gate de contraste WCAG medido, el
  dial de intensidad de motion y la generación de assets.
- **46 oficios con nombre propio**, documentados en [`docs/OFICIOS.md`](docs/OFICIOS.md), sin
  dos oficios compartiendo nombre — porque todos viven en el mismo espacio de agentes.
- **Las 10 leyes del gremio**
  ([`skills/craft-core/references/leyes-del-gremio.md`](skills/craft-core/references/leyes-del-gremio.md)):
  cero gaps, cero bugs, cero parches, limpio/escalable/ordenado, fácil de depurar, seguro por
  defecto, probado no prometido, verde no es correcto, investigá no adivines, y la
  documentación no miente ni envejece. Citadas en la cabecera de cada oficio.
- **El instalador de un solo comando** (`install.sh`) para Claude Code, y también OpenCode y
  Cursor si están presentes — idempotente, sin sudo, sin nada en segundo plano. Instala
  [Impeccable](https://github.com/pbakaus/impeccable) (motor estético de landing/app) y
  [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai) (memoria persistente + SDD)
  por defecto, con flags para instalar solo una parte (`--only`), saltar Impeccable
  (`--no-impeccable`), saltar Gentle AI (`--no-gentle-ai`), saltar el aviso de Firecrawl
  (`--no-firecrawl`), o desinstalar (`--uninstall`).
- **Modos de diagnóstico read-only**, uno por pipeline, para evaluar sin cambiar nada:
  `/proyecto-audit`, `/app-audit`, `/landing-audit`, `/security-audit`, `/entrega-diagnostico`.
- [`docs/PIPELINES.md`](docs/PIPELINES.md) — la coreografía: cómo se encadenan los 5 pipelines
  en un proyecto real, con casos de uso concretos y comandos.
