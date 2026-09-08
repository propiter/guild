#!/usr/bin/env node
/**
 * Verifica que los paquetes que DEBEN ir en la misma versión estén en la
 * misma versión, en todo el workspace.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Hay pares de paquetes cuya relación es más fuerte que "compatibles por
 * semver": uno lee internals del otro, o implementa un contrato que sólo es
 * válido para una versión exacta. Cuando se desalinean, el fallo NO es un
 * error de instalación — es un crash en runtime con un stack trace que no
 * menciona versiones por ningún lado (ej. un proveedor de cobertura de tests
 * leyendo un campo interno que el test runner renombró en la versión nueva).
 * Un caso real y medido: `vitest` y `@vitest/coverage-v8` desalineados
 * revientan con `TypeError: Cannot read properties of undefined (reading
 * 'reportsDirectory')` — nada en ese mensaje dice "actualizá el provider".
 *
 * Este script convierte ese crash críptico en una frase que dice exactamente
 * qué paquete tocar.
 *
 * QUÉ MIDE
 * ────────
 * Para cada grupo declarado en `PARES`, recorre TODOS los `package.json` del
 * workspace (sin entrar a `node_modules`) y exige que:
 *   1. todos los manifiestos que declaran esos paquetes usen la MISMA
 *      versión (comparando el número limpio, sin `^`/`~`);
 *   2. si el grupo es de tipo `lockstep`, la versión esté CLAVADA (sin
 *      rango) — un `^` en un grupo lockstep no es cosmético: deja que un
 *      `install` traiga un paquete en una versión y otro en otra sin tocar
 *      ningún manifiesto, y el gate seguiría en verde porque los rangos
 *      limpian al mismo número.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque cada `package.json` es válido por sí solo — la incompatibilidad
 * sólo existe en la RELACIÓN entre dos manifiestos, y ningún linter de un
 * archivo individual puede verla. Un `npm install`/`pnpm install` tampoco la
 * detecta: el mismatch no rompe la instalación, rompe en runtime.
 *
 * CONFIGURACIÓN
 * ─────────────
 * Sumá un grupo a `PARES` con: los paquetes que deben coincidir, el motivo
 * (para que quien lo lea en seis meses sepa POR QUÉ), y si es `lockstep`
 * (exige versión clavada) o `compatible` (alcanza con que semver-limpio
 * coincida, por ejemplo react/react-dom en la misma minor).
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Grupos de paquetes que deben compartir versión. CONFIGURÁ ACÁ los pares
 * reales del proyecto — los de abajo son ejemplos ilustrativos, no una
 * lista universal.
 *
 * @typedef {{ packages: string[], reason: string, kind?: "lockstep" | "compatible" }} Par
 * @type {Par[]}
 */
const PARES = [
  {
    packages: ["vitest", "@vitest/coverage-v8"],
    reason:
      "el provider de cobertura lee internals de vitest; si difieren, falla con " +
      "'Cannot read properties of undefined (reading reportsDirectory)'",
    kind: "compatible",
  },
  {
    packages: ["react", "react-dom"],
    reason: "react-dom implementa el reconciler de esa versión exacta de react",
    kind: "compatible",
  },
  // Ejemplo de grupo LOCKSTEP (versión clavada, sin rango) — descomentá y
  // adaptá si el proyecto tiene un caso así (paquetes con peers DIRIGIDOS,
  // donde uno declara la versión del otro pero no al revés):
  // {
  //   packages: ["@org/paquete-core", "@org/paquete-plugin"],
  //   reason: "se publican en lockstep y la relación de peers es dirigida",
  //   kind: "lockstep",
  // },
];

/** Encuentra todos los package.json del workspace, sin entrar a node_modules. */
function findManifests(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findManifests(full, found);
    } else if (entry === "package.json") {
      found.push(full);
    }
  }
  return found;
}

const manifests = [
  join(ROOT, "package.json"),
  ...findManifests(ROOT).filter((p) => p !== join(ROOT, "package.json")),
];

/** Rango declarado → versión limpia, para comparar `^1.2.3` con `1.2.3`. */
const clean = (range) => range.replace(/^[\^~>=<\s]*/, "");

/** Una versión CLAVADA: sin `^`, sin `~`, sin comparadores, sin `x`. */
const clavada = (range) => /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/.test(range);

const problems = [];

for (const { packages, reason, kind = "compatible" } of PARES) {
  /** version -> lista de "archivo (paquete)" que la declaran */
  const seen = new Map();
  /** Los declarados con rango en vez de versión clavada (sólo si kind=lockstep). */
  const conRango = [];

  for (const manifestPath of manifests) {
    const pkg = JSON.parse(readFileSync(manifestPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    for (const name of packages) {
      const range = deps[name];
      if (!range || range.startsWith("workspace:") || range.startsWith("catalog:")) continue;
      const version = clean(range);
      const where = `${manifestPath.replace(`${ROOT}/`, "")} → ${name}@${range}`;
      const list = seen.get(version) ?? [];
      list.push(where);
      seen.set(version, list);
      if (kind === "lockstep" && !clavada(range)) conRango.push(where);
    }
  }

  if (seen.size > 1) {
    problems.push(
      [
        `✖ ${packages.join(" y ")} están en versiones distintas.`,
        `  Motivo por el que deben coincidir: ${reason}.`,
        ...[...seen.entries()].map(
          ([version, wheres]) => `  ${version}:\n${wheres.map((w) => `    · ${w}`).join("\n")}`
        ),
        "  Para arreglarlo: alineá las versiones y volvé a instalar.",
      ].join("\n")
    );
  }

  if (conRango.length > 0) {
    problems.push(
      [
        `✖ ${packages.join(" y ")} tienen declaraciones con RANGO, no clavadas (grupo lockstep).`,
        `  Motivo por el que deben ir clavadas: ${reason}.`,
        "  Un `^` en un grupo de lockstep deja que un `install` los desalinee sin tocar",
        "  ningún manifiesto — y el gate de arriba seguiría en verde porque los rangos",
        "  limpian al mismo número. Para arreglarlo: poné la versión exacta (sin `^`/`~`).",
        ...conRango.map((w) => `    · ${w}`),
      ].join("\n")
    );
  }
}

if (problems.length > 0) {
  console.error("\nVersiones incompatibles en el workspace:\n");
  console.error(problems.join("\n\n"));
  console.error("");
  process.exit(1);
}

console.info(`✓ Pares de versiones alineados (${PARES.length} grupos verificados)`);
process.exit(0);
