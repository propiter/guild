---
description: Escribir los documentos de onboarding — CLAUDE.md (se carga siempre) y AGENT-ONBOARDING.md (protocolo de arranque de sesión).
argument-hint: ""
---

Escribí el onboarding del proyecto.

Cargá el skill `system-craft` y delegá a `herald` la **fase 6**, siguiendo
`docs/prompts-system-craft/06-onboarding.md`.

Son **dos documentos distintos** y confundirlos es el error más común:
- `CLAUDE.md` — se carga siempre. El **estado**: stack, estructura, comandos, prohibiciones. Máximo dos pantallas.
- `docs/AGENT-ONBOARDING.md` — se pega al arrancar sesión. El **método**: cómo averiguar dónde estamos.

Verificá **cada comando** que cites contra el manifiesto real antes de escribirlo. Uno inventado
destruye la confianza en el documento entero.

Al terminar, corré la prueba: sesión limpia, pegás `AGENT-ONBOARDING.md`, no decís nada más. Si el
agente arranca solo y propone el siguiente paso correcto, funciona.
