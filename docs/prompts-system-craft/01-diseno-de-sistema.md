# Fase 1 · Diseño de sistema

## Objetivo

Diseñar **cómo fluye la información y dónde viven las decisiones** — todavía sin elegir tecnología.

Esta es la fase que separa un sistema de una pila de código. La arquitectura no es el diagrama de
cajitas: es el conjunto de decisiones que van a ser caras de revertir. Tomarlas con conciencia acá
cuesta días; descubrirlas por accidente en el mes 6 cuesta meses.

## Precondiciones

- `docs/PRD.md` completo y con su puerta de salida pasada
- `docs/GLOSARIO.md` con los términos del dominio

## EL PROMPT

```
Sos un arquitecto de software. Ya existe el PRD. Tu trabajo es el DISEÑO DEL SISTEMA.

LEÉ PRIMERO (obligatorio, en este orden):
1. docs/PRD.md — completo
2. docs/GLOSARIO.md — completo

RESTRICCIÓN CENTRAL DE ESTA FASE:
NO elegís tecnología. Ni lenguaje, ni framework, ni motor de base de datos, ni proveedor de nube.
Podés decir "almacén relacional con transacciones ACID" pero NO "Postgres". Podés decir "cola de
trabajos con reintentos y dead-letter" pero NO "BullMQ".

Esto no es un juego. Si diseñás sabiendo que vas a usar el framework X, el diseño se deforma para
encajar en lo que X hace fácil, y terminás con la arquitectura que el framework te impuso en vez
de la que el problema pedía. El stack se elige en la fase 2, CONTRA este diseño.

REGLAS DE TRABAJO:

1. TODA DECISIÓN LLEVA SU JUSTIFICACIÓN Y SU COSTO. No existe la decisión gratis. Si elegís
   consistencia fuerte, decí qué disponibilidad perdés. Si elegís eventos, decí qué complejidad
   operativa comprás.

2. LOS FLUJOS CRÍTICOS SE DIBUJAN ENTEROS, CON SUS FALLOS. El camino feliz lo diseña cualquiera.
   Diseñá qué pasa cuando el tercero no responde, cuando el usuario cierra la pestaña a mitad,
   cuando llega el mismo pedido dos veces, cuando la red se corta después de cobrar pero antes
   de confirmar.

3. IDENTIFICÁ LO IRREVERSIBLE. Separá explícitamente las decisiones caras de revertir (modelo de
   tenancy, límites transaccionales, contrato público) de las baratas (qué biblioteca de fechas).
   Las caras merecen debate; las baratas merecen que las decidas rápido y sigas.

4. NO INVENTES REQUISITOS. Si el diseño necesita algo que el PRD no dice, es un GAP: anotalo
   explícitamente en una sección "Preguntas abiertas para producto". Nunca lo resuelvas en
   silencio inventando el requisito que te conviene.

ENTREGABLE: docs/ARQUITECTURA.md

   # Arquitectura — <Producto>

   ## Vista general
   Diagrama ASCII de los componentes y sus relaciones. Cada componente con una frase de
   responsabilidad. Si un componente necesita dos frases, probablemente son dos componentes.

   ## Bounded contexts
   Los dominios del sistema y sus fronteras. Para cada uno: qué decide, qué datos posee,
   con quién habla y a través de qué contrato. La frontera es donde cambia el lenguaje.

   ## Flujos críticos
   Para cada caso de uso de alta frecuencia del PRD: secuencia paso a paso, CON las ramas de
   fallo. Formato: camino feliz numerado, y debajo una tabla `fallo | detección | respuesta
   del sistema | qué ve el usuario`.

   ## Decisiones estructurales
   Una subsección por decisión irreversible. Para cada una:
   - Contexto: qué fuerza obliga a decidir
   - Decisión
   - Consecuencias: lo que ganamos Y lo que perdemos
   - Cuándo la revisaríamos: la señal concreta que nos haría reabrirla

   Cubrí como mínimo, si aplican: modelo de multi-tenancy · límites de transacción y
   consistencia · sincronía vs. asincronía por flujo · idempotencia · identidad y permisos ·
   versionado del contrato público · manejo de dinero y precisión · zona horaria y tiempo ·
   auditoría e inmutabilidad · modo de fallo (¿falla abierto o cerrado?).

   ## Contratos entre componentes
   Qué expone cada frontera. Todavía sin sintaxis concreta: "operación, entradas, salidas,
   errores posibles, si es idempotente".

   ## Modelo de fallo
   Qué pasa cuando cada dependencia externa se cae. Tabla: dependencia | modo de fallo |
   degradación aceptable | detección.

   ## Observabilidad
   Qué hay que poder responder en producción a las 3 de la mañana, y qué señal lo responde.
   Empezá por las preguntas, no por las métricas.

   ## Anti-patrones prohibidos en este proyecto
   Lo que sabemos que NO vamos a hacer, y por qué. Concreto y verificable.

   ## Preguntas abiertas para producto
   Los gaps del PRD que descubriste diseñando. Nunca los resuelvas vos en silencio.

Cuando termines, devolveme en el chat SOLO:
- Las decisiones irreversibles que tomaste, en una línea cada una
- Los gaps del PRD que encontraste
- Qué parte del diseño te dejó menos conforme y por qué
```

## Puerta de salida

- [ ] El documento **no nombra ni una tecnología concreta**
- [ ] Cada flujo crítico tiene sus ramas de fallo, no solo el camino feliz
- [ ] Cada decisión estructural dice qué se pierde, no solo qué se gana
- [ ] Está explícito qué es caro de revertir y qué es barato
- [ ] Los gaps del PRD están listados, no resueltos por invención
- [ ] Podés explicar el sistema entero con el diagrama de "Vista general" en la mano

## Errores comunes

**Diseñar con el framework puesto.** Es la trampa más difícil de ver porque no se siente como una
decisión: simplemente "obvio que las entidades son así" — porque así las modela el ORM que ya
tenías en la cabeza. El test: si tu diseño solo tiene sentido con una tecnología específica, no
diseñaste, configuraste.

**El diagrama sin responsabilidades.** Cajitas con flechas que no dicen quién decide qué. Un
diagrama sin la frase de responsabilidad por componente es decoración: se puede leer de cinco
maneras distintas y cada persona del equipo leerá la suya.

**Los fallos "los vemos después".** Nunca se ven después. Se ven en producción, un domingo. El
modelo de fallo escrito acá es lo que después se convierte en los estados de error de la UI, los
reintentos de la cola y las alertas — todo eso ya está decidido en esta fase, lo escribas o no.
