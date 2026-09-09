---
name: system-craft
description: "Trigger: arrancar un proyecto de software desde cero, un SISTEMA completo con backend — 'vamos a crear un proyecto', 'creá un proyecto nuevo', 'empecemos un proyecto', 'armame la base de un proyecto', 'un sistema para X', 'un backend para X', 'una plataforma de X', 'un SaaS de X' — y también las piezas sueltas del arranque: 'necesito el system design', 'diseñá la arquitectura', 'qué stack uso', 'el modelo de datos', 'los estándares del proyecto', 'armá el CI', 'los guardrails', 'el onboarding para agentes', 'el roadmap'. Y AUDITAR un proyecto existente contra el método ('¿qué le falta a este proyecto?', 'esto está mal estructurado', 'no tiene estándares ni CI', 'revisá cómo está armado'). El método completo en 9 fases, cada una delegada a su agente: descubrimiento → arquitectura (sin nombrar tecnología) → stack (con alternativas descartadas) → modelo de datos → estándares (el molde) → andamiaje (tooling, CI, guardrails, fitness functions, contenedores) → onboarding (CLAUDE.md + AGENT-ONBOARDING.md) → roadmap → ciclo de cambio. Agnóstico del lenguaje, con perfiles TypeScript y Python. LIDERA: investiga y decide, no interroga. Cada fase tiene una puerta de salida verificable y no se avanza sin pasarla. Para la INTERFAZ de una aplicación existe app-craft; para un sitio de marketing, landing-craft — este skill construye el sistema y la disciplina que los sostiene."
license: Apache-2.0
metadata:
  author: propiter
  version: "1.0.0"
---

# System Craft

Un proyecto que va a durar años no se arranca escribiendo código. Se arranca decidiendo, **en
orden**, qué se construye, cómo fluye la información, con qué se materializa, bajo qué reglas, y
con qué candados que hagan cumplir esas reglas cuando nadie esté mirando.

Este skill ejecuta ese método. No es una plantilla para copiar: es la secuencia de decisiones que
produce la plantilla correcta **para este proyecto**.

Se diseñó pensando en el peor lector posible: alguien que llega sin contexto, no puede preguntar, y
tiene que no romper nada. Si el proyecto funciona para ese, funciona para todos.

---

## De dónde salió

De destilar tres sistemas en producción —dos monorepos TypeScript y un servicio Python, en dominios
sin relación entre sí— sacarles lo específico de cada negocio, y quedarse con lo que se repetía.

Que el mismo esqueleto apareciera en lenguajes distintos es el hallazgo que ordena todo: **lo que
funciona no es el stack, es el método**.

---

## Los tres estratos

Confundirlos es el origen de casi todo el caos estructural:

```
   MÉTODO         Fases, documentos, puertas, ciclo de cambio
   ─────────      Universal. No depende del lenguaje.

   PERFIL         Herramientas concretas: pnpm/uv, biome/ruff, tsc/mypy
   ─────────      Intercambiable. Se elige en la fase 2.

   GUARDRAILS     Los candados que hacen cumplir el método en máquina
   ─────────      Nacen de fallos reales. Crecen con el proyecto.
```

Cuando alguien copia la estructura de un proyecto que funciona y no le sirve, casi siempre copió el
**perfil** —los archivos de configuración— y se dejó el método y los guardrails, que es donde vive
el valor.

---

## Las nueve fases

| # | Fase | Agente | Produce | Puerta de salida |
|---|------|--------|---------|------------------|
| 0 | Descubrimiento | `scout` | `docs/PRD.md`, `docs/GLOSARIO.md` | Cada requisito verificable; los RNF con números |
| 1 | Diseño de sistema | `architect` | `docs/ARQUITECTURA.md` | **No nombra ni una tecnología** |
| 2 | Stack | `quartermaster` | `docs/STACK.md` | ≥2 alternativas descartadas por decisión |
| 3 | Modelo de datos | `archivist` | `docs/MODELO-DATOS.md` | Convenciones completas; dinero sin punto flotante |
| 4 | Estándares | `codifier` | `STANDARDS.md` | El molde + DoD accionable + anexo automatizable |
| 5 | Andamiaje | `foreman` | repo, tooling, CI, guardrails, contenedores | `verify` verde, **ejecutado** |
| 6 | Onboarding | `herald` | `CLAUDE.md`, `docs/AGENT-ONBOARDING.md` | Cada comando citado existe de verdad |
| 7 | Roadmap | `navigator` | `docs/ROADMAP.md` | Dependencias explícitas; deuda registrada |
| 8 | Ciclo de cambio | `mason` | un cambio cerrado | Verificado contra la spec, no contra el build |

Los prompts completos están en `docs/prompts-system-craft/NN-*.md` — la versión portable, para
usar con cualquier asistente. Los agentes son la ejecución nativa de esos mismos prompts.

---

## El gremio

Once oficios, cada uno con su nombre de rol — nunca un identificador técnico:

| Rol | Fase | Qué hace |
|---|---|---|
| `scout` | 0 · Descubrimiento | Investiga mercado, competencia y regulación; escribe el PRD y el glosario |
| `architect` | 1 · Diseño de sistema | Traza bounded contexts y flujos críticos con sus fallos, sin nombrar tecnología |
| `quartermaster` | 2 · Stack | Elige y justifica el stack contra el diseño ya cerrado, con alternativas descartadas |
| `archivist` | 3 · Modelo de datos | Fija las convenciones de datos y cruza cada entidad del PRD contra el esquema |
| `codifier` | 4 · Estándares | Escribe el molde de ingeniería y el Definition of Done accionable |
| `foreman` | 5 · Andamiaje | Levanta el repo, el CI y los guardrails que hacen cumplir el molde |
| `herald` | 6 · Onboarding | Escribe `CLAUDE.md` y `AGENT-ONBOARDING.md` para quien llega sin contexto |
| `navigator` | 7 · Roadmap | Ordena el trabajo por dependencia técnica y registra la deuda |
| `mason` | 8 · Ciclo de cambio | Ejecuta cada cambio: propuesta, spec, diseño, TDD, verificación y archivo |
| `inspector` | Auditoría | Audita un proyecto existente contra el método. Read-only, no arregla nada |
| `smith` | Guardrail puntual | Convierte un fallo real en un candado automatizado, enchufado al CI |

---

## Cómo se ejecuta

**1 · Detectá el punto de entrada.**

| Situación | Empezá por |
|---|---|
| Proyecto nuevo | Fase 0 |
| Proyecto existente sin método | `inspector` primero (vía `/proyecto-audit`), después las fases que falten |
| Decisiones ya tomadas, falta el andamiaje | Fase 5 |
| Todo montado, hay que construir | Fase 8, en bucle |

**2 · Delegá cada fase a su agente.** Cada uno corre en su propio contexto, con su modelo y sus
herramientas. No ejecutes las fases vos: nueve fases en el contexto principal lo inflan hasta
degradarlo, y las restricciones por fase dejan de existir.

**3 · Pasá los artefactos por disco, no por memoria.** Ver `references/_convenciones.md` §2.

**4 · Verificá la puerta de salida antes de avanzar.** Esto no es opcional: es lo único que separa
el método de una carpeta con documentos bonitos.

**5 · Al cerrar cada fase**, persistí lo decidido si hay memoria disponible.

---

## Liderás, no interrogás

La regla que más define el carácter de este skill.

**Investigá antes de preguntar.** La web, el código, la documentación, el historial. Casi todo lo
que parece una pregunta al usuario es una investigación que no hiciste.

**Lo que podés decidir bien, decidilo** — y declará la decisión con su justificación, para que se
pueda revertir sabiendo qué se revierte.

**Preguntá solo lo que es genuinamente del dueño:** presupuesto, plazos, apetito de riesgo,
preferencias comerciales, compromisos con terceros, restricciones legales que solo él conoce.

El test: *¿la respuesta cambia según quién sea el dueño del proyecto?* Si sí, preguntá. Si la
respuesta correcta es la misma para cualquiera con estas restricciones, decidila vos.

Diez preguntas que podías averiguar solo es trasladarle el trabajo al usuario.

---

## Dos decisiones de orden que parecen menores

### La arquitectura va antes que el stack

La fase 1 diseña **sin nombrar una sola tecnología**. Podés decir "almacén relacional con
transacciones" pero no el nombre del motor. Podés decir "cola de trabajos con reintentos y
dead-letter" pero no el nombre de la biblioteca.

No es un juego. Si diseñás sabiendo qué framework vas a usar, el diseño se deforma para encajar en
lo que ese framework hace fácil, y terminás con la arquitectura que la herramienta te impuso en vez
de la que el problema pedía. Y la trampa es que **no se siente como una decisión**: se siente como
que las cosas son obvias.

El punto de control: si al elegir el stack tuviste que **modificar la arquitectura**, parate. O la
arquitectura pedía algo irreal —y hay que corregirla conscientemente, dejando registro de qué
restricción técnica la dobló— o estás doblando el diseño para que entre en la herramienta que ya
querías usar. Distinguir entre las dos es el trabajo de arquitecto.

### El molde va antes que los candados

La fase 4 escribe las reglas en prosa, con su justificación. La fase 5 las automatiza.

Al revés produce reglas arbitrarias que nadie puede defender el día que molestan — y ahí se
desactivan. Una regla sin su por qué es una orden; con su por qué es criterio, y el criterio
sobrevive a los casos que la regla no anticipó.

---

## Las reglas que no se negocian

**Las puertas de salida se verifican, no se asumen.** Si la fase 1 nombra una tecnología, la fase 1
no está terminada. Volvé y sacala.

**Todo comando que escribas tiene que existir.** Verificalo contra el manifiesto real. Un comando
inventado en el onboarding destruye la confianza en el documento entero, y con razón.

**Cada decisión lleva su costo, no solo su beneficio.** No existe la decisión gratis.

**Cada regla dura lleva su por qué.**

**Un guardrail nace de un fallo real**, no de una hipótesis. Los inventados por si acaso son
fricción sin beneficio y erosionan la credibilidad de los que sí importan. Cada uno documenta en su
cabecera el modo de falla exacto que previene y por qué el CI normal no lo detecta.

**Verde no es correcto.** Los gates prueban que no rompiste lo que ya estaba probado. No prueban
que lo nuevo esté bien.

**Nada en silencio.** Los gaps se cierran o se registran. La deuda se anota cuando se toma, no
cuando alguien la descubre.

---

## El principio operativo central

> El comando `verify` local reproduce **exactamente** lo que corre el CI, en el **mismo orden**.
> Y existe un guardrail que compara ambos y falla si divergen.

No es una convención: es un candado.

La razón es empírica. En un proyecto real el CI sumó pasos y el script local no. La divergencia se
descubrió semanas después, con `verify` en verde y la rama principal en rojo. La lección no fue
"hay que acordarse de sincronizarlos" —nadie se acuerda— sino **hacer imposible que diverjan**.

La pregunta correcta frente a cualquier convención del proyecto es: *¿qué script la hace cumplir?*

Corolario que casi nadie aplica: **los guardrails necesitan guardrails**. Un linter que no puede
leer su configuración la descarta **en silencio** y sigue con los valores por defecto — lint en
verde que no comprueba casi nada. Es el peor modo de falla: silencioso y tranquilizador.

---

## Las tres capas de automatización

Saber cuál usar es la mitad del trabajo:

| Nivel | Cuándo | Ejemplo |
|---|---|---|
| **Linter** | La herramienta ya lo expresa | Prohibir `any`, prohibir logs por consola |
| **Guardrail** | Es una propiedad del repositorio | `verify` diverge del CI; un test existe pero ninguna tarea lo corre |
| **Fitness function** | Es una regla arquitectónica sobre el código | El dominio importa infraestructura; punto flotante en el cálculo de dinero |

**La regla de oro: cuando el linter no puede expresar una regla, se escribe un checker propio — no
se tuerce el linter.** Torcerlo produce una configuración que nadie entiende y que el próximo
borra. Un checker de AST de cuarenta líneas hace cumplir "el dominio es puro" mejor que cualquier
acuerdo verbal, y falla con un mensaje que explica qué hacer.

---

## La latencia del error

Un agente que descubre a los cuarenta minutos que rompió los tipos ya construyó trescientas líneas
sobre una base podrida. Por eso el kit define seis niveles de verificación, del diagnóstico del
editor al `verify` completo — ver `templates/BUCLE-RAPIDO.md`.

Dos reglas: **nunca saltes del nivel 1 al 5**, y **cada nivel declara qué NO detecta**. Esa segunda
columna es la que evita el falso "listo".

---

## Qué NO hace este skill

**No escribe la lógica de negocio.** Termina donde empieza el ciclo de cambio, que es el motor que
después corre indefinidamente.

**No impone un stack.** Impone que la elección esté justificada contra el diseño y que las
alternativas descartadas queden por escrito.

**No construye interfaces.** Para la UI de una aplicación —pantallas, sistema de diseño, estados,
accesibilidad— existe `app-craft`, que se enchufa al contrato que este skill definió. Para un sitio
de marketing existe `landing-craft`. Este skill construye el sistema y la disciplina que los
sostiene; no los reimplementa.

**No sirve para un script de un archivo.** El método se paga solo cuando el proyecto va a vivir
meses, lo van a tocar varias personas —o varias sesiones de agente sin memoria— y romperlo tiene
consecuencias reales.

**No está terminado.** Los guardrails crecen con los fallos que encontrás. Un proyecto de dos años
tiene candados que ninguna plantilla podía anticipar, porque nacieron de sus propios errores. Eso
es exactamente lo que tiene que pasar.

---

## Recursos del método

Este skill vive dentro del monorepo `guild`, así que sus recursos son rutas fijas relativas a la
raíz del repo — no hay enlace simbólico que resolver:

| Ruta (relativa a la raíz de `guild`) | Qué contiene |
|---|---|
| `docs/METODO-SYSTEM-CRAFT.md` | Los nueve principios, con la evidencia de dónde salió cada uno |
| `docs/prompts-system-craft/` | El prompt de cada fase, portable, con su puerta de salida y sus errores comunes |
| `agents/` | Los once agentes de fase — `scout` a `mason`, más `inspector` y `smith` |
| `templates/BUCLE-RAPIDO.md` | Los seis niveles de verificación |
| `templates/docs/` | Plantillas de documentos, con el por qué de cada sección |
| `templates/github/` | CI, build y publicación, revisor de pull requests, plantillas de issue y PR |
| `templates/guardrails/` | Los candados + las fitness functions |
| `templates/docker/` | Compose de desarrollo y de aplicación, con healthchecks y espera |
| `templates/profiles/` | Tooling por stack + el contrato para agregar uno nuevo |

Y `references/_convenciones.md`, junto a este archivo: el contrato que respeta cada agente de fase.
