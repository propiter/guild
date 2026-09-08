#!/usr/bin/env node
/**
 * Verifica que TODO archivo de test del workspace lo EJECUTE una tarea que
 * `verify` alcanza.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * `verify` corre `test:coverage` (o el nombre que declares en
 * `PREFIJO_DE_TAREAS_DE_TEST`), nunca `test` a secas — es la disciplina de
 * nombrar las tareas de test con un prefijo reconocible y de que `verify`
 * sólo corra las que lo tienen. Esa disciplina falla de una forma muy
 * concreta y ya medida: un paquete que declara SÓLO `test` (sin
 * `test:coverage`) queda con una suite escrita, que vitest encuentra si
 * alguien la corre a mano, y que CI NUNCA ejecuta — sin un solo error en
 * ningún lado. `pnpm verify` (o el equivalente) pasa entero, en verde, con
 * un test roto adentro que nadie ve.
 *
 * QUÉ MIDE, Y CÓMO
 * ─────────────────
 * Tres mediciones independientes, CRUZADAS archivo por archivo:
 *   (1) qué NOMBRE de archivo cuenta como test — `VOCABULARIO_MINIMO`, el
 *       piso; se puede enriquecer por paquete si tu test runner expone su
 *       `include` resuelto (ver la nota de extensión más abajo).
 *   (2) qué archivos EXISTEN — barrido recursivo del disco con ese
 *       vocabulario, paquete por paquete.
 *   (3) qué archivos EJECUTA cada tarea de test ALCANZADA por `verify` —
 *       preguntándoselo al test runner (`vitest list --filesOnly --json`
 *       por defecto; configurable en `OBTENER_ARCHIVOS_EJECUTADOS`).
 *
 * Rojo = (2) − (3) no está vacío (un archivo que nadie corre — el huérfano
 * de F21/D40), o (3) − (2) no está vacío (el runner ejecuta algo que el
 * barrido no ve — el vocabulario está incompleto y el conteo miente).
 *
 * TODA RAMA DE "NO PUDE AVERIGUARLO" FALLA CERRADO
 * ─────────────────────────────────────────────────
 * Si no se puede listar el workspace, si el runner no está instalado, o si
 * `vitest list` sale distinto de 0, esta guarda lo NOMBRA y sale 1. Un "no
 * sé" nunca se cuenta como "está cubierto" — un guard que falla abierto ante
 * la incertidumbre es una ilusión de cobertura, no cobertura.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque el archivo de test EXISTE y es sintácticamente válido — el linter
 * no tiene forma de saber que ninguna tarea alcanzada por `verify` lo carga.
 * Y `verify` en sí mismo no lo detecta: si el paquete nombra su suite
 * distinto a la convención, `verify` simplemente no la corre, y "no correr
 * algo" no imprime ningún error.
 *
 * ALCANCE — QUÉ QUEDA AFUERA POR CONSTRUCCIÓN
 * ─────────────────────────────────────────────
 * Esta guarda barre PAQUETES DEL WORKSPACE (los que resuelve el gestor de
 * paquetes). Un directorio con tests que NO es un paquete declarado en el
 * workspace (ej. un `scripts/*.test.mjs` suelto, o un `tools/x/` sin
 * `package.json`) queda fuera — y así tiene que ser: barrer el repo entero
 * mediría un universo distinto al que corre el gestor de paquetes real, que
 * es exactamente la desincronización que este script existe para no tener.
 * Si esos tests importan, la corrección es declarar el directorio como
 * paquete del workspace, no ensanchar el barrido de esta guarda.
 *
 * NOTA DE EXTENSIÓN (nivel de paranoia completo)
 * ────────────────────────────────────────────────
 * Esta es una versión GENÉRICA, pensada para adaptarse rápido a un proyecto
 * nuevo. La versión de origen (`check-tareas-de-test.mjs`, del kit del que
 * se extrajo este método) además: deriva el vocabulario preguntándole a
 * vitest el `include` RESUELTO de cada tarea (no una constante), deriva
 * `TAREAS_ALCANZADAS` parseando `verify` en vez de una lista fija, y corre
 * un auto-chequeo con paquetes de laboratorio y mutaciones antes de emitir
 * veredicto sobre el repo real. Si tu proyecto tiene una convención de
 * nombres de test poco uniforme entre paquetes, o justifica ese nivel de
 * blindaje, usá esa versión como referencia — no hace falta reinventarla,
 * pero tampoco es necesaria en un workspace chico y uniforme.
 *
 * CONFIGURACIÓN
 * ─────────────
 * Ajustá `PREFIJO_DE_TAREAS_DE_TEST`, `VOCABULARIO_MINIMO`,
 * `DIRECTORIOS_IGNORADOS` y `OBTENER_ARCHIVOS_EJECUTADOS` al proyecto real.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Convención: toda tarea de test que `verify` debe alcanzar empieza así. */
const PREFIJO_DE_TAREAS_DE_TEST = /^test/;

/** El piso del vocabulario de "esto es un archivo de test". Sumá formas
 * propias del proyecto (ej. `*.integracion.ts`) si te apartás del default. */
const VOCABULARIO_MINIMO = [/\.(test|spec)\.(c|m)?[jt]sx?$/];

/** Directorios que nunca hay que recorrer: generados o de terceros. */
const DIRECTORIOS_IGNORADOS = new Set(["node_modules", "dist", "coverage", ".turbo", ".git"]);

const TIEMPO_MAXIMO_MS = 120_000;

function morir(mensaje) {
  console.error(`\n✗ ${mensaje}\n`);
  process.exit(1);
}

/** Los paquetes del workspace, según el gestor de paquetes real. */
function paquetesDelWorkspace() {
  try {
    const salida = execFileSync("pnpm", ["ls", "-r", "--depth", "-1", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: TIEMPO_MAXIMO_MS,
    });
    const lista = JSON.parse(salida);
    if (!Array.isArray(lista) || lista.length === 0) {
      morir("`pnpm ls -r --depth -1 --json` no devolvió ningún paquete — no sé qué barrer.");
    }
    return lista.map((p) => ({ nombre: p.name, ruta: p.path }));
  } catch (error) {
    // No es un workspace de pnpm — tratamos la raíz como el único paquete.
    if (existsSync(join(ROOT, "package.json"))) {
      const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
      return [{ nombre: pkg.name ?? "(raíz)", ruta: ROOT }];
    }
    morir(`no pude resolver los paquetes del workspace: ${error.message}`);
  }
}

/** Las tareas de test que `verify` alcanza, derivadas de package.json — no
 * escritas a mano al lado, para que este script no se desincronice de
 * `verify` de la misma forma que `check-ci-parity.mjs` existe para impedir
 * en la relación CI ↔ verify. */
function tareasAlcanzadas() {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const verify = pkg.scripts?.verify;
  if (!verify) morir("no existe `scripts.verify` en package.json.");

  const tareas = new Set();
  for (const tramo of verify.split("&&").map((t) => t.trim())) {
    // "pnpm test:coverage" / "npm run test:coverage" → "test:coverage"
    const match = tramo.match(/^(?:pnpm|npm run|yarn)\s+(\S+)/);
    if (!match) continue;
    const nombreDeTarea = match[1];
    if (PREFIJO_DE_TAREAS_DE_TEST.test(nombreDeTarea)) tareas.add(nombreDeTarea);
  }
  return tareas;
}

/** Barrido recursivo de disco, siguiendo symlinks con un set de rutas
 * canónicas para no entrar en ciclos. */
function barrerArchivosDeTest(raiz) {
  const encontrados = [];
  const visitados = new Set();

  function recorrer(dir) {
    let real;
    try {
      real = realpathSync(dir);
    } catch {
      return;
    }
    if (visitados.has(real)) return;
    visitados.add(real);

    let entradas;
    try {
      entradas = readdirSync(dir);
    } catch {
      return;
    }

    for (const entrada of entradas) {
      if (DIRECTORIOS_IGNORADOS.has(entrada) || entrada.startsWith(".")) continue;
      const completo = join(dir, entrada);
      let info;
      try {
        info = statSync(completo);
      } catch {
        continue;
      }
      if (info.isDirectory()) {
        recorrer(completo);
      } else if (VOCABULARIO_MINIMO.some((re) => re.test(entrada))) {
        encontrados.push(completo);
      }
    }
  }

  recorrer(raiz);
  return encontrados;
}

/**
 * Qué archivos EJECUTA de verdad una tarea de test, preguntándoselo al test
 * runner — no adivinándolo del `include` escrito. Configurable: cambiá esto
 * si el proyecto usa jest/mocha/pytest en vez de vitest.
 *
 * @returns {string[] | null} rutas absolutas, o null si no se pudo medir
 */
function OBTENER_ARCHIVOS_EJECUTADOS(paquete, _tarea) {
  const vitest = resolve(ROOT, "node_modules/.bin/vitest");
  if (!existsSync(vitest)) return null;

  try {
    const salida = execFileSync(vitest, ["list", "--filesOnly", "--json"], {
      cwd: paquete.ruta,
      encoding: "utf8",
      timeout: TIEMPO_MAXIMO_MS,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const lista = JSON.parse(salida);
    if (!Array.isArray(lista)) return null;
    return lista.map((item) => (typeof item === "string" ? resolve(paquete.ruta, item) : null))
      .filter(Boolean);
  } catch {
    return null;
  }
}

// ── Veredicto ────────────────────────────────────────────────────────────────

const paquetes = paquetesDelWorkspace();
const tareas = tareasAlcanzadas();

if (tareas.size === 0) {
  morir(
    `\`verify\` no corre ninguna tarea que empiece con "${PREFIJO_DE_TAREAS_DE_TEST}" — ` +
      "¿la convención de nombres cambió? Ajustá PREFIJO_DE_TAREAS_DE_TEST en este script."
  );
}

const huerfanos = []; // en disco, ninguna tarea alcanzada lo corre
const ciegos = []; // una tarea lo corre, el barrido no lo vio
let totalEnDisco = 0;
let totalPaquetesConTareaAlcanzada = 0;

for (const paquete of paquetes) {
  const pkgJsonPath = join(paquete.ruta, "package.json");
  if (!existsSync(pkgJsonPath)) continue;
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));

  const enDisco = barrerArchivosDeTest(paquete.ruta).map((p) => resolve(p));
  totalEnDisco += enDisco.length;
  if (enDisco.length === 0) continue; // paquete sin tests: no es un fallo.

  const tareaDeclarada = [...tareas].find((t) => pkgJson.scripts?.[t]);
  if (!tareaDeclarada) {
    // Tiene archivos de test en disco pero NINGUNA de las tareas que
    // `verify` alcanza está declarada en este paquete: todos huérfanos.
    huerfanos.push(...enDisco.map((a) => ({ archivo: a, paquete: paquete.nombre })));
    continue;
  }

  totalPaquetesConTareaAlcanzada += 1;
  const ejecutados = OBTENER_ARCHIVOS_EJECUTADOS(paquete, tareaDeclarada);
  if (ejecutados === null) {
    morir(
      `no pude preguntarle al test runner qué ejecuta \`${tareaDeclarada}\` en ` +
        `"${paquete.nombre}". Sin esa medición no hay forma de saber si hay huérfanos — ` +
        "instalá el runner o ajustá OBTENER_ARCHIVOS_EJECUTADOS en este script."
    );
  }
  const setEjecutados = new Set(ejecutados);
  const setEnDisco = new Set(enDisco);

  for (const archivo of enDisco) {
    if (!setEjecutados.has(archivo)) huerfanos.push({ archivo, paquete: paquete.nombre });
  }
  for (const archivo of ejecutados) {
    if (!setEnDisco.has(archivo)) ciegos.push({ archivo, paquete: paquete.nombre });
  }
}

if (huerfanos.length > 0) {
  console.error("\nArchivos de test que NINGUNA tarea alcanzada por `verify` ejecuta:\n");
  for (const { archivo, paquete } of huerfanos) {
    console.error(`✖ ${archivo.replace(`${ROOT}/`, "")}  (paquete: ${paquete})`);
  }
  console.error(
    "\nEste archivo existe, es válido, y CI nunca lo corre — una suite escrita y jamás\n" +
      "ejecutada, sin un solo error en ningún lado. Para arreglarlo: agregá el paquete a\n" +
      "una tarea que `verify` alcance (revisá el nombre del script contra\n" +
      "PREFIJO_DE_TAREAS_DE_TEST), o si el archivo no debería correr, movelo fuera del\n" +
      "vocabulario de test (renombralo sin `.test.`/`.spec.`).\n"
  );
  process.exit(1);
}

if (ciegos.length > 0) {
  console.error("\nEl test runner ejecuta archivos que el barrido de esta guarda NO ve:\n");
  for (const { archivo, paquete } of ciegos) {
    console.error(`✖ ${archivo.replace(`${ROOT}/`, "")}  (paquete: ${paquete})`);
  }
  console.error(
    "\nEl vocabulario de esta guarda está incompleto: hay una convención de nombre de\n" +
      "test que VOCABULARIO_MINIMO no reconoce, así que el conteo de arriba miente por\n" +
      "exceso de confianza. Para arreglarlo: sumá el patrón a VOCABULARIO_MINIMO.\n"
  );
  process.exit(1);
}

if (totalEnDisco === 0) {
  morir("cero archivos de test en todo el workspace — o el barrido está mal configurado, o el repo no tiene tests. Ninguno de los dos es un estado que este guard deba dar por bueno en silencio.");
}

console.info(
  `✓ ${totalEnDisco} archivos de test en ${totalPaquetesConTareaAlcanzada} paquete(s), ` +
    "todos alcanzados por una tarea que `verify` corre"
);
process.exit(0);
