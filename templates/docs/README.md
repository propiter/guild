# Documentos del proyecto — cómo se usan

> Este archivo NO es una plantilla de proyecto: es la guía del **sistema de documentación**
> del kit. Explica qué documento responde qué pregunta, para que nunca haya dos docs
> contestando lo mismo. Los archivos `*.md.template` de esta carpeta sí son las plantillas
> que copiás a `docs/` de un proyecto nuevo (quitando el sufijo `.template`).

---

## La regla madre: UNA FUENTE DE VERDAD POR PREGUNTA

Cada pregunta que alguien puede hacerse sobre el proyecto ("¿por qué Postgres y no Mongo?",
"¿qué campos tiene `invoices`?", "¿qué falta para lanzar?") tiene que tener **un solo
documento** que la responda. No dos, no "depende de cuál leas primero".

**Por qué esta regla existe:** cuando dos documentos responden la misma pregunta, uno de
los dos está desactualizado — y nadie sabe cuál. La primera vez que eso pasa, alguien toma
una decisión basada en el doc viejo, y el error no se nota hasta que ya costó tiempo (o
plata, o un incidente en producción). La disciplina de esta carpeta es explícita para que
esto no dependa de que alguien "se acuerde": si estás por escribir en un doc algo que ya
vive en otro, no lo copies — **referenciá** al doc canónico.

Corolario práctico: si notás que dos documentos divergen, **no es un detalle menor** — es
la señal de que algo cambió y no se propagó. Corregilo apenas lo veas, en el mismo commit
si es chico.

---

## Qué documento responde qué pregunta

| Documento | Pregunta que responde | Cuándo se lee | Quién lo mantiene |
|---|---|---|---|
| `_INDICE.md` (→ `docs/README.md`) | ¿Qué documentos existen y en qué estado están? | Al entrar al proyecto por primera vez | Quien cierra cualquier doc nuevo |
| `BLUEPRINT.md` | ¿Cuál es el charter: visión, para quién, qué NO hacemos? | Una vez, para entender el proyecto entero en 5 minutos | El fundador / tech lead |
| `PRD.md` | ¿Qué problema resolvemos y para quién? ¿Qué features hay que construir? | Al planear una fase o feature nueva | Producto |
| `ARQUITECTURA.md` | ¿Cómo están armadas las piezas del sistema y por qué así? | Al diseñar un módulo nuevo o entender el sistema completo | Arquitectura / tech lead |
| `STACK.md` | ¿Qué tecnología se eligió, y por qué esa y no otra? | Antes de proponer cambiar o agregar una pieza del stack | Quien toma la decisión técnica (con ADR) |
| `MODELO-DATOS.md` | ¿Qué tablas existen, qué campos tienen, qué convenciones siguen? | Al tocar el schema o escribir una query nueva | Quien migra el schema |
| `SEGURIDAD.md` | ¿Cómo se protegen los datos, secretos y el acceso? | Al tocar auth, secretos, RLS o cualquier frontera de confianza | Seguridad / tech lead |
| `INFRAESTRUCTURA.md` | ¿Qué corre dónde, con qué credenciales, en qué runner? | Solo al tocar CI/CD, deploy o infra — **no es lectura de entrada** | Quien opera la infra |
| `ROADMAP.md` | ¿Qué sigue, en qué orden, y qué deuda quedó registrada? | Al arrancar una sesión de trabajo, para saber qué toca ahora | Quien cierra cada fase |
| `API.md` | ¿Qué contrato expone el sistema hacia afuera (o entre módulos)? | Al construir o consumir un endpoint | Quien mantiene la API |
| `STANDARDS.md` | ¿Cómo se construye cada pieza (el molde) y cuándo está "terminada" (DoD)? | Antes de escribir código nuevo, y al revisar un PR | Tech lead |
| `GLOSARIO.md` | ¿Qué significa este término del dominio? | Cuando un nombre no es obvio | Cualquiera que introduce un término nuevo |
| `AGENT-ONBOARDING.md` | ¿Cómo arranca un agente una sesión de trabajo nueva? | Se pega al abrir cada sesión | Quien ajusta el método de trabajo |
| `CLAUDE.md` (raíz del repo, no en `docs/`) | ¿Qué convenciones operativas rigen SIEMPRE en este repo? | Se carga automático en cada sesión | Quien ajusta convenciones del día a día |

## Qué NO debe pasar

- **No dupliques contenido entre documentos.** Si `ARQUITECTURA.md` necesita mencionar una
  decisión de stack, la **referencia** (`ver STACK.md ADR-03`), no la reescribe.
- **`BLUEPRINT.md` es un charter, no un resumen ejecutivo con todo adentro.** Si un dato
  vive en otro doc, `BLUEPRINT.md` apunta ahí — nunca copia el detalle.
- **`INFRAESTRUCTURA.md` no se lee de entrada.** Es referencia para cuando hay que tocar
  infra. Meter ahí datos que cambian seguido (URLs, nombres de runners) y pretender que el
  prompt de arranque los repita es la forma más rápida de que el prompt mienta.
- **`AGENT-ONBOARDING.md` no contiene datos verificables por comando.** Si algo se puede
  confirmar con `git log`, `gh pr list` o un `grep`, no pertenece ahí — pertenece al repo, y
  el agente lo descubre.

## Cómo usar estas plantillas

1. Copiá el archivo `NOMBRE.md.template` que necesites a `docs/NOMBRE.md` en el proyecto
   nuevo (o `CLAUDE.md` a la raíz del repo, no a `docs/`).
2. Reemplazá cada `{{PLACEHOLDER}}` con contenido real del proyecto.
3. Borrá el bloque de instrucciones delimitado al inicio del archivo — es guía para
   llenarlo, no contenido final.
4. Actualizá el estado (`✅`/`🚧`/`⬜`) del documento en `_INDICE.md`.
