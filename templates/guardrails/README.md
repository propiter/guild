# Qué es un guardrail, y cuándo escribir uno

## La regla que separa un guardrail de una ocurrencia

> **Un guardrail nace de un fallo REAL que ya ocurrió — nunca de una hipótesis.**

No se escribe un guardrail porque "podría pasar que...". Se escribe porque YA pasó: un push rompió
`main`, un PR se mergeó con una vulnerabilidad, un smoke test dio verde con la aplicación
respondiendo 500. Cada script de esta carpeta es la cicatriz de un incidente concreto, convertida en
un chequeo que corre en menos de un segundo.

¿Por qué esta disciplina y no "vamos a blindar todo lo que se nos ocurra"? Porque un guardrail
hipotético tiene un costo que uno real no tiene: nadie sabe si el modo de falla que previene es
plausible, así que nadie sabe si vale la pena mantenerlo cuando estorba. Un guardrail que nació de
un incidente documentado se puede evaluar: "¿esto volvería a pasar si lo saco?" tiene una respuesta,
porque ya pasó una vez. Sin esa ancla, la carpeta `scripts/` se llena de candados que nadie se anima
a tocar ni a borrar, y ESO es la deuda que este documento existe para evitar.

Corolario práctico: si estás por escribir un guardrail y no podés completar la frase *"esto falló
así, el día tal, y se vio de esta forma"*, todavía no es momento de escribirlo. Anotá el riesgo en
otro lado (un comentario, un ticket) y esperá a que se materialice — o a que alguien más lo
confirme con una medición, no con una intuición.

## Anatomía de un guardrail

Todos los scripts de esta carpeta comparten el mismo esqueleto. No es casualidad: un guardrail que
no se puede leer en 30 segundos no se mantiene, se rodea.

```
#!/usr/bin/env node
/**
 * [Una frase: qué verifica, en modo afirmativo — "Verifica que X".]
 *
 * POR QUÉ EXISTE
 * ──────────────
 * [El fallo REAL. Cuándo pasó, qué se vio en pantalla, cuánto costó. Si hay
 *  un número —un PR, una fecha, un mensaje de error textual— va acá. Esto es
 *  lo que hace que el guardrail sea evaluable seis meses después.]
 *
 * QUÉ MIDE (y qué NO mide)
 * ─────────────────────────
 * [El mecanismo exacto. Y, con la misma prioridad, el límite: qué clase de
 *  fallo se le escapa a propósito, para que nadie lo lea como más blindaje
 *  del que da.]
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * [La razón estructural: el linter no ve dos archivos a la vez, el tipo no
 *  distingue una URL correcta de una copiada, el test unitario no levanta
 *  infraestructura real. Si esta sección queda vacía, probablemente el
 *  guardrail debería ser una regla de lint, no un script aparte.]
 */

// ── el chequeo ──────────────────────────────────────────────────────────────
// ...

// ── salida clara: qué falló y QUÉ HACER para arreglarlo ─────────────────────
if (problemas.length > 0) {
  console.error("...");           // qué está mal, con nombres y rutas concretas
  console.error("Para arreglarlo: ..."); // la ACCIÓN, no sólo el diagnóstico
  process.exit(1);
}
console.info("✓ ...");
process.exit(0);
```

Cuatro partes que no son opcionales:

1. **Cabecera con el POR QUÉ + el fallo real que lo originó.** Sin esto, en seis meses nadie sabe
   si el guardrail sigue siendo necesario o es una reliquia. El primer candidato a borrar cuando
   algo estorba es el guardrail sin motivo escrito — y si el motivo real seguía vivo, se pierde con
   él.
2. **Chequeo.** El mecanismo. Preferentemente una función pura y testeable por separado del
   `process.exit` (ver `check-audit.mjs`: `clasificar()` se prueba con casos sintéticos ANTES de
   tocar la red real).
3. **Salida clara.** Un mensaje que dice qué falló CON NOMBRES — el archivo, la línea, el
   comando — nunca "algo salió mal". Y la acción para arreglarlo, no sólo el síntoma.
4. **Exit code.** `0` en verde, `1` en rojo, sin ambigüedad. Ninguna rama de "no pude
   averiguarlo" devuelve éxito — un guardrail que falla abierto ante la incertidumbre no es un
   guardrail, es una ilusión de seguridad.

## Los guardrails de este kit

| Script | Qué previene | Modo de falla exacto |
|---|---|---|
| `check-ci-parity.mjs` | Que `verify` local y CI diverjan | CI suma un paso (o cambia el orden); `verify` se queda atrás; un `verify` verde en local deja `main` en rojo |
| `check-version-pairs.mjs` | Paquetes que DEBEN compartir versión exacta y se desalinean | Un provider/peer lee internals de otro paquete; un desalineamiento no falla al instalar, falla en runtime con un stack trace que no menciona versiones |
| `check-lint-config.mjs` | Que el linter descarte su config en silencio | Un archivo de config no parsea (ej. un comentario donde no se admite); el linter sigue con los defaults, el lint queda verde revisando casi nada |
| `check-dockerfile-copies.mjs` | Que un Dockerfile copie una ruta que ya no existe | Renombrar/mover un archivo de la raíz; el build de imagen falla en OTRO workflow, con un mensaje de hashes que no nombra el archivo |
| `check-test-tasks.mjs` | Un archivo de test que ninguna tarea alcanzada por `verify` ejecuta | Un paquete nombra su suite distinto a la convención (`test` en vez de `test:coverage`); la suite existe, nadie la corre, cero errores en ningún lado |
| `check-audit.mjs` | Confundir "hay una vulnerabilidad" con "el registry no contestó" | Un timeout de red hace fallar el audit igual que una vulnerabilidad real; el gate se vuelve una lotería y el equipo deja de confiar en él |
| `fitness/pureza-dominio.py` / `.mjs` | Que la capa de dominio importe infraestructura | El linter no tiene una regla para "prohibido importar `fastapi` en `dominio/`"; sin un checker de AST propio, la única defensa es la disciplina de quien escribe el código |

## Meta-testing: los guardrails tienen sus propios guardrails

Un guardrail que no se prueba a sí mismo es una afirmación de fe. Dos ejemplos de esta carpeta:

- `check-lint-config.mjs` usa DOS señales independientes (una del linter, una del formateador) — no
  una sola, porque una señal puede fallar por un motivo distinto al que el guardrail dice medir.
- El bucle de reintento de `auditor.yml` (429 vs. 5xx) se prueba con `curl` y `sleep` STUBEADOS,
  afirmando el comportamiento exacto de cada rama — no la presencia de un string en el archivo.
  Ver `check-auditor-reintento.mjs` en el repo de origen como el ejemplo a imitar si tu CI
  tiene un bucle de reintento contra un servicio externo.

La pregunta que hace falta hacerse al escribir un guardrail nuevo: *si mutara la línea que este
script protege, ¿el guardrail se pondría rojo, o seguiría en verde por otro motivo?* Si no podés
responder eso con confianza, el guardrail no prueba lo que dice probar — y un canario que no
discrimina el mutante que motiva su existencia es peor que no tener canario: da falsa confianza.

## Guardrails de dominio — no portados, para imitar

Algunos guardrails de los proyectos fuente son 100% específicos de su dominio. No se portan a este
kit porque copiarlos sin el contexto que los originó produciría candados sobre reglas de negocio que
no existen acá. Se documentan como EJEMPLO A IMITAR:

- **`check-migraciones.mjs`** — sella con SHA-256 las migraciones de Drizzle ya aplicadas y
  bloquea que se reescriban una vez que hay datos de clientes irrecuperables. El patrón a copiar:
  una constante explícita (`EPOCA`) que declara el régimen vigente, cambiada a mano y vista en el
  diff — no inferida.
- **`check-config-duplicada.mjs`** — impide que un test escriba a mano una cadena de conexión
  en vez de importar la función que la construye. El patrón a copiar: la exención es por PATRÓN,
  no por archivo completo — un archivo exento de un chequeo no debería heredar la exención de todos
  los demás.
- **Aislamiento entre tenants (RLS), ejercido en el job `integracion` de `ci.yml`** — no es un
  script de `scripts/`, es una suite de tests contra Postgres real. El patrón a copiar: un mock NO
  puede probar esto — una política RLS mal escrita se ve idéntica contra un mock.

## Cuándo NO escribir un guardrail

- Si el linter ya puede expresar la regla (una regla de ESLint/Biome/ruff existente cubre el caso):
  usá el linter. Un guardrail a medida para lo que el linter ya hace es mantenimiento duplicado.
- Si el fallo es hipotético y no tiene un incidente real detrás: esperá. Ver la regla del principio.
- Si la regla es de negocio pero el linter NO la puede expresar (tipos, imports prohibidos,
  invariantes estructurales): ahí es donde entra una **fitness function** — ver `fitness/README.md`.
