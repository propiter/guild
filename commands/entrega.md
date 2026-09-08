---
description: El insignia del pipeline de entrega — diagnostica rastros de IA y huecos de entrega, limpia de raíz en olas verificadas, y firma (o rechaza) que el producto está listo para el cliente probándolo desde un clone limpio.
argument-hint: "[qué entregar, ej: 'el backend de facturación' — vacío = el proyecto actual]"
---

Dejá listo para entregar: **$ARGUMENTS**

Cargá el skill `delivery-craft`.

Corré los cuatro oficios, en orden estricto, delegando cada uno y pasando los artefactos hacia
adelante por disco:

1. **diagnóstico** — `appraiser`: inventaría cada rastro de IA (logs de debug, comentarios que
   sobran, código muerto, TODOs huérfanos, dependencias sin usar, placeholders, nombres perezosos,
   números mágicos, `catch` vacíos, secretos commiteados) y cada hueco de entrega (README,
   `.env.example`, build/lint/test), cada hallazgo con evidencia ruta:línea o salida de
   herramienta. Puntúa y prioriza el plan de olas para `finisher`. No toca una sola línea.
2. **limpieza** — `finisher`: red de seguridad primero (baseline build/lint/test verde), después
   cada ola del plan de `appraiser` con su propio commit, verificando entre olas que nada se
   rompió. Nunca borra sin prueba de que no se usa. Si una ola rompe algo, revierte esa ola, no
   todo el trabajo previo.
3. **prueba integral** — `proctor`: levanta el producto real (no mocks) y corre la suite completa
   (unit/integración/e2e) contra el sistema corriendo. Recorre cada journey primario con Playwright
   cazando errores de consola, requests fallidos y flujos cortados; si hay UI, dispara el gate
   visual delegando en `design-review-loop` (no lo reinventa); barre el copy en busca de typos y
   placeholders. Sin UI, salta el gate visual explícitamente y prueba contratos/comandos reales.
   Solo lectura sobre el código — reporta cada hallazgo con severidad y da GO/NO-GO; los
   bloqueantes vuelven a `finisher` o al builder que corresponda.
4. **puerta de entrega** — `purser`: verifica que está listo para el cliente — README vs realidad,
   `.env.example` completo sin secretos, `.gitignore` sano, build/lint/test verdes, y la prueba
   dura: arranca desde un clone/checkout limpio de verdad. No firma si `proctor` dejó un
   bloqueante abierto. Firma o rechaza con la lista exacta de lo que falta.

**Verificá la puerta de salida de cada fase antes de avanzar.** La que más se salta:

- Fase 1: ¿cada hallazgo tiene ruta:línea o salida de herramienta, o es una impresión?
- Fase 2: ¿el baseline estaba verde ANTES de la primera ola? ¿cada ola tiene su propio commit y su
  propia verificación antes/después?
- Fase 3: ¿el producto quedó levantado de verdad (no mocks)? ¿cada hallazgo tiene severidad y
  evidencia real, y el veredicto GO/NO-GO surge de lo que corrió, no de una suposición?
- Fase 4: ¿la prueba fue desde un clone limpio de verdad, o desde el directorio de trabajo ya
  usado?

Cero deuda silenciosa: un `TODO` o un hallazgo que no se pudo cerrar en esta pasada queda
registrado como deuda explícita en `docs/entrega/`, nunca enterrado.

Terminá con: el veredicto de `purser` primero (firmado o rechazado), el puntaje de `appraiser`,
las olas que corrió `finisher` con su verificación antes/después, el veredicto GO/NO-GO de
`proctor` con sus hallazgos por severidad, y —si `purser` rechazó— la lista exacta de lo que
falta.
