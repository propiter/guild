#!/usr/bin/env node
/**
 * Fitness function: la capa de dominio es pura (equivalente TypeScript de
 * `pureza-dominio.py`).
 *
 * POR QUÉ EXISTE
 * ──────────────
 * La misma regla que en Python: "el dominio no importa infraestructura" es
 * una propiedad ESTRUCTURAL del proyecto, no una regla del lenguaje — ESLint
 * o Biome no tienen forma de saber que `src/dominio/` es especial sin una
 * regla a medida tan grande como este archivo mismo.
 *
 * QUÉ MIDE (y qué NO)
 * ────────────────────
 * Recorre cada archivo bajo `RUTA_DOMINIO` y extrae sus imports (estático y
 * dinámico) y sus `require(...)`. Si alguno resuelve a un módulo de
 * `IMPORTS_PROHIBIDOS`, es una violación — con archivo y línea.
 *
 * NO mide que el dominio sea correcto — eso lo prueban los tests de negocio.
 * Mide que no dependa de lo que el diseño prohíbe que dependa.
 *
 * ANÁLISIS DE IMPORTS, NO UN AST COMPLETO DE TYPESCRIPT — Y POR QUÉ
 * ────────────────────────────────────────────────────────────────
 * Un AST completo de TypeScript necesitaría el compilador de TypeScript
 * como dependencia (`typescript`), y este kit mantiene sus guardrails sin
 * dependencias externas (sólo `node:*`). La alternativa —parsear imports
 * con expresiones regulares sobre el texto, después de sacar comentarios—
 * es más barata y alcanza para lo que esta fitness function necesita: los
 * imports son, casi siempre, sintaxis de una sola línea al principio del
 * archivo. La limitación real: un import reconstruido con concatenación de
 * strings o con un identificador dinámico (`import(variable)`) no se
 * detecta — es el mismo tipo de límite que `check-config-duplicada.mjs`
 * documenta para su propio barrido de texto: costo de VISIBILIDAD, no
 * imposibilidad. Si tu proyecto necesita cerrar ese caso, subí este checker
 * a un plugin de `ts-morph` o del compilador de TypeScript.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque "esta carpeta no puede importar esta otra cosa" es una regla del
 * PROYECTO, no del lenguaje — ESLint tiene un plugin (`no-restricted-
 * imports`) que se le acerca, pero configurarlo para una lista dinámica y
 * con el mensaje explicativo que este archivo da requiere casi el mismo
 * código. La ventaja de un checker propio es que el mensaje de error puede
 * decir EXACTAMENTE por qué la regla existe.
 *
 * CONFIGURACIÓN
 * ─────────────
 * Completá `RUTA_DOMINIO` con la carpeta real del dominio del proyecto, y
 * ajustá `IMPORTS_PROHIBIDOS`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// ── CONFIGURACIÓN: ajustá esto al proyecto real ─────────────────────────────

/** Carpeta del dominio a verificar, relativa a la raíz del repo. */
const RUTA_DOMINIO = "src/dominio";

/**
 * Módulos (o prefijos de módulo) que el dominio NO puede importar. Un
 * prefijo matchea con `/` — ej. `"react"` NO matchea `"react-query-algo"`,
 * pero si querés bloquear un scope entero usá `"@nestjs/"` (con la barra).
 */
const IMPORTS_PROHIBIDOS = [
  "fs",
  "node:fs",
  "http",
  "node:http",
  "axios",
  "express",
  "next",
  "react",
  "pg",
  "drizzle-orm",
  "@prisma/client",
];

/** Extensiones de archivo que se recorren. */
const EXTENSIONES = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

// ── el checker ───────────────────────────────────────────────────────────────

/** Saca comentarios de línea y de bloque, sin tocar el contenido de strings
 * (aproximado: no distingue un `//` dentro de un template literal — es la
 * misma limitación documentada arriba, aceptada a propósito). */
function sinComentarios(codigo) {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, (bloque) => bloque.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Extrae los especificadores de módulo importados de un archivo: `import …
 * from "x"`, `import "x"`, `export … from "x"`, `require("x")`,
 * `import("x")` dinámico.
 *
 * @returns {{ especificador: string, linea: number }[]}
 */
function extraerImports(codigo) {
  const limpio = sinComentarios(codigo);
  const lineas = limpio.split("\n");
  const resultado = [];

  const patrones = [
    /\bfrom\s+["']([^"']+)["']/,
    /\brequire\(\s*["']([^"']+)["']\s*\)/,
    /\bimport\(\s*["']([^"']+)["']\s*\)/,
    /^\s*import\s+["']([^"']+)["']\s*;?\s*$/,
  ];

  lineas.forEach((linea, indice) => {
    for (const patron of patrones) {
      const match = linea.match(patron);
      if (match) {
        resultado.push({ especificador: match[1], linea: indice + 1 });
      }
    }
  });

  return resultado;
}

/** ¿Este especificador cae bajo algún prohibido de la lista? */
function esProhibido(especificador) {
  return IMPORTS_PROHIBIDOS.some(
    (prohibido) => especificador === prohibido || especificador.startsWith(`${prohibido}/`)
  );
}

/** Barrido recursivo de archivos con extensión relevante. */
function archivosDeDominio(dir, encontrados = []) {
  let entradas;
  try {
    entradas = readdirSync(dir);
  } catch {
    return encontrados;
  }
  for (const entrada of entradas) {
    if (entrada === "node_modules" || entrada.startsWith(".")) continue;
    const completo = join(dir, entrada);
    const info = statSync(completo);
    if (info.isDirectory()) {
      archivosDeDominio(completo, encontrados);
    } else if (EXTENSIONES.has(entrada.slice(entrada.lastIndexOf(".")))) {
      encontrados.push(completo);
    }
  }
  return encontrados;
}

/**
 * @param {string} raiz ruta absoluta de la carpeta de dominio
 * @returns {{ archivo: string, linea: number, motivo: string }[]}
 */
export function verificarPurezaDominio(raiz) {
  const violaciones = [];
  for (const archivo of archivosDeDominio(raiz)) {
    const codigo = readFileSync(archivo, "utf8");
    for (const { especificador, linea } of extraerImports(codigo)) {
      if (esProhibido(especificador)) {
        violaciones.push({
          archivo,
          linea,
          motivo: `import prohibido en el dominio: '${especificador}'`,
        });
      }
    }
  }
  return violaciones;
}

// ── veredicto ────────────────────────────────────────────────────────────────

const raizDominio = resolve(ROOT, RUTA_DOMINIO);

let existe = true;
try {
  statSync(raizDominio);
} catch {
  existe = false;
}

if (!existe) {
  console.error(`\n✗ No existe ${raizDominio}. Ajustá RUTA_DOMINIO en este script.\n`);
  process.exit(1);
}

const violaciones = verificarPurezaDominio(raizDominio);

if (violaciones.length > 0) {
  console.error(`\nEl dominio (${RUTA_DOMINIO}) no es puro — ${violaciones.length} violación(es):\n`);
  for (const v of violaciones) {
    console.error(`✖ ${v.archivo.replace(`${ROOT}/`, "")}:${v.linea}  ${v.motivo}`);
  }
  console.error(
    "\nPara arreglarlo: sacá la dependencia de infraestructura del dominio — invertí la\n" +
      "dependencia (el dominio define una interfaz/puerto, la infraestructura la implementa\n" +
      "y se inyecta) en vez de importar el módulo concreto desde adentro del dominio.\n"
  );
  process.exit(1);
}

console.info(`✓ El dominio (${RUTA_DOMINIO}) es puro — sin imports prohibidos`);
process.exit(0);
