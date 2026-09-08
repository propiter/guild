#!/usr/bin/env node
/**
 * Verifica que todo lo que un Dockerfile COPIA exista de verdad en el repo.
 *
 * POR QUÉ EXISTE
 * ──────────────
 * Renombrar o mover un archivo de la raíz (ej. `biome.json` → `biome.jsonc`)
 * deja a un Dockerfile copiando algo que ya no existe. El resto de `verify`
 * puede pasar entero —typecheck, tests, build— porque la imagen se
 * construye en OTRO workflow, en otro momento. El error aparece recién ahí,
 * con un mensaje de este estilo:
 *
 *   failed to compute cache key: failed to calculate checksum of ref
 *   1zyur7tc…::u3zv1l1…: "/biome.json": not found
 *
 * Un hash contra otro hash, y el nombre del archivo escondido al final. Este
 * script convierte eso en "el Dockerfile copia X y X no existe", ANTES de
 * empujar — no en el workflow de build, minutos después.
 *
 * QUÉ MIDE (y qué NO)
 * ────────────────────
 * Que las rutas que un Dockerfile copia EXISTAN en el contexto de build. No
 * mide que la imagen construya — eso lo prueba `build-push.yml`, con el
 * build real. Esta guarda cierra específicamente el modo de falla de "alguien
 * movió o renombró un archivo de la raíz y el Dockerfile no se enteró".
 *
 * POR QUÉ EL LINTER / CI NORMAL NO LO DETECTA
 * ─────────────────────────────────────────────
 * Porque un Dockerfile no es código del lenguaje del proyecto — ningún
 * linter de TypeScript/Python conoce su sintaxis, y el build de la imagen
 * corre en un workflow aparte que no se dispara en cada PR salvo que se
 * configure explícitamente (y aun así, tarda minutos en llegar al paso que
 * falla).
 *
 * SUPUESTO: el contexto de build es la raíz del repo (`context: .` en
 * `build-push.yml`). Si tu proyecto usa un contexto distinto por imagen,
 * ajustá `resolverContexto()` para que lo resuelva por Dockerfile.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** El contexto de build. Ajustá si cada Dockerfile usa un contexto distinto. */
function resolverContexto(_dockerfilePath) {
  return ROOT;
}

/** Todos los Dockerfile del repo, sin entrar a node_modules ni a ocultos. */
function buscarDockerfiles(dir, encontrados = []) {
  for (const entrada of readdirSync(dir)) {
    if (entrada === "node_modules" || entrada.startsWith(".")) continue;
    const completo = join(dir, entrada);
    if (statSync(completo).isDirectory()) buscarDockerfiles(completo, encontrados);
    else if (entrada === "Dockerfile" || entrada.startsWith("Dockerfile."))
      encontrados.push(completo);
  }
  return encontrados;
}

/** Une las líneas continuadas con `\` para poder leer cada instrucción entera. */
function instrucciones(contenido) {
  const lineas = contenido.split("\n");
  const salida = [];
  let acumulado = "";
  let primeraLinea = 0;

  for (const [i, cruda] of lineas.entries()) {
    const linea = cruda.replace(/\s*#.*$/, "").trimEnd();
    if (!acumulado && linea.trim() === "") continue;
    if (!acumulado) primeraLinea = i + 1;
    if (linea.endsWith("\\")) {
      acumulado += `${linea.slice(0, -1)} `;
      continue;
    }
    salida.push({ texto: (acumulado + linea).trim(), linea: primeraLinea });
    acumulado = "";
  }
  return salida;
}

/** ¿Existe algo que matchee esta ruta, con o sin comodines? */
function existeEnElContexto(contexto, patron) {
  if (!patron.includes("*")) return existsSync(resolve(contexto, patron));

  const partes = patron.split("/");
  let candidatos = [contexto];
  for (const parte of partes) {
    const siguientes = [];
    for (const base of candidatos) {
      if (!existsSync(base) || !statSync(base).isDirectory()) continue;
      if (!parte.includes("*")) {
        const p = join(base, parte);
        if (existsSync(p)) siguientes.push(p);
        continue;
      }
      const re = new RegExp(`^${parte.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);
      for (const entrada of readdirSync(base)) {
        if (entrada === "node_modules") continue;
        if (re.test(entrada)) siguientes.push(join(base, entrada));
      }
    }
    candidatos = siguientes;
    if (candidatos.length === 0) return false;
  }
  return candidatos.length > 0;
}

const problemas = [];

for (const dockerfile of buscarDockerfiles(ROOT)) {
  const rel = dockerfile.replace(`${ROOT}/`, "");
  const contexto = resolverContexto(dockerfile);
  for (const { texto, linea } of instrucciones(readFileSync(dockerfile, "utf8"))) {
    if (!/^COPY\s/i.test(texto)) continue;

    const tokens = texto.split(/\s+/).slice(1);
    // `--from=…` copia de otra etapa o imagen: esas rutas no viven en el repo.
    if (tokens.some((t) => t.startsWith("--from="))) continue;

    const rutas = tokens.filter((t) => !t.startsWith("--"));
    // El último token es el destino DENTRO de la imagen.
    const fuentes = rutas.slice(0, -1);

    for (const fuente of fuentes) {
      if (existeEnElContexto(contexto, fuente)) continue;
      problemas.push(`✖ ${rel}:${linea}  copia \`${fuente}\`, que no existe en el contexto de build`);
    }
  }
}

if (problemas.length > 0) {
  console.error("\nRutas que un Dockerfile copia y no existen:\n");
  console.error(problemas.join("\n"));
  console.error(
    "\nEsto se rompe cuando se renombra o mueve un archivo de la raíz. El build de la\n" +
      "imagen falla más tarde, en otro workflow, con un mensaje de hashes que no dice cuál\n" +
      "es el archivo. Para arreglarlo: corregí la ruta en el Dockerfile o restaurá el\n" +
      "archivo movido.\n"
  );
  process.exit(1);
}

console.info("✓ Todo lo que copian los Dockerfile existe en su contexto de build");
process.exit(0);
