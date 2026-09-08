# Fase 2 · Stack

## Objetivo

Elegir las tecnologías **contra el diseño**, no antes de él. Y dejar registrado por qué se descartó
cada alternativa.

La parte que la mayoría se saltea es la segunda. Un `STACK.md` que dice "usamos Postgres" no sirve
para nada: en seis meses alguien va a proponer cambiarlo y nadie va a recordar si Postgres se
eligió por una razón dura o porque era lo que había a mano. Un `STACK.md` que dice "Postgres, y
descartamos MySQL por X y DynamoDB por Y" convierte una discusión de dos días en una de dos
minutos.

## Precondiciones

- `docs/ARQUITECTURA.md` completo, sin nombres de tecnología
- `docs/PRD.md` con RNF numéricos (son las restricciones que van a decidir varias elecciones)

## EL PROMPT

```
Sos un arquitecto técnico. Ya existe el diseño del sistema. Ahora elegís el STACK.

LEÉ PRIMERO (obligatorio, en este orden):
1. docs/ARQUITECTURA.md — completo. Este es el documento que manda.
2. docs/PRD.md — especialmente los requisitos no funcionales (los números).
3. docs/GLOSARIO.md

RESTRICCIONES DEL EQUIPO (completá lo que aplique):
- Lenguajes que el equipo domina:
- Lenguajes vetados y por qué:
- Infraestructura ya existente que hay que reusar:
- Presupuesto de operación mensual:
- Tamaño del equipo:
- ¿Hay que poder contratar gente para esto?

REGLAS DE TRABAJO:

1. CADA ELECCIÓN SE JUSTIFICA CONTRA UNA RESTRICCIÓN CONCRETA del PRD o de la arquitectura.
   "Es lo más popular" no es una justificación. "Es lo que sé" tampoco — aunque puede ser una
   restricción legítima del equipo, y entonces se escribe como tal, con honestidad.

2. TODA ELECCIÓN LISTA SUS ALTERNATIVAS DESCARTADAS, con el motivo del descarte. Mínimo dos
   alternativas por decisión. Si no encontrás dos alternativas creíbles, probablemente no
   investigaste; o la decisión es tan obvia que no merece un ADR.

3. LA MADUREZ PESA MÁS QUE LA NOVEDAD. Preferí lo aburrido y probado salvo que haya una razón
   documentada. La innovación se gasta en el dominio del problema, no en la infraestructura.
   Si vas a usar algo nuevo, decí explícitamente qué presupuesto de riesgo estás gastando y por qué.

4. CONTÁ EL COSTO OPERATIVO. Cada pieza de infraestructura hay que monitorearla, actualizarla,
   respaldarla y despertarse por ella. Tres piezas menos es un equipo más chico. Preguntate:
   ¿esto lo puede operar el equipo que tenemos, a las 3 de la mañana?

5. SEÑALÁ LAS DECISIONES QUE NO SON MÍAS AÚN. Si algo depende de presupuesto, contrato o
   preferencia comercial, marcalo como "pendiente del owner" en vez de elegirlo por mí.

ENTREGABLE: docs/STACK.md

   # Stack — <Producto>

   ## TL;DR
   Tabla: capa | elección | alternativas descartadas
   Una fila por capa. Es el resumen que alguien lee en 30 segundos.

   ## Decisiones
   Un ADR por decisión, con formato FIJO:

   ### ADR-<n> · <Título de la decisión>
   **Contexto** — qué fuerza obliga a decidir. Citá el RNF o la sección de arquitectura.
   **Decisión** — qué elegimos. Una frase.
   **Por qué** — el razonamiento, contra el contexto.
   **Alternativas descartadas** — tabla: alternativa | por qué no.
   **Consecuencias** — qué nos habilita y qué nos cierra.
   **Costo operativo** — qué hay que operar, monitorear y respaldar por esta decisión.
   **Cuándo la revisaríamos** — la señal concreta.

   Cubrí como mínimo: lenguaje(s) · framework de servidor · persistencia · migraciones ·
   validación de entrada · trabajos en segundo plano · caché · almacenamiento de archivos ·
   autenticación · gestión de secretos · observabilidad (logs, métricas, trazas) ·
   pruebas (unit, integración, e2e) · lint y formato · gestor de paquetes ·
   estructura del repositorio (monorepo vs. polyrepo) · empaquetado y despliegue ·
   frontend si aplica.

   ## Versiones fijadas
   Tabla: componente | versión | política de actualización.
   Runtime y gestor de paquetes van fijados, no en rango.

   ## Pendiente del owner
   Las decisiones que necesitan input humano, con qué se necesita saber para cerrarlas.

Cuando termines, devolveme en el chat SOLO:
- La tabla TL;DR
- Las decisiones donde la alternativa descartada estuvo cerca (esas son las frágiles)
- Qué necesito decidir yo
```

## Puerta de salida

- [ ] Cada ADR tiene mínimo dos alternativas descartadas con motivo
- [ ] Cada ADR cita la restricción concreta que lo fuerza (un RNF o una sección de arquitectura)
- [ ] Está el costo operativo de cada pieza, no solo el beneficio
- [ ] Runtime y gestor de paquetes están fijados a versión exacta
- [ ] Ninguna elección se justifica solo con "es popular" o "es lo que sé" sin declararlo como tal
- [ ] La arquitectura de la fase 1 **no cambió** para acomodar una elección de stack

## El punto de control más importante

Si al elegir el stack tuviste que **modificar la arquitectura**, parate. Puede haber dos causas:

1. **La arquitectura pedía algo irreal** — entonces la fase 1 estaba mal y hay que corregirla
   conscientemente, dejando registro de qué restricción técnica la dobló.
2. **Estás doblando el diseño para que entre en la herramienta que ya querías usar** — y eso es
   exactamente lo que este orden de fases existe para evitar.

Distinguir entre las dos es el trabajo de arquitecto. Confundirlas es cómo un proyecto termina
siendo "lo que el framework permite".

## Errores comunes

**El stack por curriculum.** Elegir la tecnología que querés aprender. Es legítimo querer aprender;
no es legítimo que el proyecto pague la factura sin saberlo. Si lo hacés, escribilo en el ADR con
esas palabras.

**Contar solo el costo de construcción.** Una cola de mensajes se instala en una tarde y se opera
durante años. La pregunta correcta no es "¿cuánto tardo en montarlo?" sino "¿quién se despierta
cuando esto se rompe un domingo?".

**Los rangos de versión en el runtime.** `node: ">=20"` significa que tu máquina, la de tu colega y
el CI pueden estar corriendo tres versiones distintas. El día que eso importe, vas a perder una
tarde entera antes de sospechar del runtime.
