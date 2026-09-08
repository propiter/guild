# Perfil Python

Extraído de un servicio en producción (FastAPI + paquete único,
no monorepo). Pensado para un paquete Python que se empaqueta como wheel y se sirve como servicio
HTTP — si tu caso es una librería sin servidor, el `Dockerfile.template` no aplica, el resto sí.

## Quién cumple cada rol

| Rol | Herramienta | Por qué esta y no otra |
|---|---|---|
| Gestor de paquetes + entorno | **uv** | Resuelve e instala desde `uv.lock` (confirmado por su presencia en el `Dockerfile` de la fuente), sensiblemente más rápido que pip/poetry para instalar en una imagen de contenedor. |
| Lint + formato | **Ruff** | Un solo binario en Rust reemplaza flake8 + isort + pyupgrade + un formateador. Selección explícita de reglas (ver abajo), no el preset "todo". |
| Chequeo de tipos | **mypy** | Estricto SOLO en el paquete de dominio — ver el porqué abajo. No es pereza: es una decisión de dónde vale la pena pagar el costo de anotar todo. |
| Tests | **pytest** + **pytest-cov**, **Hypothesis** opcional | pytest por convención del ecosistema; Hypothesis para dominios con muchas invariantes (cálculos, parsers, máquinas de estado) donde escribir casos a mano no cubre los bordes reales. |
| Build / empaquetado | **hatchling** → wheel | Backend de build simple, sin plugins innecesarios, con soporte de `force-include` para empaquetar datos no-Python dentro del wheel (ver abajo). |
| Runtime de producción | **Python** | `3.13` (`.python-version` en la fuente; `pyproject.toml` fija `requires-python = ">=3.12"` y `target-version = "py313"` en Ruff/mypy). |
| Dinero | **Enteros de centavos + `Decimal`** | Nunca `float`. Un motor de precios que redondea mal en el quinto decimal no es un bug cosmético, es plata mal cobrada. |

## Versiones

- **Python:** `3.13` en runtime (imagen `python:3.13-slim-bookworm`), `requires-python = ">=3.12"`
  en el paquete — el rango es más permisivo que la imagen porque el paquete puede instalarse en
  otros entornos (CI con una versión ligeramente distinta, la laptop de alguien).
- **uv:** fijado por su propio tag de imagen en el `Dockerfile` (`ghcr.io/astral-sh/uv:0.9.7` en
  la fuente) — pineá la versión exacta, no uses `:latest` en una imagen de producción.
- **Ruff:** `>=0.8`
- **mypy:** `>=1.11`
- **pytest:** `>=8`, **pytest-cov:** `>=5`

## Decisiones y por qué

### El umbral de cobertura va en el comando de build/CI, NUNCA en `addopts` de pytest

Este es el gotcha más importante del perfil, y es del tipo que no se nota hasta que ya causó daño.

`pyproject.toml` puede declarar `--cov-fail-under=85` dentro de `[tool.pytest.ini_options].addopts`
— y si lo hace, ESE flag se aplica a **cualquier invocación de pytest**, incluida una que corre un
subconjunto de tests. En TDD estricto se corre un archivo o una carpeta a la vez, cientos de veces
por sesión (`pytest tests/dominio/test_tarifa.py`). Ejecutar solo ese archivo nunca va a acercarse
al 85% de cobertura del proyecto completo — el subconjunto pasa sus aserciones y aun así termina
con `exit 1` por cobertura insuficiente, un fallo que no tiene nada que ver con lo que se estaba
probando.

La consecuencia práctica de ese fallo constante y sin relación con el trabajo real: el equipo
termina desactivando el gate ("total, siempre falla") — y ahí se pierde la red de seguridad
completa, no solo para el caso raro.

**La solución de este perfil:** `addopts` en `pyproject.toml` NO incluye `--cov-fail-under`, solo
`--cov=<paquete> --cov-report=term-missing` (mide y reporta, no falla). El umbral se exige en el
comando que SÍ corre la suite completa — el de build/CI:

```sh
uv run pytest --cov-fail-under=85
```

Correr un archivo suelto durante TDD sigue midiendo cobertura (el reporte se ve) pero nunca falla
por umbral. Correr la suite completa en CI sí exige el 85%. Mismo mecanismo, dos invocaciones con
propósitos distintos.

### mypy estricto SOLO en el paquete de dominio

`[[tool.mypy.overrides]]` con `strict = true` apunta únicamente a `{{PROJECT_PACKAGE}}.dominio.*`.
El resto de `src/` (capas de aplicación e infraestructura) se tipa en modo normal.

Esto no es "el dominio importa más" en abstracto — es dónde vive la lógica que un error de tipos
puede convertir en un bug de negocio silencioso (un cálculo de tarifa, una regla de descuento). Las
capas de infraestructura (clientes HTTP, adaptadores de I/O) tienen su propia superficie de riesgo,
pero typing estricto ahí compra menos por el mismo costo de anotar todo. Si tu proyecto crece y
esas capas acumulan lógica de negocio real, es la señal para expandir el override — no para
bajar el estándar del dominio.

### Ruff con selección explícita de reglas, no el preset "todo"

```toml
select = ["E", "F", "W", "I", "UP", "B", "SIM", "RUF"]
```

`E`/`F`/`W` son la higiene base (pycodestyle + pyflakes), `I` ordena imports, `UP` moderniza sintaxis
(`pyupgrade`), `B` atrapa bugs comunes (`bugbear`), `SIM` simplifica patrones redundantes, `RUF` son
las reglas propias de Ruff.

**Advertencia honesta, para no prometer de más:** dentro de `RUF` están `RUF032` (Decimal
construido desde un literal float) y `RUF059` u otras de comparación de floats — son las ÚNICAS
reglas de Ruff que tocan el tema "no usar float para dinero". Ruff **no tiene** una regla genérica
que prohíba `float` como tipo de anotación o como literal en cualquier posición. Si tu proyecto
necesita esa prohibición dura (recomendado si el dominio maneja dinero), no la vas a conseguir con
Ruff solo: hace falta un checker de AST propio sobre el árbol de `src/` que la fuente de este
perfil sí implementa (fuera del alcance de este `pyproject.toml.template`, que es solo
configuración declarativa) — documentalo como una decisión de arquitectura, no asumas que
seleccionar `RUF` ya te cubre.

### Empaquetado: los datos no-Python viajan DENTRO del wheel

`[tool.hatch.build.targets.wheel.force-include]` es el mecanismo. Un paquete que depende de datos
en tiempo de ejecución (parámetros de configuración, tablas de referencia, plantillas) y que se
instala desde un wheel sin este bloque se instala igual, arranca igual, y falla recién en la
primera operación real que necesite esos datos — porque el wheel nunca los llevó. Si tu paquete
tiene datos no-Python que el código importa en runtime, agregalos acá explícitamente; no asumas
que "están en el repo" es lo mismo que "están en el artefacto que se despliega".

### Dinero: enteros de centavos + `Decimal`, nunca `float`

`float` usa representación binaria de punto flotante — no puede representar exactamente la mayoría
de las cantidades decimales que el dinero necesita (`0.1 + 0.2 != 0.3` es el ejemplo de manual, y
el error se acumula con cada operación). Este perfil no permite `float` en ninguna cantidad
monetaria: valores discretos (centavos) como enteros donde el dominio lo permite, `Decimal` con
precisión configurada donde hace falta aritmética con decimales reales.

## El comando de build/CI, paso a paso

```sh
uv run ruff check .          # 1. Lint estático — no necesita nada instalado más que uv
uv run ruff format --check . # 2. Formato — falla si algo no está formateado, no reescribe
uv run mypy src              # 3. Tipos — atrapa errores antes de gastar tiempo en tests
uv run pytest --cov-fail-under=85   # 4. Suite completa, con el umbral de cobertura acá y NO en addopts
uv build --wheel             # 5. Empaquetado — solo tiene sentido si todo lo anterior pasó
```

Este orden importa por el mismo motivo que en el perfil TypeScript: lint y formato no necesitan
compilar ni instalar dependencias pesadas, así que van primero y fallan rápido. Tipos antes de
tests porque un error de tipos suele producir un test que falla por una razón distinta a la que
realmente importa. Tests antes de build porque no vale la pena empaquetar código que no pasa su
propia suite.
