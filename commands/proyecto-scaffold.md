---
description: Montar el andamiaje — repositorio, tooling, CI, guardrails y fitness functions, con paridad forzada entre el comando local de verificación y el CI.
argument-hint: "[perfil: typescript | python — vacío = detectar del STACK.md]"
---

Montá el andamiaje: **$ARGUMENTS**

Cargá el skill `system-craft` y delegá a `foreman` la **fase 5**, siguiendo
`docs/prompts-system-craft/05-andamiaje.md`.

Precondición dura: `STANDARDS.md` tiene que existir **con su anexo de reglas automatizables**. Ese
anexo es la lista de trabajo. Si no existe, corré primero la fase 4 (`codifier`) — automatizar un
estándar que todavía no está escrito produce reglas arbitrarias que nadie puede defender cuando
molestan.

El principio que manda esta fase:

> `verify` local reproduce EXACTAMENTE lo que corre el CI, en el mismo orden.
> Y hay un guardrail que lo fuerza por código.

Criterio de aceptación, no negociable: en un repositorio **sin lógica de negocio**, `verify` corre
entero y sale verde. Y rompés un guardrail a propósito para comprobar que falla.
