---
description: Mostrar en qué punto del método está el proyecto — qué fases están cerradas, cuáles a medias, y cuál es la siguiente puerta de salida por pasar. Read-only.
argument-hint: ""
---

Mostrame dónde está este proyecto dentro del método.

Cargá el skill `system-craft` y revisá, **verificando contra el disco y no contra lo que digan los
documentos**, el estado de las nueve fases.

Por cada fase: ¿existe el artefacto? ¿pasa su puerta de salida? Devolveme una tabla
`fase | artefacto | existe | puerta | siguiente acción`.

Verificá explícitamente las tres que más se declaran cerradas sin estarlo:
- Fase 1: ¿la arquitectura nombra alguna tecnología?
- Fase 5: ¿`verify` y el CI corren lo mismo en el mismo orden?
- Fase 6: ¿todos los comandos citados en el onboarding existen?

No cambies nada.
