---
name: delivery-craft
description: "Trigger: dejar un producto listo para entregar al cliente — 'limpiá el producto para entregar', 'dejalo profesional', 'que no parezca hecho con IA', 'está listo para el cliente', 'sacá los console.log/logs de debug', 'código muerto', 'revisá que todo esté bien nombrado', 'preparar la entrega', 'code cleanup final' — el paso FINAL de cualquier pipeline del gremio, agnóstico del lenguaje (TS, Python, Go, lo que sea): toma un producto ya construido —por lo general con ayuda de IA— y borra todo rastro de que fue 'hecho con IA' y todo residuo que no debería llegar a producción. Tres oficios en orden: appraiser diagnostica delivery-readiness inventariando CADA rastro de IA (console.log, comentarios que narran lo obvio, código muerto, TODOs huérfanos, dependencias sin usar, placeholders, nombres perezosos, números mágicos, catch vacíos, secretos commiteados) y CADA hueco de entrega (README desacoplado de la realidad, .env.example incompleto, build/lint/test rotos) con evidencia ruta:línea, puntúa, y es READ-ONLY; finisher limpia de RAÍZ en olas verificadas —red de seguridad primero, un commit por ola, nunca borra sin prueba de que no se usa—; purser firma la entrega o la rechaza, con la prueba dura de arrancar desde un clone limpio. No rediseña UI ni decide arquitectura —eso es trabajo de app-craft/landing-craft— es la higiene final de cualquier entrega."
license: Apache-2.0
metadata:
  author: propiter
  version: "1.0.0"
---

# Delivery Craft

Un producto que "funciona" no está listo para entregar. Todavía tiene los `console.log` que
quedaron prendidos mientras se debuggeaba, el comentario que la IA dejó explicándose a sí misma
línea por línea, el archivo `test.js` de prueba que nadie borró, el README que describe un setup
que ya cambió hace tres commits. Este pipeline es el último paso antes de que el cliente reciba el
producto: audita cada rastro de que hubo una IA escribiendo sin supervisión y cada hueco que le
impediría a otra persona clonar el repo y hacerlo correr, y lo deja limpio de raíz — nunca con un
parche cosmético que tapa un `console.log` puntual y deja los otros doscientos.

Es agnóstico del lenguaje: TypeScript, Python, Go, lo que sea. No juzga si la arquitectura es
correcta ni si la interfaz es linda — eso ya lo decidieron, o lo van a decidir, otros pipelines del
gremio. Juzga una sola cosa, y la juzga con evidencia: **¿un desarrollador senior ajeno a este
proyecto lo recibe y NO nota que hubo una IA de por medio?**

---

## Relación con app-craft y landing-craft — dónde termina cada uno

`app-craft` (modo Rescue, oficios `examiner`/`renovator`) y `landing-craft` (modo Rescue, oficios
`assessor`/`restorer`) reparan la **interfaz** de un producto mal construido: sistema de diseño,
arquitectura de componentes, estados faltantes, accesibilidad, motion, conversión. Son profundos y
específicos de frontend — necesitan Playwright, necesitan renderizar la pantalla, necesitan juzgar
si el producto SE VE y SE USA bien. Esa es la remediación de UI.

`delivery-craft` no juzga nada de eso — no tiene ni necesita Playwright. Es la capa de higiene
final que corre DESPUÉS, sobre **cualquier** producto, tenga frontend o no: una API, un CLI, un
script de datos, un backend sin una sola pantalla. No pregunta "¿esta pantalla está bien
diseñada?"; pregunta "¿queda algo en este repo que delate que una IA lo escribió sin que nadie lo
revisara, y falta algo que el cliente necesita para recibirlo?".

En la práctica: si el producto tiene UI y está mal construida, corré primero `app-rescue` o
`landing-rescue` — arreglan la causa de raíz de la interfaz. `delivery-craft` corre **siempre** al
final, haya habido un rescate de UI o no: es el paso previo a entregar, y cubre superficie que
ningún rescate de UI cubre — logs de debug en el backend, dependencias sin usar en todo el
monorepo, el README, el `.env.example`, el arranque desde un clone limpio.

---

## Los tres oficios

| # | Fase | Oficio | Qué hace | Produce | Puerta de salida |
|---|------|--------|----------|---------|------------------|
| 1 | Diagnóstico | `appraiser` | Inventaría cada rastro de IA y cada hueco de entrega con evidencia (ruta:línea o salida de herramienta), puntúa delivery-readiness. Solo lectura — no cambia una línea. | `docs/entrega/diagnostico.md` | Cada hallazgo tiene evidencia concreta; el puntaje y el veredicto están explícitos |
| 2 | Limpieza | `finisher` | Limpia de raíz en olas verificadas — red de seguridad primero, un commit por ola, verificando entre olas que nada se rompió. Nunca borra sin prueba de que no se usa. | rama con los commits de cada ola + rastro en `docs/entrega/` | Cada ola verificada (build/lint/test) antes de la siguiente; nada roto sin revertir |
| 3 | Puerta | `purser` | Verifica que está listo para el cliente: arranca desde un clone/checkout limpio, README ↔ realidad, `.env.example` completo, build/lint/test verdes. Firma o rechaza con la lista de lo que falta. | `docs/entrega/checklist-entrega.md` | Firma solo si el clone limpio corrió de verdad — o explica por qué no pudo, y qué queda sin probar |

## Cómo se ejecuta

**1 · Delegá cada fase a su oficio, en orden estricto.** Finisher no arranca sin el diagnóstico de
Appraiser; Purser no firma sin que Finisher haya cerrado (o documentado como deuda explícita) cada
ola.

**2 · Pasá los artefactos por disco.** `docs/entrega/diagnostico.md` → rama con commits +
`docs/entrega/` → `docs/entrega/checklist-entrega.md`. Cada oficio lee lo que el anterior escribió,
nunca un resumen de memoria.

**3 · Verificá la puerta de salida de cada fase antes de avanzar.** Un "listo" sin evidencia pegada
no cuenta en ninguna de las tres.

**4 · Para solo diagnóstico, sin tocar nada**, corré únicamente Appraiser — es lo que hace
`/entrega-diagnostico`: el inventario sin la limpieza.

## Reglas duras

**Red de seguridad primero** (`craft-core/references/safety-net.md`): Finisher no toca nada hasta
tener build/lint/test verdes de baseline. Si el proyecto no tiene tests, lo dice explícito y
procede con más cuidado — un smoke test de arranque como mínimo antes de la primera ola.

**Nunca borrar sin prueba de que no se usa.** knip/ts-prune/depcheck (TS/JS), vulture/unimport
(Python), deadcode/staticcheck (Go), o `grep` de referencias por todo el repo. Un "parece sin uso"
no alcanza — ver `craft-core/references/codebase-hygiene.md`.

**Olas verificadas, un commit por ola, verificar entre olas.** Si una ola rompe algo, se revierte
esa ola, no todo el trabajo previo.

**Fix de raíz, no cosmético** (ley 3). Un `console.log` comentado en vez de borrado, un `catch`
que ahora traga el error en silencio en vez de manejarlo — eso no cerró nada, lo escondió.

**Nada para después** (ley 1). Un `TODO`/`FIXME`/`XXX`/`HACK` que Finisher encuentra se resuelve o
se registra como deuda explícita con motivo — nunca desaparece en silencio.

**Docs se corrigen en el momento** (ley 10). Si el README dice algo que el clone limpio de Purser
demuestra falso, se corrige ahí mismo, no se anota para "después".

**Appraiser es READ-ONLY de verdad**: reporta, no cambia — ni una línea, ni un formateo "de paso".
**Purser tampoco cambia código**: verifica y firma; si algo falla en el clone limpio, es un
rechazo, no algo que arregla sobre la marcha.

**"Profesional" tiene una sola prueba**: si se lo entregás a un dev senior ajeno al proyecto,
¿lo recibe y no nota que hubo IA? Esa es la vara — no "parece prolijo", sino "no deja rastro".

---

## Qué NO hace este skill

**No rediseña la UI, no decide arquitectura, no elige stack.** Eso es trabajo de `app-craft`,
`landing-craft` y `system-craft` — este pipeline corre después de que esas decisiones ya están
tomadas.

**No es un rescate de UI/UX.** Para interfaces mal construidas están `app-rescue` y
`landing-rescue`, con su propia disciplina de olas (safety net → dead code → tokens →
de-duplicar → arquitectura → estados → a11y → performance). Este skill reutiliza esa doctrina de
olas y red de seguridad — no la reinventa — pero la aplica a la higiene de entrega, no al diseño.

**No inventa features ni corrige bugs de negocio fuera de la higiene de entrega.** Si Appraiser
encuentra un bug funcional real, lo registra como hallazgo — la corrección de fondo es del pipeline
que construyó esa pieza, no de `delivery-craft`.

**No reemplaza tests que no existen.** Si el proyecto no tiene suite de tests, Finisher lo dice y
opera con el smoke test mínimo — no simula cobertura que no hay.

---

## Recursos

| Ruta | Qué contiene |
|---|---|
| `agents/appraiser.md` | Diagnóstico read-only: inventario de rastros de IA y huecos de entrega, con evidencia y puntaje |
| `agents/finisher.md` | Limpieza en olas verificadas, un commit por ola, nunca borra sin prueba |
| `agents/purser.md` | Puerta de entrega: verifica y firma, con la prueba del clone limpio |
| `references/rastros-de-ia.md` | Catálogo detallado de cada tell, con el comando exacto para detectarlo por lenguaje |
| `craft-core/references/safety-net.md` | La red de seguridad que Finisher construye antes de tocar nada (reusada, no reescrita) |
| `craft-core/references/codebase-hygiene.md` | Las herramientas de código muerto y "nada quemado" que Appraiser/Finisher invocan |
| `craft-core/references/remediation.md` | La disciplina de olas verificadas que Finisher aplica |
| `craft-core/references/leyes-del-gremio.md` | Las 10 leyes que todo oficio respeta |
| `templates/guardrails/*.mjs`, `templates/guardrails/fitness/` | Herramientas ya disponibles que Appraiser/Finisher pueden invocar sobre el propio andamiaje del proyecto |
