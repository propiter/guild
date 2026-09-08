<!--
  Completá lo que aplique. Un checklist sin marcar no es un PR listo para
  review — es trabajo a medio hacer con una etiqueta encima.
-->

## Qué hace este PR

<!-- Una o dos frases. Si necesitás un párrafo largo, el PR probablemente
     hace más de una cosa y debería partirse. -->

## Por qué

<!-- Qué problema resuelve, o qué fallo real motivó el cambio. Si es un
     guardrail nuevo: ¿cuál fue el modo de falla que ya ocurrió? -->

## Cómo probarlo

<!-- Pasos concretos, no "correr los tests". Si agregaste un guardrail,
     decí qué mutación lo pone en rojo. -->

## Definition of Done

- [ ] `pnpm verify` (o el equivalente del perfil) pasa local, de punta a punta
- [ ] Si sumé un paso a CI, lo sumé también a `verify` en el MISMO commit
- [ ] Tests nuevos para el comportamiento nuevo — no sólo para el happy path
- [ ] Sin código muerto ni exports sin usar
- [ ] Sin `console.log` / `print` de depuración olvidados
- [ ] Documentación actualizada si el cambio afecta un contrato público
- [ ] **El diff tiene menos de 400 líneas.** Si no entra, es un candidato a
      partirse en PRs encadenados (ver `chained-pr` / `work-unit-commits`)
      antes de pedir review — no un permiso para que el reviewer lea más rápido.
- [ ] Si toca un path crítico (auth, multi-tenant/RLS, workflows, secretos):
      lo digo explícitamente acá, aunque El Auditor no lo marque

## Riesgo

<!-- Bajo / Medio / Alto, y por qué. Un PR que toca infraestructura de
     despliegue o aislamiento entre tenants es Alto aunque el diff sea chico. -->

## Capturas / evidencia

<!-- Si aplica: antes/después, salida de un comando, log del smoke test. -->
