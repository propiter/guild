# Fase 3 · Modelo de datos

## Objetivo

Diseñar el esquema **y sus reglas transversales**, que son la parte que después no se puede
cambiar sin una migración dolorosa.

De todas las decisiones de un proyecto, el modelo de datos es la más cara de revertir. El código se
reescribe en una tarde; los datos en producción, no. Por eso esta fase se hace despacio.

## Precondiciones

- `docs/ARQUITECTURA.md` con los bounded contexts definidos
- `docs/STACK.md` con el motor de persistencia elegido
- `docs/PRD.md` con los requisitos de volumen y retención

## EL PROMPT

```
Sos un diseñador de bases de datos. Vas a definir el MODELO DE DATOS.

LEÉ PRIMERO (obligatorio):
1. docs/ARQUITECTURA.md — los bounded contexts marcan las fronteras del esquema
2. docs/STACK.md — el motor y las herramientas de migración ya están decididos
3. docs/PRD.md — volumen, retención, requisitos de auditoría
4. docs/GLOSARIO.md — los nombres del dominio salen de acá, no de tu imaginación

REGLAS DE TRABAJO:

1. LAS CONVENCIONES SE DECIDEN UNA VEZ, ARRIBA DE TODO, Y APLICAN A TODAS LAS TABLAS.
   Nomenclatura, tipo de clave primaria, identificadores públicos, marcas de tiempo, borrado
   lógico vs. físico, zona horaria, tipo para dinero, columna de tenant. Esta sección es el 80%
   del valor del documento: es lo que evita que la tabla 40 se parezca poco a la tabla 1.

2. EL DINERO Y EL TIEMPO SE DECIDEN EXPLÍCITAMENTE. Punto flotante para dinero es un defecto,
   no una preferencia. Elegí decimal de precisión fija o enteros de la unidad mínima, y decilo
   con el tipo exacto. Para el tiempo: qué se guarda en UTC, qué necesita zona horaria, y qué
   pasa con el horario de verano si tu dominio lo tiene.

3. CADA TABLA DECLARA SU DUEÑO Y SU POLÍTICA DE ACCESO. Qué bounded context la posee y quién
   puede leerla y escribirla. Si el sistema es multi-tenant, cada tabla dice cómo se aísla —
   y ese aislamiento tiene que ser verificable con un test, no una promesa.

4. TODA ENTIDAD DEL PRD APARECE. Si algo del PRD no tiene tabla, o falta una tabla o sobra un
   requisito. Hacé la verificación cruzada explícitamente y reportá los huecos.

5. LO QUE ES INMUTABLE SE DECLARA. Los registros contables, los eventos y las auditorías son
   append-only. Decidilo acá, porque después alguien va a escribir un UPDATE y va a tener razón
   si nadie se lo prohibió por escrito.

6. NO OPTIMICES TODAVÍA. Índices sí, particionado y desnormalización no — salvo que un RNF
   numérico lo exija. Anotá los candidatos en una sección "optimizaciones diferidas" con la
   señal que dispararía cada una.

ENTREGABLE: docs/MODELO-DATOS.md

   # Modelo de datos — <Producto>

   ## Convenciones (aplican a TODAS las tablas)
   La sección más importante. Nomenclatura · claves primarias · identificadores públicos ·
   marcas de tiempo · borrado · dinero · tiempo y zona horaria · aislamiento por tenant ·
   enumeraciones · JSON (cuándo sí y cuándo no).

   ## Diagrama de entidades
   ASCII o Mermaid. Agrupado por bounded context, no como una sopa de tablas.

   ## Tablas por contexto
   Una sección por bounded context. Por tabla: propósito en una frase, columnas con tipo y
   restricción, claves foráneas, índices con su justificación (qué consulta sirve cada uno),
   e invariantes que la base debe garantizar por sí misma.

   ## Aislamiento y permisos
   Cómo se garantiza que un tenant no vea datos de otro, y cómo se prueba. Con el test que lo
   verifica nombrado explícitamente.

   ## Migraciones
   Herramienta, dónde viven, cómo se nombran, y la REGLA DURA: qué se puede modificar de una
   migración ya aplicada (respuesta correcta: nada) y qué se hace en su lugar.

   ## Retención y archivado
   Qué se borra, cuándo, y qué se conserva por obligación legal.

   ## Respaldos
   Frecuencia, dónde, cómo se restaura, y CUÁNDO SE PROBÓ LA RESTAURACIÓN POR ÚLTIMA VEZ.
   Un respaldo que nunca se restauró es una hipótesis, no un respaldo.

   ## Optimizaciones diferidas
   Tabla: optimización | señal que la dispararía | costo estimado.

   ## Verificación cruzada con el PRD
   Tabla: entidad del PRD | tabla(s) | estado. Los huecos van marcados, no ocultos.

Cuando termines, devolveme en el chat SOLO:
- Las convenciones que fijaste (la lista, en una línea cada una)
- Los huecos que encontraste al cruzar con el PRD
- La decisión sobre dinero y sobre tiempo, textual
```

## Puerta de salida

- [ ] La sección de convenciones está completa y es específica (tipos exactos, no descripciones)
- [ ] El tipo de dato para dinero está decidido y **no es punto flotante**
- [ ] Toda tabla declara su dueño y su política de aislamiento
- [ ] Cada índice dice qué consulta sirve
- [ ] La verificación cruzada con el PRD está hecha y los huecos están listados
- [ ] La regla sobre migraciones ya aplicadas está escrita y es "no se tocan"
- [ ] Los respaldos tienen procedimiento de restauración, no solo de creación

## Errores comunes

**Las convenciones implícitas.** Nadie las escribe porque "son obvias". Después la tabla 1 usa
`id`, la 12 usa `uuid`, la 30 usa `pk`, y cada consulta que cruza tres tablas es un ejercicio de
arqueología. El costo no se paga al escribirlas: se paga al no escribirlas.

**Punto flotante para dinero.** `0.1 + 0.2 !== 0.3`. Esto no es una curiosidad académica: es una
diferencia de centavos que se acumula, y cuando la detecta el área contable ya llevás meses de
datos corruptos que hay que reprocesar.

**El respaldo que nunca se restauró.** Es el caso clásico de "verde ≠ correcto": el job de backup
corre todas las noches y reporta éxito. Nadie sabe si el archivo se puede restaurar hasta el día
que hace falta. Poné la fecha de la última restauración probada en el documento — la incomodidad
de verla vieja es exactamente el punto.
