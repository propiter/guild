# Los prompts del método

Nueve fases. Cada una produce **un artefacto verificable** y tiene una **puerta de salida**.
No se avanza de fase sin pasar la puerta. Esa es toda la disciplina.

| # | Fase | Produce | Puerta de salida |
|---|------|---------|------------------|
| 0 | [Descubrimiento](00-descubrimiento.md) | `docs/PRD.md`, `docs/GLOSARIO.md` | Un humano ajeno al proyecto entiende qué se construye y para quién |
| 1 | [Diseño de sistema](01-diseno-de-sistema.md) | `docs/ARQUITECTURA.md` | Los flujos críticos están dibujados **sin nombrar una sola tecnología** |
| 2 | [Stack](02-stack.md) | `docs/STACK.md` | Cada elección tiene alternativas descartadas y el motivo del descarte |
| 3 | [Modelo de datos](03-modelo-de-datos.md) | `docs/MODELO-DATOS.md` | Toda entidad del PRD tiene tabla; toda tabla tiene dueño y política de acceso |
| 4 | [Estándares](04-estandares.md) | `STANDARDS.md` | Existe UN molde y un Definition of Done accionable |
| 5 | [Andamiaje](05-andamiaje.md) | repo, tooling, CI, guardrails | `lint`, `typecheck`, `test`, `build` verdes en un repo vacío |
| 6 | [Onboarding](06-onboarding.md) | `CLAUDE.md`, `docs/AGENT-ONBOARDING.md` | Un agente sin contexto arranca solo y no rompe nada |
| 7 | [Roadmap](07-roadmap.md) | `docs/ROADMAP.md` | Secuencia ordenada de cambios, con dependencias explícitas |
| 8 | [Ciclo SDD](08-ciclo-sdd.md) | un cambio cerrado | El cambio está verificado contra su spec, no contra "el build pasa" |

## Por qué este orden

**Fase 1 va antes que fase 2 a propósito.** La arquitectura describe *qué hace el sistema y cómo
fluye la información*. El stack describe *con qué se materializa*. Si elegís el framework primero,
la arquitectura termina siendo "lo que ese framework permite" — y ahí perdiste el control del
diseño. Es la diferencia entre un plano y un catálogo de materiales.

**Fase 4 va antes que fase 5.** No se automatiza un estándar que todavía no existe. Los guardrails
de la fase 5 (`scripts/check-*.mjs`, reglas de lint, hooks) son la ejecución mecánica de las reglas
que la fase 4 escribió en prosa. Automatizar primero produce reglas arbitrarias que nadie puede
justificar cuando molestan.

**Fase 6 va después de 5.** El onboarding le dice al agente "corré `pnpm test`". Ese comando tiene
que existir antes.

## Cómo se usan

Cada archivo tiene cuatro bloques:

1. **Objetivo** — qué problema resuelve la fase
2. **Precondiciones** — qué artefactos deben existir ya
3. **EL PROMPT** — bloque copiable, listo para pegar en una sesión nueva
4. **Puerta de salida** — el checklist que decide si podés avanzar

Los prompts asumen una sesión **limpia**. Están escritos para que el agente investigue en lugar de
interrogarte: preguntar diez cosas que puede deducir del código o de la web es trasladarte el
trabajo.

## La regla que sostiene todo

> Una fuente de verdad por pregunta.

`STANDARDS.md` responde "¿cómo se construye un recurso?".
`STACK.md` responde "¿por qué elegimos X?".
`ARQUITECTURA.md` responde "¿cómo fluye el sistema?".
`ROADMAP.md` responde "¿qué sigue?".

Cuando dos documentos responden la misma pregunta, uno de los dos ya está desactualizado y nadie
sabe cuál. Esa es la causa raíz de la mayoría de la deuda documental.
