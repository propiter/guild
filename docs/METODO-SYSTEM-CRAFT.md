# El método

Esto no es una teoría de cómo deberían hacerse los proyectos. Es lo que quedó al destilar tres
proyectos reales que funcionan, sacarles el dominio, y quedarse con la forma.

Las fuentes: tres sistemas en producción —dos monorepos TypeScript y un servicio Python— en
dominios sin relación entre sí. Distinta escala, distintas restricciones, distintos lenguajes. El
mismo esqueleto.

Que el esqueleto se repita a través de los lenguajes es el dato más importante de todos: significa
que lo que funciona **no es el stack**. Es el método.

---

## Los tres estratos

Todo proyecto bien construido tiene tres capas, y confundirlas es el origen de la mayoría del caos:

```
   MÉTODO         Fases, documentos, puertas, ciclo de cambio
   ─────────      Idéntico en los tres proyectos. No depende del lenguaje.

   PERFIL         Herramientas concretas: pnpm/uv, biome/ruff, tsc/mypy
   ─────────      Varía por stack. Intercambiable.

   GUARDRAILS     Los candados que hacen cumplir el método en máquina
   ─────────      Nacen de fallos reales. Crecen con el proyecto.
```

Cuando alguien "copia la estructura" de un proyecto exitoso y no le funciona, casi siempre copió el
**perfil** —los archivos de configuración— y se dejó el método y los guardrails, que son donde vive
el valor.

---

## Principio 1 · Una fuente de verdad por pregunta

Cada documento responde **una** pregunta, y ninguna pregunta tiene dos documentos.

| Pregunta | Documento |
|---|---|
| ¿Qué construimos y para quién? | `docs/PRD.md` |
| ¿Cómo fluye el sistema? | `docs/ARQUITECTURA.md` |
| ¿Por qué elegimos esta tecnología? | `docs/STACK.md` |
| ¿Cómo se construye una pieza? | `STANDARDS.md` |
| ¿Qué sigue? | `docs/ROADMAP.md` |
| ¿Cómo arranco sin contexto? | `docs/AGENT-ONBOARDING.md` |
| ¿Qué es verdad hoy? | El código y el historial |

Cuando dos documentos responden lo mismo, uno está desactualizado y **nadie sabe cuál**. Esa es la
causa raíz de casi toda la deuda documental: no es que la gente no escriba documentación, es que
escribe la misma cosa en tres lugares y después ninguno se puede confiar.

---

## Principio 2 · La arquitectura antes que el stack

Se diseña el sistema **sin nombrar una sola tecnología**. Recién después se elige con qué
materializarlo, y cada elección se justifica contra el diseño.

Si elegís el framework primero, la arquitectura termina siendo "lo que ese framework hace fácil".
Y la trampa es que no se siente como una decisión: se siente como que las cosas son obvias. Son
obvias, pero para el framework, no para el problema.

El `STACK.md` de los tres proyectos usa el mismo formato —contexto, decisión, por qué, alternativas
descartadas, consecuencias— y la sección que hace todo el trabajo es **alternativas descartadas**.
Es la que convierte una discusión de dos días, seis meses más tarde, en una de dos minutos.

---

## Principio 3 · El molde antes que la primera pieza

`STANDARDS.md` define cómo se construye una pieza: el árbol de archivos exacto, el esqueleto de
código, las reglas de dependencia entre capas, y un Definition of Done que se responde sí o no
mirando el diff.

La regla que lo resume, tomada literalmente de uno de los proyectos:

> Si dos endpoints se ven distintos sin una razón documentada, uno de los dos está mal.

El molde tiene un efecto que no es obvio hasta que lo tenés: convierte las discusiones de estilo en
verificaciones. Deja de ser "a mí me parece mejor así" y pasa a ser "el molde dice otra cosa" — que
se resuelve en un comentario, no en una reunión.

Y cuando el molde existe, se puede **generar**: uno de los proyectos tiene un directorio `_template`
y un script que lo copia y sustituye los nombres. Construir la pieza número 40 es un comando.

---

## Principio 4 · `verify` == CI, forzado por código

Este es el principio operativo más valioso del método, y el menos común de encontrar.

Existe un comando local —`verify`— que reproduce **exactamente** lo que corre el CI, en el **mismo
orden**. Y existe un guardrail que compara ambos y **falla si divergen**.

No es una convención. Es un candado.

La razón es empírica: en un proyecto real, el CI sumó pasos y el script local no. La divergencia se
descubrió semanas después, con `verify` en verde local y la rama principal en rojo. La lección no
fue "hay que acordarse de sincronizarlos" —nadie se acuerda— sino **"hay que hacer imposible que
diverjan"**.

Todo lo que dependa de que alguien se acuerde, va a fallar. La pregunta correcta frente a cualquier
convención es: *¿qué script la hace cumplir?*

---

## Principio 5 · Las reglas se automatizan o se ignoran

Una regla escrita en prosa se cumple mientras alguien la recuerde. Una regla automatizada se cumple
siempre — a las 2 de la mañana, en una sesión sin contexto, dentro de ocho meses.

Hay tres niveles, y saber cuál usar es la mitad del trabajo:

**1 · El linter** — para lo que la herramienta ya expresa. Prohibir `any`, prohibir `console.log`,
prohibir la aserción de no-nulo en código de producción (permitida en tests, porque ahí el costo de
la ceremonia supera al riesgo).

**2 · Guardrails** — scripts que verifican propiedades del repositorio que ningún linter puede ver:
que `verify` esté sincronizado con el CI, que el linter esté leyendo su configuración de verdad,
que todo archivo de test lo ejecute realmente una tarea, que lo que un Dockerfile copia exista.

**3 · Fitness functions** — checkers que analizan el árbol sintáctico para hacer cumplir reglas
arquitectónicas: que la capa de dominio no importe infraestructura, que no haya punto flotante en
el cálculo de dinero, que no se lea el reloj implícitamente.

La regla de oro: **cuando el linter no puede expresar una regla, se escribe un checker propio — no
se tuerce el linter**. Un checker de AST de cuarenta líneas hace cumplir "el dominio es puro" mejor
que cualquier acuerdo verbal, y falla con un mensaje que explica qué hacer.

### Los guardrails tienen guardrails

El paso que separa a los proyectos disciplinados de los que solo lo parecen: hay scripts que
verifican que **las propias herramientas de calidad estén funcionando**.

Un linter que no puede leer su configuración **la descarta en silencio** y sigue con los valores por
defecto. El resultado es lint en verde que no comprueba casi nada. Es el peor modo de falla
posible: silencioso y tranquilizador.

Por eso existe un script que verifica, con dos señales independientes, que la configuración
realmente se está aplicando.

### Un guardrail nace de un fallo real

No de una hipótesis. Cada guardrail documenta en su cabecera **el fallo exacto que previene** y por
qué el CI normal no lo detecta.

Los guardrails inventados "por si acaso" son fricción sin beneficio, y erosionan la credibilidad de
los que sí importan. El día que uno molesta, la pregunta es "¿qué fallo previene?" — y si la
cabecera no tiene una respuesta concreta, sobra.

---

## Principio 6 · Verde no es correcto

Cuatro reglas de escepticismo, todas nacidas de fallos reales:

**Verde ≠ correcto.** Los gates prueban que no rompiste lo que ya estaba probado. No prueban que lo
nuevo esté bien. Uno de los proyectos registra un cambio que se aprobó "sin advertencias, checklist
al 100%" y tenía once defectos reales. Ese registro vale más que cincuenta ciclos exitosos.

**Un test que nunca falló no es un test.** Antes de darlo por bueno, reintroducí el defecto y
comprobá que se pone rojo. Es la razón por la que el ciclo RED→GREEN no es una formalidad: si nunca
viste el test en rojo, no tenés evidencia de que pruebe algo.

**Fallá cerrado.** Un valor por defecto que aparece cuando falta configuración es una trampa que
solo se dispara en producción. Que falte una variable de entorno tiene que romper el arranque, no
activar un comportamiento silencioso que nadie eligió.

**Probá el artefacto publicado, no el código fuente.** El smoke test arranca la imagen construida
con su comando de producción, y pega contra una ruta que **usa** las dependencias inyectadas — una
aplicación con la inyección rota responde `/health` perfecto. Y el healthcheck del contenedor
apunta a *liveness*, nunca a *readiness*: si falla solo puede reiniciar el proceso, y reiniciar no
arregla una base caída — apuntarlo a una ruta que consulta dependencias convierte un hipo de la
base en el reinicio simultáneo de todas las réplicas. Uno de los proyectos va más lejos:
tiene arneses que compilan contra el paquete **publicado**, con configuración de módulos
deliberadamente distinta a la del monorepo, para cazar exactamente la clase de defecto que sufre un
consumidor externo y que el proyecto no puede ver desde adentro.

---

## Principio 7 · Nada en silencio

**La deuda técnica se registra en el momento en que se toma.** Una tabla con cuatro columnas:
número, tarea, por qué no se hizo, cuándo se hace.

Esa tabla es la diferencia entre **deuda técnica** —una decisión consciente con fecha de pago— y
**desprolijidad** —lo mismo, pero sin que nadie se acuerde.

Tiene un segundo efecto, más interesante: hace visible **el ritmo** al que la estás tomando. Una
tabla que crece más rápido de lo que se vacía es una señal medible, no una sensación.

**Los huecos se registran o se cierran, nunca se callan.** Detectar un problema y no decirlo es peor
que no detectarlo: consume la oportunidad de que otro lo encuentre.

**Los documentos pueden mentir. El código no.** El protocolo de arranque incluye, explícitamente,
verificar contra el código lo que los documentos afirman — incluido el propio documento de
arranque. Y si un documento miente, se corrige en el momento en que se detecta.

---

## Principio 8 · Terminar no es mergear

Terminar un pull request no es terminar. Terminar es que la unidad de trabajo del roadmap esté
**cerrada**: el ciclo completo —propuesta, especificación, diseño, tareas, implementación,
verificación, archivo— y el roadmap actualizado.

El ciclo tiene un orden que importa: **la especificación se escribe antes que el diseño**. Si
diseñás primero, la especificación termina describiendo tu diseño, y la verificación comprueba que
el diseño hace lo que el diseño dice. Es una tautología que se siente como rigor.

La especificación tiene que poder **contradecir** al diseño. Solo puede hacerlo si se escribió sin
conocerlo.

Y la verificación se hace **contra la especificación**, no contra el build. "Todo verde" no es un
veredicto.

---

## Principio 9 · Unidades que se pueden revisar

Pull requests de menos de 400 líneas. Cuando el cambio no entra, se encadena.

Un pull request de 2000 líneas no se revisa: se aprueba. Y eso es otra cosa muy distinta, aunque el
botón sea el mismo.

---

## Lo que este método NO es

**No es burocracia.** Cada artefacto responde una pregunta que alguien va a hacer. Si un documento
no responde ninguna pregunta real, sacalo — el método no mejora agregándole documentos.

**No es una plantilla para copiar.** Copiar los archivos de configuración sin el método es
cargo cult: te queda la forma sin la fuerza que la sostiene.

**No es para todo.** Un script de un archivo no necesita nueve fases. El método se paga solo cuando
el proyecto va a vivir más de unos meses, lo va a tocar más de una persona (o más de una sesión de
agente sin memoria), y romperlo tiene consecuencias reales.

**No está terminado.** Los guardrails crecen con los fallos que encontrás. Un proyecto de dos años
tiene guardrails que ninguna plantilla podía anticipar, porque nacieron de sus propios errores. Eso
es exactamente lo que tiene que pasar.
