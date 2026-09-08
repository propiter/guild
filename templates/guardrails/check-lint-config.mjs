#!/usr/bin/env node
/**
 * Verifica que el linter esté leyendo NUESTRA configuración y no la de
 * fábrica.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Varios linters modernos (Biome es el caso medido acá) descartan su
 * archivo de configuración EN SILENCIO si no lo pueden parsear, y siguen
 * adelante con los valores por defecto. Sin error, sin warning, sin una
 * línea en la salida. El caso real: un comentario `//` dentro de un
 * `biome.json` (los comentarios sólo valen en `.jsonc`).
 *
 * Lo que se ve cuando pasa:
 *   · el linter pasa de revisar ~90 archivos a ~350 — entra a `dist/`,
 *     `coverage/` y demás directorios que estaban excluidos;
 *   · las reglas propias (ej. prohibir `console.log`) dejan de aplicarse;
 *   · y lo peor: el siguiente `--write` reformatea el repo entero con el
 *     estilo por defecto (tabulaciones, 80 columnas), no el nuestro.
 *
 * Nada de eso falla. El lint queda VERDE mientras no comprueba casi nada —
 * el peor tipo de fallo silencioso, porque el gate que debería atraparlo es
 * el mismo que quedó ciego.
 *
 * CÓMO LO DETECTA
 * ───────────────
 * DOS señales independientes, no una:
 *   1. LINTER — un patrón que SÓLO dispara una regla nuestra (no está en el
 *      preset por defecto del linter). Si no dispara, el linter no está
 *      leyendo la config.
 *   2. FORMATO — un fragmento con NUESTRO estilo de indentación tiene que
 *      volver IGUAL. Con los defaults de fábrica vuelve reescrito.
 * Una sola señal podría fallar por otro motivo (ej. el binario no está
 * instalado); las dos juntas, no — y por eso hacen falta las dos.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque el propio linter es el que se está comprobando: `biome ci .` (o el
 * equivalente) sale en verde tanto si aplicó la config real como si aplicó
 * la de fábrica — un lint que pasa no dice CUÁL config usó.
 *
 * ADAPTAR A OTRO LINTER
 * ──────────────────────
 * Este script está escrito para Biome. Para ESLint/ruff/otro: cambiá
 * `BINARIO`, y las dos funciones `senialLinter()`/`senialFormato()` por el
 * equivalente — la ESTRUCTURA (dos señales independientes, sobre un archivo
 * canario descartable) se mantiene igual sea cual sea la herramienta.
 */

import { spawnSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// El binario del workspace, no el del PATH: así el guard verifica la MISMA
// versión que corren `lint` y los hooks locales.
const BINARIO = resolve(ROOT, "node_modules/.bin/biome");

/**
 * Una regla que NO está en el preset por defecto del linter, y que nuestra
 * config sí activa. Ajustá el nombre si tu config no activa `noConsole` —
 * cualquier regla propia (no-default) sirve igual.
 */
const REGLA_CANARIO = "noConsole";
const CONTENIDO_CANARIO_LINT = 'console.log("canario");\n';

/** Un fragmento con NUESTRA indentación (2 espacios). Con los defaults de
 * fábrica de Biome (tabulaciones) vuelve reescrito. */
const CONTENIDO_CANARIO_FORMATO = "function x() {\n  return 1;\n}\n";

if (!existsSync(BINARIO)) {
  console.error(`\nNo existe ${BINARIO}.`);
  console.error("Para arreglarlo: corré la instalación de dependencias del proyecto.\n");
  process.exit(1);
}

/** Corre el linter con un archivo virtual por stdin (o real, según el paso). */
function correr(args, entrada) {
  return spawnSync(BINARIO, args, {
    cwd: ROOT,
    input: entrada,
    encoding: "utf8",
    shell: false,
  });
}

const problemas = [];

/* ── Señal 1: el linter aplica nuestras reglas ────────────────────────────── */
//
// Va a un archivo de verdad y no a stdin: en modo stdin algunos linters NO
// imprimen el nombre de la regla que disparó, sólo "no pasa", y con eso no
// se puede distinguir un fallo de nuestra regla de uno de formato genérico.
const CANARIO = resolve(ROOT, "canario-de-lint.tmp.ts");
let salidaLint = "";
let errorAlEjecutar = null;

// SIN `process.exit` dentro del `try`: `process.exit()` no ejecuta el
// `finally`, así que salir ahí dejaría el archivo canario tirado en la raíz
// del repo cada vez que el linter no arranca. El código se guarda y se sale
// DESPUÉS de limpiar.
try {
  writeFileSync(CANARIO, CONTENIDO_CANARIO_LINT);
  const lint = correr(["lint", CANARIO], undefined);
  if (lint.error) errorAlEjecutar = lint.error.message;
  else salidaLint = `${lint.stdout ?? ""}${lint.stderr ?? ""}`;
} finally {
  rmSync(CANARIO, { force: true });
}

if (errorAlEjecutar !== null) {
  console.error(`\nNo se pudo ejecutar el linter: ${errorAlEjecutar}\n`);
  process.exit(1);
}

if (!salidaLint.includes(REGLA_CANARIO)) {
  problemas.push(
    `El LINTER no está aplicando nuestras reglas.\n` +
      `  '${REGLA_CANARIO}' debería dispararse y no está en el preset por defecto: si no\n` +
      "  aparece, el linter corrió con los valores de fábrica y descartó nuestra config."
  );
}

/* ── Señal 2: el formateador usa nuestro estilo, no el de fábrica ─────────── */

const formato = correr(["format", "--stdin-file-path=canario-de-config.ts"], CONTENIDO_CANARIO_FORMATO);

// Un guard que se saltea a sí mismo cuando algo sale mal no es un guard:
// cualquier resultado que NO sea "volvió idéntico" cuenta como fallo.
if (formato.error) {
  console.error(`\nNo se pudo ejecutar el formateador: ${formato.error.message}\n`);
  process.exit(1);
} else if (formato.status !== 0) {
  problemas.push(
    `El FORMATEADOR terminó con código ${formato.status}, así que no hay señal.\n` +
      `  stderr: ${(formato.stderr ?? "").trim() || "(vacío)"}`
  );
} else if (!formato.stdout) {
  problemas.push(
    "El FORMATEADOR no devolvió nada por stdout, así que no hay señal.\n" +
      "  Se esperaba el fragmento formateado."
  );
} else if (formato.stdout !== CONTENIDO_CANARIO_FORMATO) {
  problemas.push(
    "El FORMATEADOR no está usando nuestra configuración.\n" +
      "  Un fragmento con 2 espacios de indentación volvió reescrito:\n" +
      `  ${JSON.stringify(formato.stdout)}\n` +
      "  Con los defaults de fábrica la indentación suele ser por tabulaciones."
  );
}

/* ── Veredicto ────────────────────────────────────────────────────────────── */

if (problemas.length > 0) {
  console.error("\nEl linter NO está leyendo la configuración del proyecto:\n");
  console.error(problemas.join("\n\n"));
  console.error(
    "\nPara arreglarlo: la causa más probable es que el archivo de config no parsea y el\n" +
      "linter lo descartó sin avisar. Revisá el nombre del archivo (los comentarios sólo\n" +
      "valen en variantes `.jsonc`/con comentarios habilitados) y que el contenido sea\n" +
      "válido. Comprobalo corriendo el linter a mano y mirando cuántos archivos revisa.\n"
  );
  process.exit(1);
}

console.info("✓ El linter está leyendo la configuración del proyecto (reglas y formato)");
process.exit(0);
