---
description: Convertir un fallo que ya ocurrió en un candado automatizado — regla de linter, guardrail de repositorio o fitness function de AST. Lo enchufa al CI manteniendo la paridad y verifica que falla cuando debe.
argument-hint: "[qué falló y cómo se detectó]"
---

Convertí este fallo en un candado: **$ARGUMENTS**

Cargá el skill `system-craft` y delegá a `smith`.

Empezá respondiendo las tres preguntas de entrada: **¿qué falló, cómo se detectó, y por qué el CI
no lo agarró?** Si no hay respuesta concreta a las tres, decímelo y no escribas nada — un guardrail
sin un fallo real detrás es fricción sin beneficio.

Después elegí el nivel (linter / guardrail / fitness function), escribilo funcional y sin
dependencias externas, enchufalo al comando de verificación **y** al CI en el mismo orden, y
—esto es lo que casi nadie hace— **rompé a propósito lo que vigila y comprobá que se pone rojo**.
