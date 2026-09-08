# guild

El gremio: una suite de oficios que construyen software de producción, de la idea al producto
desplegado y endurecido. 11 skills · 45 oficios · 31 comandos, un solo comando instala todo.

No es una herramienta que hace una cosa. Es un **gremio de artesanos** — cada agente es un oficio
con su nombre propio (architect, mason, cartographer, warden), sujeto al mismo estándar común, que
colabora sobre la misma obra.

---

## Los cuatro pipelines

| Pipeline | Comando | Qué construye |
|---|---|---|
| 🏛️ **landing** | `/landing` | Un sitio de marketing, investigado y desplegado |
| 🖥️ **app** | `/app` | La interfaz de una aplicación, contra un contrato tipado |
| 🏗️ **system** | `/proyecto` | El sistema completo: arquitectura, stack, datos, estándares, CI, guardrails |
| 🔒 **security** | `/seguridad` | Ataca tu propia obra para endurecerla, y deja candados permanentes |
| 📦 **delivery** | `/entrega` | Deja el producto limpio y profesional para entregar al cliente |

Los cuatro comparten una columna, `craft-core`, y **las leyes del gremio**.

---

## Instalación

Un comando. Nada que clonar, nada que configurar:

```bash
curl -fsSL https://raw.githubusercontent.com/propiter/guild/main/install.sh | bash
```

Instala **todo** —los cinco pipelines, Impeccable y Gentle AI— en Claude Code, y también en
OpenCode y Cursor si los tenés. Idempotente, sin sudo, nada en segundo plano. Listo para usar.

<details>
<summary>Instalar solo una parte (opcional)</summary>

Por defecto se instala todo. Si querés menos, el mismo comando acepta opciones:

```bash
# solo el pipeline de sistema, sin Impeccable
curl -fsSL https://raw.githubusercontent.com/propiter/guild/main/install.sh | bash -s -- --only=system --no-impeccable
```

| Opción | Efecto |
|---|---|
| `--only=landing,system` | Solo esos pipelines (de `landing app system security`) |
| `--no-impeccable` | Sin Impeccable (motor estético de landing/app) |
| `--no-gentle-ai` | Sin Gentle AI (memoria + SDD) |
| `--no-firecrawl` | Sin el aviso de Firecrawl |
| `--uninstall` | Quitar lo que instaló |
| `--help` | Ver todo |

**Qué trae de afuera:** [Impeccable](https://github.com/pbakaus/impeccable) (MIT, se copia) y
[Gentle AI](https://github.com/Gentleman-Programming/gentle-ai) (se corre su instalador oficial).
Ambos vienen por defecto; se saltan con su flag.
</details>

## Las leyes del gremio

Valen para **todo** oficio, sin excepción. Un agente que las rompe no entregó su trabajo, aunque el
resultado "funcione".

1. **Cero gaps** — nada a medias sin registrar.
2. **Cero bugs** — se corrigen al encontrarlos, con datos verificados, no hipótesis.
3. **Cero parches** — todo se arregla de RAÍZ; el código y la doc quedan consistentes.
4. **Código limpio, escalable, ordenado** — la pieza cuarenta se construye como la primera.
5. **Fácil de depurar** — errores que dicen qué hacer; fallá cerrado, nunca silencioso.
6. **Verde no es correcto** — un test que nunca falló no probó nada.

Texto completo en [`skills/craft-core/references/leyes-del-gremio.md`](skills/craft-core/references/leyes-del-gremio.md).

---

## Los oficios

Los 45 oficios, con su pipeline y su función, están en **[`docs/OFICIOS.md`](docs/OFICIOS.md)**.
Ese registro es lo que hace el sistema fácil de depurar aunque los nombres sean evocativos: si ves
`choreographer` en un log, ahí dice qué hace.

---

## De dónde salió

Empezó como un solo pipeline de landings. Después llegó el de aplicaciones, después el del sistema
completo, y después el que ataca la propia obra. En algún punto dejó de ser "una herramienta de
landings" y pasó a ser lo que es: un gremio.
