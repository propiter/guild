# guild

El gremio: una suite de oficios que construyen software de producción, de la idea al producto
desplegado y endurecido. 11 skills · 42 oficios · 31 comandos, un solo comando instala todo.

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

Los cuatro comparten una columna, `craft-core`, y **las leyes del gremio**.

---

## Instalación

```bash
git clone <url> guild && cd guild
./install.sh
```

Un comando instala los 11 skills, los 42 oficios y los 31 comandos en Claude Code —y en OpenCode
y Cursor si los tenés—. Idempotente, sin sudo, nada en segundo plano.

```bash
./install.sh --dry-run     # ver qué haría, sin tocar nada
./install.sh --uninstall   # quitar lo que puso (settings y perfil de shell no se tocan)
```

Cuando el repo esté en GitHub, también:

```bash
curl -fsSL https://raw.githubusercontent.com/propiter/guild/main/install.sh | bash
```

---

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

Los 42 oficios, con su pipeline y su función, están en **[`docs/OFICIOS.md`](docs/OFICIOS.md)**.
Ese registro es lo que hace el sistema fácil de depurar aunque los nombres sean evocativos: si ves
`choreographer` en un log, ahí dice qué hace.

---

## De dónde salió

Empezó como un solo pipeline de landings. Después llegó el de aplicaciones, después el del sistema
completo, y después el que ataca la propia obra. En algún punto dejó de ser "una herramienta de
landings" y pasó a ser lo que es: un gremio.
