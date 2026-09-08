---
description: "El insignia — un prompt y tenés el proyecto entero: producto, arquitectura, stack justificado, modelo de datos, estándares, andamiaje con CI y guardrails, onboarding y roadmap. El skill LIDERA: investiga y decide, no interroga."
argument-hint: "<lo que querés construir, ej: 'una plataforma de reservas para clínicas veterinarias'>"
---

Arrancá este proyecto de cero: **$ARGUMENTS**

Cargá el skill `system-craft`. Sos el **arquitecto responsable** — no interrogues al usuario.
Investigá, decidí lo que podés decidir bien, y declará cada decisión con su justificación.
Preguntá SOLO lo que es genuinamente suyo y no se puede deducir ni averiguar: presupuesto,
plazos, apetito de riesgo, preferencias comerciales, compromisos con terceros.

Corré las nueve fases delegando cada una a su agente y pasando los artefactos hacia adelante:

1. **descubrimiento** — `scout`: investiga mercado, competencia y regulación; escribe el PRD con requisitos verificables y RNF numéricos, más el glosario.
2. **arquitectura** — `architect`: bounded contexts, flujos críticos CON sus ramas de fallo, decisiones irreversibles. **Sin nombrar ni una tecnología.**
3. **stack** — `quartermaster`: un ADR por decisión, cada uno con dos alternativas descartadas y su motivo, más el costo operativo.
4. **modelo de datos** — `archivist`: convenciones que aplican a TODAS las tablas, aislamiento, migraciones, respaldos con procedimiento de restauración.
5. **estándares** — `codifier`: el molde, con el árbol de archivos concreto, el Definition of Done accionable y el anexo de reglas automatizables.
6. **andamiaje** — `foreman`: repositorio, tooling, CI, guardrails, fitness functions, hooks y contenedores locales. **Termina con `verify` en verde, ejecutado de verdad.**
7. **onboarding** — `herald`: `CLAUDE.md` y `docs/AGENT-ONBOARDING.md`, con cada comando verificado contra el manifiesto real.
8. **roadmap** — `navigator`: la secuencia con dependencias explícitas y la tabla de deuda registrada.
9. Y queda listo el **ciclo de cambio** (`mason`), que es el motor que corre de ahí en adelante.

**Verificá la puerta de salida de cada fase antes de avanzar.** Es lo único que separa el método
de una carpeta con documentos bonitos. Las tres que más se declaran cerradas sin estarlo:

- Fase 1: ¿la arquitectura nombra alguna tecnología? Si sí, no está terminada.
- Fase 5: ¿`verify` y el CI corren lo mismo, en el mismo orden? Corré `verify` de verdad.
- Fase 6: ¿todos los comandos citados existen? Comprobalo contra el manifiesto.

Cero deuda: lo que encontrás roto se corrige de raíz, y lo que no vas a cerrar se registra en el
roadmap. Nunca en silencio.

Terminá con: el stack elegido en una tabla, las decisiones irreversibles, la salida real de
`verify`, y qué necesita decidir el usuario para desbloquear lo que quedó pendiente.
