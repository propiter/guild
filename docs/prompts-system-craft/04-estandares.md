# Fase 4 · Estándares

## Objetivo

Escribir **el molde**: cómo se construye cada pieza del sistema, de forma que dos personas
distintas produzcan código indistinguible.

Este es el documento más valioso de todo el proyecto y el que casi nadie escribe. Sin él, cada
recurso nuevo es una negociación: qué capas, dónde va la validación, cómo se devuelven los errores,
qué se testea. Con él, construir un recurso es **rellenar el molde**.

La prueba de que funciona: si dos endpoints se ven distintos y no hay una razón documentada, uno de
los dos está mal — y cualquiera lo puede señalar sin que sea una opinión.

## Precondiciones

- `docs/ARQUITECTURA.md` (las capas y contratos salen de acá)
- `docs/STACK.md` (las herramientas concretas)
- `docs/MODELO-DATOS.md` (las convenciones de datos se heredan, no se re-deciden)

## EL PROMPT

```
Sos el arquitecto responsable de los estándares de ingeniería. Vas a escribir EL MOLDE.

LEÉ PRIMERO (obligatorio):
1. docs/ARQUITECTURA.md — las capas y los contratos
2. docs/STACK.md — las herramientas
3. docs/MODELO-DATOS.md — las convenciones de datos, que acá se heredan y NO se re-deciden
4. docs/PRD.md — para saber qué tipo de piezas se van a construir en volumen

PRINCIPIO RECTOR DE ESTA FASE:
El objetivo no es "buenas prácticas genéricas". Cualquiera puede pegar una lista de buenas
prácticas. El objetivo es que construir la pieza número 40 de este sistema sea MECÁNICO:
copiar el molde, rellenarlo, correr el checklist.

REGLAS DE TRABAJO:

1. ESCRIBÍ LA ANATOMÍA CONCRETA, CON RUTAS DE ARCHIVO REALES. No "separá responsabilidades":
   el árbol exacto de archivos que produce un recurso nuevo, con el rol de cada archivo en una
   frase. Si no podés escribir el árbol, todavía no tenés un estándar.

2. TODA REGLA LLEVA SU POR QUÉ. Una regla sin justificación es una regla que alguien va a
   desactivar la primera vez que moleste — y va a tener razón, porque nadie puede defender lo
   que no entiende.

3. LAS REGLAS DEBEN SER VERIFICABLES. Por cada regla preguntate: ¿cómo se comprueba? Marcá
   cada una como (a) automatizable por el linter, (b) automatizable por un guardrail o fitness
   function, o (c) solo verificable por revisión humana. Las de tipo (a) y (b) se automatizan
   en la fase 5; ese es el insumo que le vas a dar.

4. EL DEFINITION OF DONE ES UN CHECKLIST ACCIONABLE, no una aspiración. Cada ítem se responde
   sí o no mirando el diff. "Código de calidad" no es un ítem; "toda entrada HTTP pasa por el
   validador declarado" sí lo es.

5. NO COPIES REGLAS QUE ESTE PROYECTO NO NECESITA. Un estándar inflado se ignora entero. Si una
   regla no previene un fallo real y previsible en ESTE sistema, no va.

ENTREGABLE: STANDARDS.md (en la raíz del repositorio, no en docs/)

   # Estándares de ingeniería — <Producto>

   ## 0 · Por qué existe este documento
   Qué problema resuelve. Y su regla de precedencia: qué gana si este documento contradice a
   otro.

   ## 1 · Principio rector
   Una frase que se pueda citar en una revisión de código para zanjar una discusión.

   ## 2 · No-negociables
   Tabla: regla | por qué | cómo se verifica (linter / guardrail / revisión humana).
   Cubrí: autenticación · aislamiento por tenant · contrato de error · trazabilidad de
   peticiones · idempotencia · dinero · identificadores públicos · registro de eventos.

   ## 3 · Anatomía de un <recurso/módulo/caso de uso>
   El árbol de archivos exacto, con el rol de cada uno.
   El esqueleto de código de cada archivo, copiable.
   Qué archivo NO puede importar a cuál (las reglas de dependencia entre capas).

   ## 4 · Reglas por dimensión
   Nomenclatura (con la tabla: elemento | convención | ejemplo) · tipos · errores (tabla
   completa de tipos de error con su código HTTP y cuándo se usa cada uno) · registro de
   eventos · configuración y variables de entorno · concurrencia · dependencias externas.

   ## 5 · Testing
   Qué capas de test existen, qué cubre cada una, y qué NO alcanza cada una. Con la regla
   dura: qué se testea obligatoriamente antes de escribir el código.

   ## 6 · Definition of Done
   Checklist accionable. Cada ítem verificable mirando el diff. Este checklist va también en
   la plantilla de pull request.

   ## 7 · Git y pull requests
   Formato de commits · tamaño máximo de PR y qué hacer cuando se pasa · qué se puede saltar
   y qué nunca.

   ## 8 · Cómo se usa este documento
   Para el que construye, para el que revisa, y qué hacer cuando el molde no alcanza para un
   caso (respuesta: se extiende el molde, no se improvisa una excepción silenciosa).

   ## Anexo · Reglas automatizables
   Tabla: regla | mecanismo (linter / guardrail / fitness function) | estado.
   Este anexo es el insumo directo de la fase 5.

Cuando termines, devolveme en el chat SOLO:
- El principio rector, textual
- La lista de no-negociables, una línea cada uno
- El anexo de reglas automatizables (la tabla completa)
```

## Puerta de salida

- [ ] Existe el árbol de archivos concreto de una pieza tipo, con rol por archivo
- [ ] Existe el esqueleto de código copiable
- [ ] Cada regla tiene su por qué
- [ ] Cada regla está clasificada como automatizable o no
- [ ] El Definition of Done se responde sí/no mirando un diff
- [ ] Existe la tabla completa de tipos de error
- [ ] El anexo de reglas automatizables está listo para la fase 5

## El activo oculto de esta fase

El anexo de reglas automatizables. Es lo que convierte los estándares de **prosa que se puede
ignorar** en **candados que rompen el build**.

Una regla en prosa se cumple mientras alguien la recuerde. Una regla automatizada se cumple
siempre, incluso a las 2 de la mañana, incluso por el agente que arrancó sesión sin contexto,
incluso por vos dentro de ocho meses.

## Errores comunes

**El estándar copiado de internet.** Cincuenta reglas genéricas que nadie leyó y que no responden
a ningún fallo real de este sistema. Se ignora entero en dos semanas. Un estándar de quince reglas
que el equipo entiende vale más que uno de cincuenta que nadie abre.

**Reglas sin mecanismo de verificación.** "El código debe ser mantenible" no es una regla, es un
deseo. Si no podés decir cómo se comprueba, no la escribas: estás gastando la credibilidad del
documento.

**Escribir el estándar después del código.** Entonces el estándar describe lo que ya hay, defectos
incluidos, y pierde su capacidad de corregir. El molde va primero. Ese es todo el punto del orden
de las fases.
