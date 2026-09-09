# Contribuir al gremio

El gremio es coherente porque cada pieza nueva respeta la forma de las que ya existen. Esta guía
es esa forma, para que agregar algo no la rompa.

Antes de escribir una línea, leé [`skills/craft-core/references/leyes-del-gremio.md`](skills/craft-core/references/leyes-del-gremio.md).
Las 10 leyes aplican a **todo** lo que se agrega — un oficio nuevo, un pipeline nuevo, un fix — sin
excepción. Un aporte que las rompe no está terminado, aunque el resultado "funcione".

---

## Cómo agregar un oficio nuevo

Un oficio es un archivo en `agents/*.md`. Tiene cuatro partes obligatorias, en este orden:

### 1. El frontmatter

```yaml
---
name: <nombre-del-oficio>
description: <qué hace, cuándo se dispara, qué lee, qué escribe>
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---
```

Cuatro claves, ni una menos: `name`, `description`, `tools`, `model`. `tools` lista solo lo que
el oficio necesita de verdad — un oficio de solo diagnóstico (como `appraiser` o `inspector`) no
lleva `Write`/`Edit` de código, para que la restricción sea mecánica, no una promesa.

**La `description` no lleva `:` seguido de espacio, y por eso no necesita comillas.** YAML sin
comillas rompe apenas encuentra `": "` porque lo interpreta como separador de mapeo. La
convención del gremio (mirá `agents/scout.md`, `agents/sentinel.md`, `agents/appraiser.md`) es
escribir la descripción entera sin ese patrón — usá `·` o `—` donde te tentaría un `:`. Un
`ruta:línea` sin espacio después del `:` es seguro; un `Hace esto: lo otro` no lo es sin comillas.

```
# Bien (sin comillas, sin ": ")
description: Fase 2 de mi-pipeline · Construcción. Lee docs/mi-pipeline/spec.md; escribe el código.

# Mal (rompe YAML estricto sin comillas)
description: Fase 2 de mi-pipeline: construcción. Lee la spec y escribe el código.
```

Si tu descripción necesita un `:` con espacio porque no hay forma clara de evitarlo (pasa en
inglés más seguido que en español), envolvela en comillas dobles — pero preferí reescribir la
frase primero.

### 2. El nombre del oficio

**Nombre propio, sin prefijo, único en todo el gremio.** No `system-mason` ni `mason-2` — los
oficios son nombres de rol (`architect`, `warden`, `cartographer`), como en un gremio real, no
identificadores técnicos. Antes de nombrar el tuyo:

```bash
grep -i "^name: <tu-nombre-candidato>" agents/*.md
grep -i "<tu-nombre-candidato>" docs/OFICIOS.md
```

Si aparece, elegí otro nombre. Los 46 oficios actuales viven en un solo espacio
(`~/.claude/agents/`) — dos con el mismo nombre y uno pisa al otro en tiempo de instalación, no
en tiempo de revisión, que es el peor momento para descubrirlo.

### 3. El bloque de leyes

Justo después del segundo `---` del frontmatter, antes de cualquier instrucción propia del
oficio:

```markdown
> **Leyes del gremio (innegociables).** Cero gaps · cero bugs · cero parches — todo de RAÍZ.
> Limpio, escalable, ordenado, fácil de depurar. Seguro por defecto. Probado, no prometido
> (RED→GREEN; "terminado" = verificado contra su contrato). **Investigá; no adivines** —fuentes
> confiables y el código real, la mejor decisión para ESTE proyecto. **La doc no miente ni
> envejece** —si algo salió distinto a lo documentado, se corrige en el momento, nada para después.
> Verde no es correcto. Detalle en
> [`craft-core/references/leyes-del-gremio.md`](../skills/craft-core/references/leyes-del-gremio.md).
```

Copialo tal cual de cualquier oficio existente (`agents/scout.md`, `agents/mason.md`,
`agents/sentinel.md`) — no lo reescribas ni lo resumas distinto. Es el mismo bloque en los 46
oficios; que el 47 diga otra cosa es la primera grieta.

### 4. El cuerpo

Precondiciones (qué necesita que exista antes de arrancar), qué hace paso a paso, y la puerta de
salida — el criterio verificable que separa "el oficio corrió" de "el oficio terminó su trabajo".
Un oficio sin puerta de salida verificable no es distinto de una sugerencia.

### 5. Registralo

Agregá la fila a [`docs/OFICIOS.md`](docs/OFICIOS.md), bajo el pipeline al que pertenece, con su
fase y una descripción de una línea. Ese registro es lo que hace que el sistema sea depurable
aunque los nombres sean evocativos — si alguien ve tu oficio en un log, `OFICIOS.md` tiene que
decirle qué hace sin que abra el archivo del agente.

Si el oficio se invoca también por comando directo (no solo delegado desde un pipeline), agregá
el archivo correspondiente en `commands/`.

---

## Cómo agregar un pipeline nuevo

Un pipeline nuevo son cuatro piezas que tienen que quedar coherentes entre sí:

1. **El skill** — `skills/<nombre>-craft/SKILL.md`, con el mismo frontmatter (`name`,
   `description`, `license`, `metadata.author`, `metadata.version`) que los cinco existentes.
   Documentá ahí las fases, la tabla fase→oficio, cómo se ejecuta, y qué NO hace el pipeline —
   esa sección existe en los cinco actuales y evita que alguien le pida algo que no le
   corresponde.
2. **Los oficios** — un `agents/*.md` por fase, siguiendo la guía de arriba. Nombres únicos,
   bloque de leyes, puerta de salida.
3. **El o los comandos** — `commands/<nombre>.md` (el insignia) y, si el pipeline lo justifica,
   sus variantes (`-audit`, `-new`, `-status`, etc., como hace cada pipeline existente).
4. **Registralo en dos lugares más:**
   - [`docs/OFICIOS.md`](docs/OFICIOS.md) — una sección nueva con la tabla de oficios del
     pipeline, igual que las cinco que ya están.
   - **El índice de `install.sh`** — la función que mapea el nombre del skill al nombre corto
     que usa el flag `--only` (cerca de la línea 75, `case` con `landing-craft) echo
     landing;;` etc.). Un pipeline sin esa entrada no es instalable a demanda ni queda
     excluido por `--only` — se instala siempre o nunca, y ninguna de las dos es correcta.

Si el pipeline comparte doctrina con `landing-craft`/`app-craft` (la barra de producción,
contraste medido, gestión de deuda técnica), evaluá si el lugar correcto es `craft-core` en vez
de duplicarla — esa fue la decisión que separó `craft-core` de los otros dos pipelines cuando se
notó que estaban repitiendo la misma doctrina dos veces.

Por último, actualizá [`docs/PIPELINES.md`](docs/PIPELINES.md): dónde encaja el pipeline nuevo en
la coreografía — con qué se encadena antes y después — y `README.md` si el conteo de oficios o
la tabla de pipelines cambió.

---

## La regla de oro

**Corré `bash scripts/verify.sh` en verde antes de cualquier PR.**

No es una formalidad: es el gremio aplicándose sus propias leyes. `system-craft` exige que todo
proyecto que construye tenga un comando `verify` que reproduce exactamente lo que corre el CI, en
el mismo orden — este repositorio no es la excepción. Un PR que no corrió `verify` es un PR que
no sabe si rompió algo, y "no lo sé" no es un veredicto que el gremio acepte de sí mismo.

Si `verify` falla, arreglalo de raíz (ley 3) — no comentés el check que falla ni le bajés la
severidad para que pase. Si el fallo es un falso positivo genuino, corregí el check, no lo
rodees.

---

## Las 10 leyes aplican a todo lo que agregues

Sin excepción, y sin importar si tocás un oficio, un pipeline, esta documentación, o un script.
Las tres que más se rompen al contribuir rápido:

- **Cero parches (ley 3).** Si copiás un bloque de otro oficio y no entendés por qué dice lo que
  dice, no lo pegues — leé el original primero. Un bloque de leyes copiado mal es peor que no
  copiarlo, porque parece correcto en el diff.
- **Nombres únicos, cero duplicación (ley 4).** Verificá contra `docs/OFICIOS.md` y `agents/*.md`
  antes de nombrar algo, no después de escribirlo.
- **La documentación no miente ni envejece (ley 10).** Si tu cambio hace que algo de
  `docs/OFICIOS.md`, `docs/PIPELINES.md` o el `README.md` deje de ser cierto, corregilo en el
  mismo PR — no lo dejes para "después", porque después es el momento en que alguien sin
  contexto le va a creer.

Texto completo de las 10 en
[`skills/craft-core/references/leyes-del-gremio.md`](skills/craft-core/references/leyes-del-gremio.md).
