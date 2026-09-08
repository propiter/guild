---
description: Diagnóstico de delivery-readiness sin tocar nada — inventario de rastros de IA y huecos de entrega, con evidencia y puntaje. Solo appraiser, sin finisher ni purser. El diagnóstico antes de decidir si limpiás.
argument-hint: "[qué diagnosticar, ej: 'el backend de facturación' — vacío = el proyecto actual]"
---

Diagnosticá si esto está listo para entregar, sin tocar nada: **$ARGUMENTS**

Cargá el skill `delivery-craft` y delegá **solo** a `appraiser`. **No corras `finisher` ni
`purser`** — esta es la variante de solo diagnóstico, para quien quiere ver el inventario completo
antes de decidir si vale la pena limpiar.

Appraiser:
1. Detecta el lenguaje/stack real del proyecto — no lo asume.
2. Inventaría cada rastro de IA y cada hueco de entrega, categoría por categoría, con evidencia
   (ruta:línea o salida de herramienta) — nunca una afirmación sin origen.
3. Corre build/lint/typecheck/test reales del proyecto (los que lee del manifiesto, no genéricos)
   y pega el resultado tal cual salió.
4. Puntúa cada categoría y da el veredicto: listo / una ola / varias olas / no listo.
5. Prioriza el plan de olas que `finisher` correría después — sin ejecutar ninguna.

Es de solo lectura: no borra una línea, no edita nada, no corre limpieza.

Terminá con: el puntaje y el veredicto primero, el inventario categorizado con evidencia, y —si el
usuario quiere la limpieza real después de ver el diagnóstico— el siguiente paso es `/entrega`.
