#!/usr/bin/env node
/**
 * `pnpm audit` (o `npm audit`), pero distinguiendo dos cosas que se
 * confunden fácil: una vulnerabilidad REAL y el registry que no contestó.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Un audit de dependencias con umbral (`--audit-level=high`) devuelve
 * EXIT 1 por DOS motivos que no tienen nada que ver entre sí:
 *
 *   1. el registry contestó y hay una vulnerabilidad `high`/`critical`;
 *   2. el registry NO contestó — timeout, DNS caído, conexión rechazada.
 *
 * El (1) tiene que frenar un push. El (2) NO es un hallazgo: es la AUSENCIA
 * de un hallazgo, y tratarlo como si fuera uno convierte el gate en una
 * lotería de red — un guard que a veces se pone rojo por un problema de wifi
 * es un guard que el equipo aprende a ignorar, que es peor que no tenerlo.
 *
 * ESTO NO BAJA NINGÚN UMBRAL. `--audit-level=high` sigue igual y una
 * vulnerabilidad real sigue devolviendo EXIT 1 en todas partes. Lo único que
 * cambia es que un oráculo que no pudo contestar deja de contarse como un
 * oráculo que contestó que sí.
 *
 * FALLA CERRADO DONDE IMPORTA
 * ─────────────────────────────
 * En CI (`process.env.CI`), «sin respuesta» sigue siendo EXIT 1: el job de
 * auditoría es bloqueante y tiene red real, y es el árbitro final. Fuera de
 * CI (en la máquina de quien desarrolla), «sin respuesta» avisa fuerte y
 * deja seguir, nombrando a CI como quien decide. Y cualquier salida que este
 * script NO sepa clasificar es EXIT 1 en los DOS lados: la duda frena.
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque `pnpm audit`/`npm audit` ya hacen la llamada de red — el problema
 * no es la ausencia de un chequeo, es que el chequeo existente no distingue
 * sus propios dos modos de fallo. Nada "detecta" esto porque no es un bug de
 * otro código: es una ambigüedad en la herramienta misma.
 */

import { spawnSync } from "node:child_process";

/** Lo que una corrida de audit puede llegar a ser. */
const LIMPIO = "limpio";
const VULNERABLE = "vulnerable";
const SIN_RESPUESTA = "sin-respuesta";
const DESCONOCIDO = "desconocido";

/** Marcas de que la red —no el árbol de dependencias— fue el problema. */
const MARCAS_DE_RED = [
  "ERR_SOCKET_TIMEOUT",
  "ERR_PNPM_FETCH",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "socket hang up",
  "network error",
  "request to https://registry",
];

/** Los niveles que este gate bloquea. El umbral, escrito una sola vez. */
const NIVELES_QUE_BLOQUEAN = ["high", "critical"];

/** El comando de auditoría real del proyecto. Ajustá si usás npm/yarn. */
const COMANDO_AUDITORIA = ["pnpm", ["audit", "--prod", `--audit-level=${NIVELES_QUE_BLOQUEAN[0]}`, "--json"]];

/**
 * Clasifica una corrida de audit SIN mirar la red: función pura, para que
 * las canarias de abajo la prueben con salidas sintéticas antes de confiar
 * en ella contra el registry real.
 *
 * No se confía en el código de salida para decidir: se confía en si hubo o
 * no una RESPUESTA parseable. El código sólo corrobora.
 *
 * @param {{ codigo: number|null, salida: string, error: string }} corrida
 * @returns {{ clase: string, detalle: string }}
 */
export function clasificar({ codigo, salida, error }) {
  const todo = `${salida}\n${error}`;

  let informe = null;
  try {
    informe = JSON.parse(salida);
  } catch {
    informe = null;
  }

  if (informe && typeof informe === "object") {
    // OJO ACÁ: con la red caída, `pnpm audit --json` NO devuelve basura ni
    // salida vacía — devuelve JSON VÁLIDO con un campo `error`. Un parser
    // ingenuo que sólo busca `metadata.vulnerabilities`, no lo encuentra, y
    // concluye "limpio" — exactamente el bug que este archivo existe para
    // no tener. Por eso un informe con `error` se trata como NO-respuesta,
    // y `metadata.vulnerabilities` tiene que ESTAR para declarar algo limpio.
    if (informe.error) {
      const codigoError = String(informe.error.code ?? "");
      const mensaje = String(informe.error.message ?? "");
      const marcaEnError = MARCAS_DE_RED.find((m) => `${codigoError} ${mensaje}`.includes(m));
      if (marcaEnError) {
        return { clase: SIN_RESPUESTA, detalle: `el registry no contestó (${marcaEnError})` };
      }
      return {
        clase: DESCONOCIDO,
        detalle: `el informe trae un \`error\` que no se reconoce: ${codigoError || mensaje || "sin código"}`,
      };
    }

    const conteos = informe.metadata?.vulnerabilities;
    if (!conteos || typeof conteos !== "object") {
      return {
        clase: DESCONOCIDO,
        detalle:
          "el informe parsea pero no trae `metadata.vulnerabilities`: no hay respuesta que leer",
      };
    }

    const bloqueantes = NIVELES_QUE_BLOQUEAN.map((n) => [n, Number(conteos[n] ?? 0)]).filter(
      ([, cuantas]) => cuantas > 0
    );

    if (bloqueantes.length > 0) {
      const resumen = bloqueantes.map(([n, c]) => `${c} ${n}`).join(", ");
      return { clase: VULNERABLE, detalle: `el registry contestó y hay ${resumen}` };
    }
    return { clase: LIMPIO, detalle: "el registry contestó y no hay nada en high ni critical" };
  }

  // No hubo respuesta parseable. ¿Fue la red?
  const marca = MARCAS_DE_RED.find((m) => todo.includes(m));
  if (marca) {
    return { clase: SIN_RESPUESTA, detalle: `el registry no contestó (${marca})` };
  }

  // Ni respuesta ni causa reconocida: la duda frena.
  return {
    clase: DESCONOCIDO,
    detalle: `salida no reconocida (código ${codigo}), y sin marca de red que lo explique`,
  };
}

/**
 * Las canarias. Si `clasificar` deja de distinguir, esto se pone rojo ACÁ,
 * en vez de dejar pasar un push que debía frenarse — o de frenar uno que no
 * hacía falta.
 */
const CASOS_CANARIOS = [
  {
    nombre: "árbol limpio → limpio",
    corrida: {
      codigo: 0,
      salida: JSON.stringify({
        metadata: { vulnerabilities: { info: 0, low: 2, moderate: 1, high: 0, critical: 0 } },
      }),
      error: "",
    },
    espera: LIMPIO,
  },
  {
    nombre: "una `high` → vulnerable (el umbral no se movió)",
    corrida: {
      codigo: 1,
      salida: JSON.stringify({
        metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0 } },
      }),
      error: "",
    },
    espera: VULNERABLE,
  },
  {
    nombre: "una `critical` → vulnerable",
    corrida: {
      codigo: 1,
      salida: JSON.stringify({ metadata: { vulnerabilities: { high: 0, critical: 3 } } }),
      error: "",
    },
    espera: VULNERABLE,
  },
  {
    nombre: "`moderate` sola NO bloquea — el umbral es high",
    corrida: {
      codigo: 1,
      salida: JSON.stringify({ metadata: { vulnerabilities: { moderate: 9, high: 0 } } }),
      error: "",
    },
    espera: LIMPIO,
  },
  {
    nombre: "timeout de red → sin respuesta",
    corrida: {
      codigo: 1,
      salida: "",
      error:
        " WARN  POST https://registry.npmjs.org/-/npm/v1/security/audits/quick error " +
        "(ERR_SOCKET_TIMEOUT). Will retry in 10 seconds. 2 retries left.",
    },
    espera: SIN_RESPUESTA,
  },
  {
    nombre: "DNS caído → sin respuesta",
    corrida: { codigo: 1, salida: "", error: "getaddrinfo ENOTFOUND registry.npmjs.org" },
    espera: SIN_RESPUESTA,
  },
  {
    nombre: "el JSON de error de la red caída → sin respuesta, NO limpio",
    corrida: {
      codigo: 1,
      salida: JSON.stringify({
        error: {
          code: "ERR_SOCKET_TIMEOUT",
          message:
            "request to https://registry.npmjs.org/-/npm/v1/security/audits/quick failed, " +
            "reason: Socket timeout",
        },
      }),
      error: "",
    },
    espera: SIN_RESPUESTA,
  },
  {
    nombre: "JSON que parsea pero sin `metadata.vulnerabilities` → desconocido, que frena",
    corrida: { codigo: 1, salida: JSON.stringify({ algo: "otra cosa" }), error: "" },
    espera: DESCONOCIDO,
  },
  {
    nombre: "informe con `error` de causa no reconocida → desconocido, que frena",
    corrida: { codigo: 1, salida: JSON.stringify({ error: { code: "ERR_RARO" } }), error: "" },
    espera: DESCONOCIDO,
  },
  {
    nombre: "salida vacía sin causa → desconocido, que frena",
    corrida: { codigo: 1, salida: "", error: "" },
    espera: DESCONOCIDO,
  },
  {
    nombre: "JSON roto sin marca de red → desconocido, que frena",
    corrida: { codigo: 1, salida: "{ esto no es json", error: "algo salió mal" },
    espera: DESCONOCIDO,
  },
  {
    nombre: "una `high` CON ruido de red igual es vulnerable: la respuesta manda",
    corrida: {
      codigo: 1,
      salida: JSON.stringify({ metadata: { vulnerabilities: { high: 2 } } }),
      error: " WARN  ERR_SOCKET_TIMEOUT en un mirror, reintentado y resuelto",
    },
    espera: VULNERABLE,
  },
];

function canarias() {
  const fallos = [];
  for (const caso of CASOS_CANARIOS) {
    const { clase } = clasificar(caso.corrida);
    if (clase !== caso.espera) {
      fallos.push(`${caso.nombre}: se esperaba \`${caso.espera}\` y dio \`${clase}\``);
    }
  }
  return fallos;
}

const rotas = canarias();
if (rotas.length > 0) {
  console.error(
    "✗ Las canarias de `clasificar` no pasan — el gate no distingue lo que dice que distingue:"
  );
  for (const r of rotas) console.error(`  · ${r}`);
  process.exit(1);
}

const enCI = Boolean(process.env.CI);

const [bin, args] = COMANDO_AUDITORIA;
const corrida = spawnSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const { clase, detalle } = clasificar({
  codigo: corrida.status,
  salida: corrida.stdout ?? "",
  error: corrida.stderr ?? "",
});

if (clase === LIMPIO) {
  console.log(
    `✓ Auditoría de dependencias de producción: ${detalle} · ${CASOS_CANARIOS.length} canarias verdes`
  );
  process.exit(0);
}

if (clase === VULNERABLE) {
  console.error(`✗ Auditoría de dependencias: ${detalle}.`);
  console.error(corrida.stdout ?? "");
  console.error("\nPara arreglarlo: actualizá la dependencia vulnerable, o si no hay fix");
  console.error("disponible todavía, documentá la excepción explícitamente (no la ignores).\n");
  process.exit(1);
}

if (clase === SIN_RESPUESTA && !enCI) {
  console.error("");
  console.error("⚠ LA AUDITORÍA NO PUDO PREGUNTAR — esto NO es «no hay vulnerabilidades».");
  console.error(`  ${detalle}.`);
  console.error("");
  console.error("  No se frena el push porque una vulnerabilidad y una red caída no son lo");
  console.error("  mismo, y acá no hubo respuesta que interpretar. El umbral no se movió:");
  console.error("  high y critical siguen frenando en cuanto el registry conteste.");
  console.error("");
  console.error("  QUIEN DECIDE ES CI: el job de auditoría es bloqueante, tiene red real y");
  console.error("  corre este mismo script con CI=1, donde esta misma situación es EXIT 1.");
  console.error("  Si ese job se pone rojo, el PR no entra.");
  console.error("");
  process.exit(0);
}

if (clase === SIN_RESPUESTA && enCI) {
  console.error(`✗ Auditoría de dependencias: ${detalle}, y esto es CI, que es el árbitro.`);
  console.error("  Acá no se sigue de largo: sin respuesta del registry no hay garantía que dar.");
  console.error("  Para arreglarlo: reintentá el job — si persiste, es un problema del registry");
  console.error("  o de la red del runner, no del árbol de dependencias.");
  process.exit(1);
}

console.error(`✗ Auditoría de dependencias: ${detalle}.`);
console.error("  No se sabe qué pasó, así que frena. Salida cruda:");
console.error((corrida.stdout ?? "").slice(0, 2000));
console.error((corrida.stderr ?? "").slice(0, 2000));
process.exit(1);
