---
description: El insignia del pipeline de seguridad — modela amenazas, ataca de verdad contra tu entorno propio, remedia de raíz y deja un candado permanente por cada hallazgo. Cuatro oficios en orden estricto; se detiene si no se puede confirmar que el objetivo es tuyo.
argument-hint: "[objetivo a auditar, ej: 'mi API en localhost:3000' — vacío = el proyecto actual]"
---

Endurecé este objetivo: **$ARGUMENTS**

Cargá el skill `security-craft`.

> Esto SOLO opera contra sistemas del propio usuario: su entorno local, de desarrollo o de
> staging, sin datos reales de terceros. Nunca contra sistemas de terceros, nunca contra
> producción con datos de usuarios reales, nunca exfiltración de datos.

Corré los cuatro oficios, en orden estricto, delegando cada uno y pasando los artefactos hacia
adelante por disco:

1. **reconocimiento** — `sentinel`: modela amenazas, inventaria la superficie de ataque, y
   **confirma que el objetivo es propio** antes de que nadie más lo toque. Si no puede
   confirmarlo, el pipeline TERMINA acá — no sigas a la fase 2 igual.
2. **explotación** — `breaker`: prueba de concepto real contra los objetivos que Sentinel
   priorizó — bypass de autorización, IDOR, inyección, fuga entre inquilinos, secretos expuestos,
   SSRF, deserialización, path traversal, dependencias con CVE. Documenta la clase de dato
   alcanzable, nunca el dato real. Revierte todo lo que toca.
3. **remediación** — `warden`: corrige de raíz cada hallazgo confirmado, en rama, reproduciendo el
   fallo antes del fix y confirmando el cierre después con la misma prueba de concepto.
4. **candado** — `locksmith`: convierte cada remediación en un test de regresión que se pone rojo
   si el bug vuelve, más un guardrail de CI cuando corresponde. Prueba que cada candado falla
   antes de darlo por instalado.

**Verificá la puerta de salida de cada fase antes de avanzar.** La que más se salta:

- Fase 1: ¿la confirmación de propiedad tiene evidencia concreta, o es una suposición? Si es lo
  segundo, no avances.
- Fase 2: ¿cada hallazgo confirmado tiene PoC reproducible y cero datos reales pegados?
- Fase 3: ¿el fix cierra la CLASE de fallo o solo la instancia que Breaker probó?
- Fase 4: ¿probaste que el candado se pone rojo cuando el bug vuelve, o lo asumiste?

Cero deuda silenciosa: un hallazgo que no se pudo cerrar en esta pasada queda registrado como
deuda de seguridad explícita en `docs/SEGURIDAD.md`, nunca enterrado.

Terminá con: si Sentinel confirmó o no el objetivo (primero, antes que cualquier otra cosa), la
tabla de hallazgos con severidad, la evidencia antes/después de cada remediación, y los candados
instalados con la prueba de que fallan cuando deben.
