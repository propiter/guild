---
description: Auditar un proyecto existente contra el método — qué fases faltan, qué convenciones están implícitas, qué reglas no tienen mecanismo que las haga cumplir. READ-ONLY.
argument-hint: "[ruta del proyecto — vacío = el directorio actual]"
---

Auditá este proyecto: **$ARGUMENTS**

Cargá el skill `system-craft` y delegá a `inspector`. **Es de solo lectura: no cambia nada, ni un
arreglo de formato.**

Prestá atención especial a los tres hallazgos que más se repiten:
1. **Divergencia entre el comando local de verificación y el CI** — extraé ambos y comparalos en orden.
2. **Convenciones implícitas** — dos módulos equivalentes con formas distintas significan un molde que vive en la cabeza de alguien.
3. **Reglas sin mecanismo** — cada regla de la documentación sin linter, guardrail o fitness function detrás se cumple solo por memoria.

Cada hallazgo lleva evidencia: ruta y línea, o salida de comando. El plan va ordenado **por
dependencia técnica**, no por severidad. `inspector` no tiene `Write` ni `Edit`: el veredicto y el
plan vuelven en el chat, no en un archivo.
