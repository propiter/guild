# Fase 8 · El ciclo de cambio

## Objetivo

El motor que corre **una y otra vez** durante toda la vida del proyecto. Las fases 0 a 7 se hacen
una vez; esta se repite por cada capacidad que se construye.

Un cambio no se declara terminado porque el build está verde. Se declara terminado cuando está
**verificado contra su especificación** — que es un documento escrito antes de programar y que
nadie puede reinterpretar convenientemente después.

## Precondiciones

- Fases 0 a 7 completas
- `docs/ROADMAP.md` con el siguiente elemento identificado

## Los siete artefactos

Cada cambio vive en `docs/sdd/<nombre-del-cambio>/`:

| Artefacto | Responde | Se escribe |
|---|---|---|
| `proposal.md` | ¿Qué y por qué? | Antes de nada |
| `spec.md` | ¿Qué debe cumplir? | Antes de diseñar |
| `design.md` | ¿Cómo se construye? | Antes de programar |
| `tasks.md` | ¿En qué pasos? | Antes de programar |
| `apply-progress.md` | ¿Qué se hizo? | Durante |
| `verify-report.md` | ¿Cumple la spec? | Después |
| `archive-report.md` | ¿Qué aprendimos? | Al cerrar |

El orden importa. `spec.md` antes de `design.md` es lo que impide que la especificación se escriba
para describir la solución que ya tenías pensada.

## EL PROMPT

```
Vas a ejecutar un CICLO DE CAMBIO completo.

CAMBIO A TRABAJAR: <nombre, o "el siguiente del roadmap">

LEÉ PRIMERO (obligatorio):
1. docs/AGENT-ONBOARDING.md — el protocolo de arranque. Ejecutalo entero antes de seguir.
2. docs/ROADMAP.md — el elemento y sus dependencias
3. STANDARDS.md — el molde
4. docs/ARQUITECTURA.md y docs/MODELO-DATOS.md — las partes que este cambio toca

ESTRUCTURA: creá docs/sdd/<nombre-del-cambio>/ con los siete artefactos.

--- PROPUESTA (proposal.md) ---
Intención · Motivación (qué se rompe o qué falta hoy) · Alcance DENTRO / Alcance FUERA ·
Dependencias · Riesgos · Resultado esperado.
El alcance FUERA es tan importante como el DENTRO: es lo que impide que el cambio crezca
mientras se construye.

--- ESPECIFICACIÓN (spec.md) ---
Requisitos numerados R1..Rn. Cada uno con escenarios en formato DADO / CUANDO / ENTONCES.
Usá palabras normativas (DEBE, NO DEBE, PUEDE) — y usalas con precisión, no como adorno.
Cada requisito tiene su criterio de aceptación verificable.
REGLA DURA: la especificación se escribe ANTES del diseño. Si describe la solución en vez del
comportamiento esperado, está mal escrita y hay que reescribirla.

--- DISEÑO (design.md) ---
Enfoque · Decisiones locales (formato ADR, igual que STACK.md) · Estructura de archivos ·
Estrategia de testing por capa · Qué NO se hace y por qué.

--- TAREAS (tasks.md) ---
Checklist ordenado, agrupado en unidades de trabajo de menos de 400 líneas cada una.
Cada tarea nombra el test que la prueba. Si una tarea no tiene test, o es trivial o está
mal descompuesta.
Si el cambio no entra en una unidad, se planifican pull requests encadenados: decilo acá,
con el orden y qué depende de qué.

--- IMPLEMENTACIÓN (apply-progress.md) ---
TDD estricto: primero el test, comprobás que está ROJO, después el código.
Registrá la evidencia RED→GREEN de cada guarda importante. No "pasa el test": el test falló
por el motivo correcto antes de pasar.
Registrá también los defectos que encontraste y NO estaban planeados. Esos son los más
valiosos del ciclo.

--- VERIFICACIÓN (verify-report.md) ---
Comandos ejecutados con su resultado exacto, pegado.
Cumplimiento R1..Rn: una fila por requisito, con la evidencia concreta.
Hallazgos con severidad y resolución.
Veredicto.
REGLA DURA: la verificación se hace contra la ESPECIFICACIÓN, no contra el build. "Todo verde"
no es un veredicto de verificación — el build verde solo dice que no rompiste lo que ya estaba
probado.

--- ARCHIVO (archive-report.md) ---
Qué quedó construido · Qué enseñó este ciclo · Qué NO cubre (los límites conocidos de lo
construido) · Estado del roadmap actualizado · Qué sigue.
Sé honesto sobre los fallos del propio proceso. Un archivo que solo registra éxitos no enseña
nada a quien lo lea dentro de un año.

AL CERRAR:
- Actualizá docs/ROADMAP.md (estado del elemento + deuda técnica nueva, si la hubo)
- Actualizá los documentos que este cambio dejó desactualizados
- Persistí el resumen de sesión
```

## Puerta de salida de cada ciclo

- [ ] Los siete artefactos existen
- [ ] La especificación se escribió antes que el diseño
- [ ] Cada requisito tiene evidencia de cumplimiento en el informe de verificación
- [ ] Hay evidencia RED→GREEN, no solo tests en verde
- [ ] Los defectos no planeados están registrados
- [ ] El roadmap quedó actualizado
- [ ] La deuda nueva quedó registrada, no en la cabeza de nadie

## Por qué la especificación va antes que el diseño

Si diseñás primero, la especificación termina describiendo tu diseño. Y entonces la verificación
comprueba que el diseño hace lo que el diseño dice que hace — una tautología perfecta que se siente
como rigor y no verifica absolutamente nada.

La especificación tiene que poder **contradecir** al diseño. Solo puede hacerlo si se escribió sin
conocerlo.

## Por qué el archivo registra los fallos del proceso

Es lo que convierte los ciclos en aprendizaje institucional en vez de en un changelog.

El caso más útil que vas a escribir es este: un cambio que pasó todos los gates, se aprobó "sin
advertencias", y después resultó tener defectos reales. Eso enseña más sobre los límites de tus
gates que cincuenta ciclos exitosos — y es exactamente lo que un agente sin contexto necesita leer
para no confiar ciegamente en el verde.

## Errores comunes

**Escribir la especificación después de programar.** Se nota siempre: describe la implementación
en vez del comportamiento. Y ya no puede verificar nada.

**Verificar contra el build.** "Todo verde, listo." El build prueba que no rompiste lo que ya
estaba probado. No prueba que lo nuevo cumpla lo que se pidió.

**Saltarse el archivo.** Es el artefacto que más se saltea porque el cambio "ya está hecho". Y es
el único que le habla a quien venga después.

**Ciclos demasiado grandes.** Si `tasks.md` no entra en unidades de menos de 400 líneas, el cambio
es demasiado grande: partilo en cambios encadenados. Un pull request de 2000 líneas no se revisa,
se aprueba — y eso es otra cosa muy distinta.
