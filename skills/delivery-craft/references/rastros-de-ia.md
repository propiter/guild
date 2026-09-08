# Rastros de IA — catálogo de detección por lenguaje (load en appraiser + finisher)

Cada tell de esta lista tiene un comando concreto para encontrarlo — nunca "se nota a simple
vista". `appraiser` corre estos comandos y pega la salida cruda como evidencia; `finisher` los
vuelve a correr después de cada ola para confirmar que el tell desapareció. Adaptá las rutas
(`src/`, `app/`, lo que corresponda) al proyecto real — no copies el comando a ciegas si la
estructura es distinta.

Los ejemplos cubren TypeScript/JavaScript, Python y Go — la traducción a otro lenguaje sigue el
mismo patrón: grep del literal cuando alcanza, herramienta del ecosistema cuando la señal es
estructural (uso real, no solo texto).

---

## 1 · Logs de debug

| Lenguaje | Comando |
|---|---|
| TS/JS | `grep -rn 'console\.\(log\|debug\|trace\)\|debugger' src/ --include='*.ts*' --include='*.js*' \| grep -v '\.test\.'` |
| Python | `grep -rn 'print(\|pdb\.set_trace()\|breakpoint()\|import pdb' --include='*.py' .` |
| Go | `grep -rn 'fmt\.Print\(ln\|f\)\?(' --include='*.go' . \| grep -v '_test.go'` |
| PHP | `grep -rnE 'var_dump\(|dd\(|dump\(|print_r\(' --include='*.php' .` |

No cuenta como falso positivo un logger estructurado real (`logger.info`, `pino`, `winston`,
`logging.getLogger`) — el tell es el `console.log`/`print()` de depuración ad-hoc, no el logging
en sí.

## 2 · Comentarios que sobran

No hay grep perfecto para "esto es obvio" — es juicio, pero con un filtro mecánico primero:

```bash
# Comentarios de una línea que empiezan igual que la línea de código siguiente
# (fuerte señal de "explica lo que hace", no "por qué")
grep -rn '// .*$' src/ --include='*.ts*' | wc -l   # densidad total, para ver si hay exceso

# Banners de sección grandes (posible "la IA se está explicando")
grep -rn '^\s*//\s*=\{5,\}\|^\s*#\s*-\{5,\}' -r src/
```

El criterio real: leé una muestra. Un comentario que dice *qué* hace la línea de abajo (`// suma
uno a i`) sobra siempre. Un comentario que dice *por qué* una decisión no obvia se tomó así, se
queda.

## 3 · Código comentado y código muerto

```bash
# Bloques grandes de código comentado (no docstrings/JSDoc)
grep -rnE '^\s*(//|#)\s*(const|let|var|function|def|class|if|for)\b' src/

# TS/JS — el mejor punto de partida, subsume la mayoría de lo demás
npx knip
npx ts-prune          # segunda opinión sobre exports sin uso
npx depcheck          # dependencias declaradas y no usadas
npx madge --circular --extensions ts,tsx src/

# Python
vulture . --min-confidence 80
python -m pyflakes .
ruff check --select F401,F841 .    # imports y variables sin usar

# Go
go vet ./...
staticcheck ./...
deadcode ./...        # golang.org/x/tools/cmd/deadcode
```

Regla dura antes de borrar: la herramienta marca → `grep` del nombre completo y del basename por
todo el repo (incluye imports dinámicos, referencias por string, config) → confirmar que no es una
convención de framework (`middleware.ts`, migraciones, `__init__.py`, archivos que el build
consume por convención) → recién ahí borrar.

## 4 · TODO/FIXME/XXX/HACK sin resolver

```bash
grep -rn 'TODO\|FIXME\|XXX\|HACK' --include='*.ts*' --include='*.py' --include='*.go' .
```

Cada resultado se clasifica en el diagnóstico: **resuelto en esta pasada** o **deuda explícita
registrada** con motivo — nunca queda como hallazgo mudo sin destino.

## 5 · Dependencias sin usar

```bash
npx depcheck                      # TS/JS: no usadas + faltantes en package.json
pip-audit --desc 2>/dev/null; pipdeptree --warn silence | grep -i unused  # o:
pip install pip-check; pip-check  # Python, según el manejador (pip/poetry/uv)
go mod tidy -v                    # Go: reporta qué se agrega/quita
```

## 6 · Placeholders / scaffolding

```bash
grep -rniE 'lorem ipsum|foo(bar)?\b|todo:? replace|your[- ]?(name|company|api[- ]?key)|example\.com|placeholder' \
  --include='*.ts*' --include='*.py' --include='*.go' --include='*.md' .
```

Incluye READMEs boilerplate sin editar (el de `create-next-app`, el de `cookiecutter` sin tocar) y
código de demo que quedó del scaffold inicial sin limpiar.

## 7 · Nombres genéricos / perezosos

```bash
grep -rnE '\b(data2?|temp|tmp|result|res|foo|bar|myVar|handleClick[0-9]|testFn)\b' \
  --include='*.ts*' --include='*.py' --include='*.go' src/
```

Complementalo con una lectura de los nombres de módulo: un `utils.ts`/`helpers.py` con más de
diez funciones sin relación entre sí es una señal de "cajón de sastre", aunque el grep no lo
detecte.

## 8 · Convenciones mezcladas / formato inconsistente

```bash
# camelCase y snake_case conviviendo en el mismo árbol
grep -rnE '\b[a-z]+_[a-z]+\b' src/ --include='*.ts*' | grep -v '\.test\.'
grep -rnE '\b[a-z]+[A-Z][a-zA-Z]*\b\s*=' --include='*.py' .

# Formateador aplicado de verdad (debería salir limpio)
npx prettier --check .    # TS/JS
ruff format --check .     # Python
gofmt -l .                # Go — lista archivos NO formateados
```

## 9 · Números mágicos

```bash
grep -rnE '[^a-zA-Z0-9_.](0\.[0-9]+|[2-9][0-9]{2,})[^a-zA-Z0-9_.]' src/ --include='*.ts*' \
  | grep -vE 'test|spec|\.config\.'
```

Un literal que aparece en lógica de negocio (un porcentaje, un umbral de tiempo, un límite de
filas) sin nombre ni comentario que explique su unidad es el tell — no todo número es magic
number (un `for (let i = 0; ...)` no cuenta).

## 10 · Duplicación copy-paste

```bash
npx jscpd src --min-lines 10 --threshold 0     # TS/JS/casi cualquier lenguaje de texto
```

`jscpd` es agnóstico del lenguaje — sirve igual para Python o Go con `--include`.

## 11 · Archivos basura

```bash
find . -name '.DS_Store' -o -name '*.swp' -o -name 'Thumbs.db' -o -name '*.orig'
find . -maxdepth 2 -iname 'test.js' -o -iname 'scratch.*' -o -iname 'temp.*'
git status --porcelain --ignored | grep -v '^!!' # rastrea qué se coló al índice
```

Configs de editor commiteadas (`.vscode/` con settings personales, `.idea/`) también entran acá —
verificá que `.gitignore` ya las cubra.

## 12 · Secretos / keys commiteados

```bash
grep -rnE "sk_(live|test)_[a-zA-Z0-9]+|AKIA[0-9A-Z]{16}|api[_-]?key['\"]?\s*[:=]\s*['\"][a-zA-Z0-9]{16,}" .
grep -rn 'NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*KEY' src/    # secreto expuesto al cliente por prefijo
cat .env 2>/dev/null | grep -v '^#' | grep -v '^\s*$'      # ¿.env commiteado con valores reales?
```

Cualquier resultado positivo acá es **urgente** — no espera al orden de olas de `finisher`.

## 13 · `catch`/`except` vacíos o errores tragados

```bash
grep -rnA1 'catch\s*(.*)\s*{' src/ --include='*.ts*' | grep -B1 '^\s*}\s*$'
grep -rnA1 'except.*:' --include='*.py' . | grep -B1 '^\s*pass\s*$'
grep -rn 'if err != nil {\s*}' --include='*.go' .
```

Un bloque que captura el error y no hace nada —ni loguea, ni re-lanza, ni maneja— es peor que no
capturarlo: esconde el fallo en vez de exponerlo.

---

## Nota sobre falsos positivos

Cada uno de estos comandos sobre-reporta un poco a propósito — es preferible revisar diez líneas
de más que dejar pasar una real. `appraiser` filtra a mano lo que es claramente intencional (un
`console.error` en un CLI que SÍ debe imprimir, un `TODO` que ya está en el issue tracker con su
número) antes de puntuar — pero la salida cruda del comando va igual como evidencia, filtrada o no.
