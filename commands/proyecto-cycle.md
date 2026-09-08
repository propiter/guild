---
description: Ejecutar un ciclo de cambio completo — propuesta, especificación, diseño, tareas, implementación con TDD, verificación contra la spec y archivo.
argument-hint: "[nombre del cambio — vacío = el siguiente del roadmap]"
---

Ejecutá el ciclo de cambio: **$ARGUMENTS**

Cargá el skill `system-craft` y delegá a `mason`, siguiendo `docs/prompts-system-craft/08-ciclo-sdd.md`.

Antes de nada, ejecutá **entero** el protocolo de arranque de `docs/AGENT-ONBOARDING.md`.

Los siete artefactos van en `docs/sdd/<nombre-del-cambio>/`. Dos reglas que deciden si el ciclo
sirve o es teatro:

- **La especificación se escribe ANTES del diseño.** Si se escribe después, describe tu diseño, y
  la verificación comprueba que el diseño hace lo que el diseño dice. Es una tautología que se
  siente como rigor.
- **La verificación se hace contra la especificación, no contra el build.** "Todo verde" no es un
  veredicto: el build solo prueba que no rompiste lo que ya estaba probado.

Registrá la evidencia RED→GREEN, y los defectos que encontraste y no estaban planeados — esos son
los más valiosos del ciclo.
