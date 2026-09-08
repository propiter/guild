---
description: Diagnóstico de seguridad sin explotación — modelo de amenazas y superficie de ataque, confirmando primero que el objetivo es propio. Solo Sentinel; sin Breaker, sin cambios. El mapa sin el ataque.
argument-hint: "[objetivo a mapear, ej: 'mi API en localhost:3000' — vacío = el proyecto actual]"
---

Mapeá la seguridad de este objetivo, sin atacarlo: **$ARGUMENTS**

Cargá el skill `security-craft` y delegá **solo** a `sentinel`. **No corras `breaker`, `warden` ni
`locksmith`** — esta es la variante de solo diagnóstico, para quien quiere el mapa antes de decidir
si quiere el ataque.

> Esto SOLO opera contra sistemas del propio usuario: su entorno local, de desarrollo o de
> staging, sin datos reales de terceros.

Sentinel:
1. **Confirma la propiedad del objetivo**, con evidencia concreta — o se niega y lo explica en una
   frase, y ahí termina el comando.
2. Modela amenazas: actores, activos, fronteras de confianza, qué pasa si cada una cede.
3. Inventaria la superficie de ataque con evidencia real (ruta, archivo, comando) — nunca una
   afirmación sin origen.
4. Prioriza los objetivos que Breaker atacaría, ordenados por impacto × facilidad de alcance, con
   el motivo de cada prioridad — sin ejecutar nada de eso.

Es de solo lectura: no cambia una línea de código, no manda un payload, no muta estado.

Terminá con: la confirmación (o el rechazo) primero y en texto plano, el resumen del modelo de
amenazas, y la lista priorizada. Si el usuario quiere el ataque real después de ver el mapa, el
siguiente paso es `/seguridad`.
