# Fitness functions

## Qué es

Una **fitness function** es un chequeo ejecutable que verifica una propiedad ESTRUCTURAL de la
arquitectura — no un comportamiento de negocio. La diferencia con un test normal: un test de
negocio pregunta "¿esta función calcula bien el precio?"; una fitness function pregunta "¿el
código que calcula el precio sigue viviendo donde el diseño dice que tiene que vivir, y sigue sin
depender de lo que el diseño prohíbe que dependa?".

El término no es nuestro — viene de *Building Evolutionary Architectures* (Ford, Parsons,
Kua). La idea central que tomamos de ahí: una regla de arquitectura que sólo existe en un documento
(un ADR, un `ARQUITECTURA.md`) es una intención. La misma regla, convertida en un chequeo que corre
en CI y falla con nombre y línea exactos, es una PROPIEDAD del sistema. La diferencia entre las dos
es exactamente la diferencia entre "creemos que el dominio es puro" y "sabemos que el dominio es
puro, porque algo lo comprueba en cada commit".

## Cuándo usar esto en vez del linter

Un linter (ESLint, Biome, ruff, ...) opera sobre reglas SINTÁCTICAS: "esta línea tiene 81
caracteres", "esta variable no se usa", "falta un punto y coma". Es exactamente la herramienta
correcta para eso, y no hay que reemplazarla.

Una fitness function entra cuando la regla es SEMÁNTICA o ESTRUCTURAL y el linter no tiene forma de
expresarla sin convertirse en otra cosa:

- **"La capa de dominio no puede importar infraestructura."** Un linter no sabe qué carpeta es
  "dominio" ni qué import cuenta como "infraestructura" — eso es conocimiento del proyecto, no del
  lenguaje.
- **"Prohibido `float` en cálculos monetarios."** Un linter de tipos no distingue un `float` que
  representa dinero de uno que representa, por ejemplo, una coordenada.
- **"Toda entidad pública expone una función de fábrica, no un constructor directo."** Es una
  convención de diseño, no una regla del lenguaje.
- **"El artefacto publicado (el bundle, la imagen) cumple el contrato — no la fuente."** Ningún
  linter mira el `dist/`.

La señal para reconocer el caso: si para expresar la regla en el linter tendrías que escribir un
plugin custom, una regla de ESLint a medida, o un plugin de `ast-grep` — probablemente es más
simple, más legible y más fácil de mantener como un checker de AST propio de 40-80 líneas que vive
junto a los tests.

## Cómo se escribe una

1. **Identificá la propiedad, en una frase.** "El dominio no importa infraestructura." Si no
   podés decirlo en una frase, todavía no está lista para convertirse en chequeo.
2. **Recorré el AST real — no grep, no una lista de strings.** Un `grep -r "import fastapi"` se
   engaña con un comentario, con un string, con una importación dentro de un docstring. Parsear el
   árbol sintáctico (`ast` en Python, un parser de imports en TS/JS) es la diferencia entre un
   chequeo que se puede confiar y uno que dice que sí cuando en realidad no miró.
3. **Las prohibiciones son una CONSTANTE explícita, arriba del archivo.** No una regla implícita
   enterrada en un `if`. Alguien que llega nuevo tiene que poder leer la lista completa en 10
   segundos.
4. **El mensaje de error señala archivo + línea + motivo — nunca sólo "violación encontrada".**
   Ver `templates/guardrails/README.md`, "Anatomía de un guardrail": la misma disciplina aplica acá.
5. **Vive junto a los tests, no en `src/`.** Es tooling de verificación, no código de producción —
   por eso `pureza-dominio.py`/`.mjs` van en `tests/arquitectura/` o `scripts/`, no en el árbol de
   dominio que están vigilando.
6. **Se prueba a sí misma.** Un checker sin un test que confirme que SÍ detecta la violación (con
   una fixture que la comete a propósito) es una afirmación de fe. Ver `test_dominio_es_puro.py` en
   el proyecto de origen para el patrón: un test por cada prohibición, cada uno con
   una fixture temporal que la viola.

## Los dos checkers de este kit

`pureza-dominio.py` y `pureza-dominio.mjs` implementan la MISMA fitness function — "el dominio no
importa infraestructura" — en Python y en TypeScript/JavaScript respectivamente. Los dos:

- Recorren el árbol de sintaxis real (AST en Python vía `ast`; análisis de imports por archivo en
  TS/JS, ya que un AST completo de TS requiere el compilador — ver el comentario en
  `pureza-dominio.mjs` sobre esa decisión).
- Declaran la lista de imports prohibidos como una constante configurable, arriba del archivo.
- Devuelven una lista de violaciones con archivo + línea + motivo — nunca un booleano.
- Salen con exit code 1 si hay al menos una violación, 0 si el árbol está limpio.

Adaptalos completando la constante de prohibiciones y la ruta de la carpeta de dominio del proyecto.
