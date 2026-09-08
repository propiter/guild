#!/usr/bin/env node
/**
 * Verifica que el script `verify` de package.json corra TODO lo que corre CI,
 * EN EL MISMO ORDEN.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * El contrato con quien trabaja en el repo es una sola frase: «antes de
 * empujar corré `verify`, es exactamente lo que corre CI». Esa frase se
 * rompe sola con el tiempo: CI va sumando pasos (cobertura, un build de
 * artefacto, una auditoría de dependencias) y el script `verify` se queda
 * con los de antes. El resultado es un `verify` local en VERDE que igual
 * deja `main` en ROJO — que es justo lo que este gate existe para impedir.
 *
 * Nadie lo detecta leyendo el YAML a ojo — se detecta cuando un push falla
 * en CI después de que el local dijo que todo estaba bien. Este script
 * convierte esa comparación manual (que nadie hace todas las veces) en un
 * gate que falla nombrando el paso exacto que falta.
 *
 * QUÉ MIDE
 * ────────
 * Extrae todos los comandos ejecutables de `.github/workflows/ci.yml` (los
 * que matchean `COMANDO_PREFIJOS`, ver abajo) y exige que cada uno aparezca
 * literal en la cadena de `&&` del script `verify`. La dirección es una
 * sola: CI ⊆ verify. Que verify tenga algo de MÁS es válido (el gate local
 * puede ser más estricto); que le falte algo de CI, no.
 *
 * Además compara el ORDEN de los pares declarados en `ORDEN_EXIGIDO`: un
 * conjunto de comandos no expresa una dependencia de "X antes que Y", así
 * que sin esta segunda comprobación un paso se puede mover de lugar sin que
 * ninguna guarda lo note.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque `package.json` y `ci.yml` son dos archivos independientes, en dos
 * lenguajes distintos (JSON vs. YAML), y ningún linter de uno conoce el
 * contenido del otro. La única forma de que se mantengan sincronizados es
 * que algo los compare byte a byte, en cada corrida.
 *
 * CONFIGURACIÓN AL ADOPTAR ESTE GUARDRAIL EN UN PROYECTO NUEVO
 * ────────────────────────────────────────────────────────────
 * 1. Ajustá `COMANDO_PREFIJOS` al gestor de paquetes real (pnpm/npm/yarn).
 * 2. Completá `ORDEN_EXIGIDO` con las dependencias de orden que EXISTAN en
 *    tu proyecto (ej. "migrar antes de arrancar", "buildear antes de medir
 *    el artefacto"). Un array vacío es válido — sólo significa que hoy no
 *    hay ninguna dependencia de orden declarada, no que el mecanismo esté
 *    apagado.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

/**
 * Qué cuenta como "un comando a comparar". Ajustá esto al gestor de paquetes
 * real del proyecto. Ejemplos: /^pnpm\s/, /^npm run\s/, /^yarn\s/.
 */
const COMANDO_PREFIJOS = [/^pnpm\s/, /^npm run\s/, /^npm test\b/, /^yarn\s/];

/** Comandos que `verify` no puede ni debe replicar (instalación, checkout). */
const IGNORADOS = [/^pnpm install\b/, /^npm (ci|install)\b/, /^yarn install\b/];

/**
 * LAS DEPENDENCIAS DE ORDEN, DECLARADAS CON SU MOTIVO — CONFIGURÁ ACÁ.
 *
 * Cada par dice «`antes` tiene que correr antes que `despues`, y si no, pasa
 * ESTO». No es una lista de preferencias: cada entrada real debería citar un
 * fallo que ya ocurrió o una propiedad que el paso mide y que, sin el
 * anterior, no puede medir (ver templates/guardrails/README.md, "la regla
 * que separa un guardrail de una ocurrencia" — aplica también a cada
 * entrada de esta lista, no sólo al script entero).
 *
 * El par se comprueba SÓLO donde los dos comandos existen: en la cadena de
 * `verify` y dentro de cada job de `ci.yml` que los tenga a los dos.
 *
 * Ejemplo (comentado — reemplazá por los pares reales del proyecto):
 *   {
 *     antes: "pnpm db:migrate",
 *     despues: "pnpm check:humo-arranque",
 *     porque: "el smoke arranca el artefacto de verdad y, si conecta a una " +
 *       "base sin el esquema instalado, falla con un error de catálogo que " +
 *       "no dice nada sobre lo que el smoke en realidad mide (DI rota).",
 *   },
 */
const ORDEN_EXIGIDO = [
  // { antes: "pnpm build", despues: "pnpm check:humo-arranque", porque: "..." },
];

/**
 * Devuelve los comandos del workflow, con el JOB y el nombre del PASO que
 * los ejecuta, soportando tanto `run: comando` como bloques `run: |`.
 *
 * El job hace falta para la comprobación de ORDEN: un mismo comando puede
 * aparecer en dos jobs distintos que corren en PARALELO, y ahí "antes" sólo
 * significa algo puertas adentro de uno.
 *
 * @returns {{ comando: string, paso: string, job: string }[]}
 */
function comandosDelWorkflow(yaml) {
  const lineas = yaml.split("\n");
  const encontrados = [];
  let pasoActual = "(sin nombre)";
  let jobActual = "(fuera de jobs)";
  let enJobs = false;
  let sangriaDelBloque = null;

  for (const linea of lineas) {
    if (sangriaDelBloque === null) {
      if (/^jobs:\s*$/.test(linea)) enJobs = true;
      else if (enJobs) {
        const job = linea.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
        if (job) jobActual = job[1];
      }
    }

    const nombre = linea.match(/^\s*-?\s*name:\s*(.+?)\s*$/);
    if (nombre) {
      pasoActual = nombre[1].replace(/^["']|["']$/g, "");
      sangriaDelBloque = null;
    }

    // Bloque `run: |` — las líneas siguientes, mientras estén más
    // indentadas que el `run:`, son comandos.
    if (sangriaDelBloque !== null) {
      const sangria = linea.length - linea.trimStart().length;
      if (linea.trim() === "") continue;
      if (sangria <= sangriaDelBloque) {
        sangriaDelBloque = null;
      } else {
        const comando = linea.trim();
        if (COMANDO_PREFIJOS.some((re) => re.test(comando))) {
          encontrados.push({ comando, paso: pasoActual, job: jobActual });
        }
        continue;
      }
    }

    const bloque = linea.match(/^(\s*)-?\s*run:\s*[|>]-?\s*$/);
    if (bloque) {
      sangriaDelBloque = bloque[1].length;
      continue;
    }

    const enLinea = linea.match(/^\s*-?\s*run:\s*(.+?)\s*$/);
    if (enLinea && COMANDO_PREFIJOS.some((re) => re.test(enLinea[1]))) {
      encontrados.push({ comando: enLinea[1], paso: pasoActual, job: jobActual });
    }
  }

  return encontrados;
}

/** Un comando con flags detrás (ej. `pnpm test -- --shuffle`) cuenta igual. */
const esElComando = (comando, cual) => comando === cual || comando.startsWith(`${cual} `);

/**
 * Los pares violados dentro de una secuencia ORDENADA de comandos.
 *
 * @param {string[]} secuencia comandos en el orden en que se ejecutan
 * @returns {{ antes: string, despues: string, porque: string }[]}
 */
function ordenViolado(secuencia) {
  const posicion = (cual) => secuencia.findIndex((c) => esElComando(c, cual));
  return ORDEN_EXIGIDO.filter((par) => {
    const i = posicion(par.antes);
    const j = posicion(par.despues);
    return i !== -1 && j !== -1 && i > j;
  });
}

if (!existsSync(WORKFLOW)) {
  console.error(`\nNo existe ${WORKFLOW}. Ajustá la constante WORKFLOW en este script si el`);
  console.error("workflow de CI vive en otra ruta.\n");
  process.exit(1);
}

const workflow = readFileSync(WORKFLOW, "utf8");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const verify = pkg.scripts?.verify;

if (!verify) {
  console.error("\nNo existe el script `verify` en package.json.");
  console.error("Para arreglarlo: agregá un script `verify` que encadene con `&&` todos los");
  console.error("comandos que corre CI, en el mismo orden.\n");
  process.exit(1);
}

/** Los comandos que verify encadena con `&&`, EN ORDEN. */
const secuenciaDeVerify = verify.split("&&").map((c) => c.trim());
const enVerify = new Set(secuenciaDeVerify);

const delWorkflow = comandosDelWorkflow(workflow);

const faltantes = delWorkflow
  .filter(({ comando }) => !IGNORADOS.some((re) => re.test(comando)))
  .filter(({ comando }) => !enVerify.has(comando));

if (faltantes.length > 0) {
  console.error("\n`verify` no corre todo lo que corre CI:\n");
  for (const { comando, paso, job } of faltantes) {
    console.error(`✖ falta \`${comando}\``);
    console.error(`  lo corre el paso "${paso}" del job "${job}" en .github/workflows/ci.yml\n`);
  }
  console.error(
    "Para arreglarlo: agregá esos comandos a `scripts.verify` en package.json, en el\n" +
      "mismo commit que los sumó a CI. Si un paso de CI no tiene sentido en local (por\n" +
      "ejemplo, porque necesita un secret), no lo saques de verify sin más: sacalo de CI\n" +
      "o dejalo en un job aparte que no bloquee el merge.\n"
  );
  process.exit(1);
}

const jobs = new Map();
for (const { comando, job } of delWorkflow) {
  if (!jobs.has(job)) jobs.set(job, []);
  jobs.get(job).push(comando);
}

const desordenados = [
  { donde: "el script `verify` de package.json", violados: ordenViolado(secuenciaDeVerify) },
  ...[...jobs].map(([job, secuencia]) => ({
    donde: `el job \`${job}\` de .github/workflows/ci.yml`,
    violados: ordenViolado(secuencia),
  })),
].filter(({ violados }) => violados.length > 0);

if (desordenados.length > 0) {
  console.error("\nHay pasos en el ORDEN equivocado:\n");
  for (const { donde, violados } of desordenados) {
    for (const { antes, despues, porque } of violados) {
      console.error(`✖ en ${donde}: \`${antes}\` corre DESPUÉS de \`${despues}\``);
      console.error(`  ${porque}\n`);
    }
  }
  console.error(
    "Para arreglarlo: movete el paso al orden correcto. Si la dependencia dejó de\n" +
      "existir, sacá el par de `ORDEN_EXIGIDO` en el mismo commit, con el motivo escrito\n" +
      "en el mensaje — no lo borres en silencio.\n"
  );
  process.exit(1);
}

console.info(
  `✓ verify cubre todos los comandos de CI, y el orden de ${ORDEN_EXIGIDO.length} ` +
    "dependencias declaradas se respeta"
);
process.exit(0);
