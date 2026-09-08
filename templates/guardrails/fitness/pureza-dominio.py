#!/usr/bin/env python3
"""Fitness function: la capa de dominio es pura.

POR QUE EXISTE
--------------
Un linter de Python no tiene forma de expresar "prohibido importar `requests`
(o cualquier cosa de infraestructura/IO) dentro de `dominio/`" sin convertirse
en un plugin a medida. La regla es real -- el dominio que depende de una
libreria HTTP, de un ORM o de un reloj de pared (`datetime.now()`) deja de ser
testeable sin red, sin base de datos, sin mockear el tiempo -- pero es
ESTRUCTURAL, no sintactica, y por eso el linter estandar no la ve.

Esta fitness function la convierte en un CHEQUEO EJECUTABLE: recorre el AST
real de cada archivo bajo la carpeta de dominio y reporta cada violacion con
archivo, linea y motivo. No es un grep -- un grep se enganya con un string, un
comentario o un import dentro de un docstring; el AST no.

QUE MIDE (y que NO)
--------------------
Cuatro clases de violacion, todas configurables en las constantes de abajo:
  1. imports prohibidos (IMPORTS_PROHIBIDOS)          -- ej. "requests", "os"
  2. llamadas prohibidas (LLAMADAS_PROHIBIDAS)        -- ej. "open()" (I/O)
  3. atributos prohibidos (ATRIBUTOS_PROHIBIDOS)      -- ej. ".now" (reloj implicito)
  4. literales/tipos prohibidos (TIPOS_LITERALES_PROHIBIDOS) -- ej. float en dinero

NO mide que el dominio sea CORRECTO -- eso lo prueban los tests de negocio.
Mide que el dominio sea PURO: nada de IO, nada de infraestructura, nada de
relojes o generadores de aleatoriedad implicitos.

POR QUE EL LINTER NORMAL NO LO DETECTA
----------------------------------------
Porque "importar `os` esta prohibido" no es una regla del lenguaje Python --
es una regla de ESTE proyecto, sobre ESTA carpeta. mypy/ruff no tienen forma
de saber que "dominio/" es especial sin una configuracion a medida tan grande
como este archivo mismo.

CONFIGURACION
-------------
Completa RUTA_DOMINIO con la carpeta real del dominio del proyecto, y ajusta
las cuatro constantes de prohibiciones. Corre como script (`python
fitness/pureza_dominio.py`) o importa `verificar_pureza_dominio()` desde un
test de pytest (ver `fitness/README.md`, seccion "como se escribe una": un
checker sin un test que confirme que detecta la violacion es una afirmacion
de fe).
"""

from __future__ import annotations

import ast
import sys
from dataclasses import dataclass
from pathlib import Path

# ── CONFIGURACION: ajusta esto al proyecto real ─────────────────────────────

# Carpeta del dominio a verificar, relativa a la raiz del repo.
RUTA_DOMINIO = Path("src/dominio")

# Modulos que el dominio NO puede importar. `open` y `datetime.now` no son
# imports (son builtin/atributo) y se verifican aparte, mas abajo.
IMPORTS_PROHIBIDOS: frozenset[str] = frozenset(
    {"fastapi", "flask", "django", "pydantic", "httpx", "requests", "sqlalchemy", "csv", "os"}
)

# Llamadas de I/O directo prohibidas dentro del dominio.
LLAMADAS_PROHIBIDAS: frozenset[str] = frozenset({"open", "print", "input"})

# Atributos que representan un reloj o una fuente de aleatoriedad implicita
# -- ambos son I/O disfrazado: hacen que el mismo codigo devuelva resultados
# distintos en corridas distintas, lo que rompe la property mas importante
# del dominio (determinismo, testeable sin mockear tiempo/azar).
ATRIBUTOS_PROHIBIDOS: frozenset[str] = frozenset({"now", "utcnow", "random"})

# Tipos que no deberian aparecer como literal en el dominio. El ejemplo
# clasico es `float` en calculos monetarios: el redondeo binario de punto
# flotante produce resultados distintos segun el orden de las operaciones,
# y una factura mal redondeada no falla ruidosamente -- cobra mal en
# silencio. Dejalo vacio (frozenset()) si no aplica a tu dominio.
TIPOS_LITERALES_PROHIBIDOS: frozenset[str] = frozenset({"float"})

# ── el checker ───────────────────────────────────────────────────────────────


@dataclass(frozen=True, slots=True)
class ViolacionPureza:
    archivo: Path
    linea: int
    motivo: str

    def __str__(self) -> str:
        return f"{self.archivo}:{self.linea}: {self.motivo}"


def verificar_pureza_dominio(raiz: Path) -> list[ViolacionPureza]:
    """Recorre `raiz` buscando `.py` y devuelve TODAS las violaciones de pureza."""
    violaciones: list[ViolacionPureza] = []
    for archivo in sorted(raiz.rglob("*.py")):
        codigo = archivo.read_text(encoding="utf-8")
        try:
            arbol = ast.parse(codigo, filename=str(archivo))
        except SyntaxError as error:
            violaciones.append(ViolacionPureza(archivo, error.lineno or 0, f"no parsea: {error}"))
            continue
        for nodo in ast.walk(arbol):
            violaciones.extend(_violaciones_de_nodo(nodo, archivo))
    return violaciones


def _violaciones_de_nodo(nodo: ast.AST, archivo: Path) -> list[ViolacionPureza]:
    if (
        isinstance(nodo, ast.Constant)
        and isinstance(nodo.value, float)
        and "float" in TIPOS_LITERALES_PROHIBIDOS
    ):
        return [ViolacionPureza(archivo, nodo.lineno, "literal float prohibido en el dominio")]
    if (
        isinstance(nodo, ast.Name)
        and nodo.id in TIPOS_LITERALES_PROHIBIDOS
    ):
        return [ViolacionPureza(archivo, nodo.lineno, f"uso del tipo '{nodo.id}' prohibido en el dominio")]
    if _es_llamada_prohibida(nodo):
        assert isinstance(nodo, ast.Call) and isinstance(nodo.func, ast.Name)
        motivo = f"llamada a '{nodo.func.id}()' prohibida en el dominio (I/O)"
        return [ViolacionPureza(archivo, nodo.lineno, motivo)]
    if isinstance(nodo, ast.Attribute) and nodo.attr in ATRIBUTOS_PROHIBIDOS:
        motivo = f"acceso a '.{nodo.attr}' prohibido en el dominio (reloj/azar implicito)"
        return [ViolacionPureza(archivo, nodo.lineno, motivo)]
    if isinstance(nodo, (ast.Import, ast.ImportFrom)):
        return _violaciones_de_import(nodo, archivo)
    return []


def _es_llamada_prohibida(nodo: ast.AST) -> bool:
    return (
        isinstance(nodo, ast.Call)
        and isinstance(nodo.func, ast.Name)
        and nodo.func.id in LLAMADAS_PROHIBIDAS
    )


def _violaciones_de_import(
    nodo: ast.Import | ast.ImportFrom, archivo: Path
) -> list[ViolacionPureza]:
    if isinstance(nodo, ast.Import):
        modulos = [alias.name.split(".")[0] for alias in nodo.names]
    else:
        modulos = [(nodo.module or "").split(".")[0]]
    return [
        ViolacionPureza(archivo, nodo.lineno, f"import prohibido en el dominio: '{modulo}'")
        for modulo in modulos
        if modulo in IMPORTS_PROHIBIDOS
    ]


def main() -> int:
    raiz_repo = Path(__file__).resolve().parents[2]
    raiz_dominio = raiz_repo / RUTA_DOMINIO

    if not raiz_dominio.exists():
        print(f"✗ No existe {raiz_dominio}. Ajustá RUTA_DOMINIO en este script.", file=sys.stderr)
        return 1

    violaciones = verificar_pureza_dominio(raiz_dominio)

    if violaciones:
        print(f"\nEl dominio ({RUTA_DOMINIO}) no es puro — {len(violaciones)} violación(es):\n", file=sys.stderr)
        for v in violaciones:
            print(f"✖ {v}", file=sys.stderr)
        print(
            "\nPara arreglarlo: sacá la dependencia de infraestructura del dominio — invertí la\n"
            "dependencia (el dominio define una interfaz, la infraestructura la implementa) en\n"
            "vez de importar la librería concreta desde adentro del dominio.\n",
            file=sys.stderr,
        )
        return 1

    print(f"✓ El dominio ({RUTA_DOMINIO}) es puro — sin imports/llamadas/tipos prohibidos")
    return 0


if __name__ == "__main__":
    sys.exit(main())
