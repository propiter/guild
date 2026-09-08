# Fase 0 · Descubrimiento

## Objetivo

Responder **qué se construye, para quién y por qué vale la pena** — antes de que exista una sola
línea de código o el nombre de un framework.

Esta fase parece la más blanda y es la que más proyectos hunde. Un PRD vago no se nota en la semana
1; se nota en el mes 4, cuando dos personas discuten una feature y descubren que llevaban meses
construyendo productos distintos.

## Precondiciones

Ninguna. Es el punto cero.

Lo único que necesitás es una idea y la disposición a que te la desarmen.

## EL PROMPT

```
Sos un arquitecto de producto. Vamos a arrancar un proyecto nuevo desde cero y tu primer trabajo
es el DESCUBRIMIENTO. No vas a escribir código ni a elegir tecnología en esta fase.

IDEA INICIAL:
<describí tu idea en 3-10 líneas. Sin pulir. Como se la contarías a un colega en un café.>

CONTEXTO CONOCIDO (completá lo que sepas, dejá vacío lo que no):
- Usuarios objetivo:
- Restricciones regulatorias / legales:
- Restricciones de presupuesto o plazo:
- Sistemas existentes con los que debe convivir:
- Competencia conocida:

REGLAS DE TRABAJO:

1. INVESTIGÁ ANTES DE PREGUNTAR. Buscá en la web el mercado, los competidores, la regulación
   aplicable y las soluciones que ya existen. Preguntarme diez cosas que podés averiguar solo es
   trasladarme el trabajo. Preguntá SOLO lo que es genuinamente una decisión mía (presupuesto,
   apetito de riesgo, plazos, preferencias comerciales).

2. DESAFIÁ LA IDEA. Si el problema ya está resuelto por un producto maduro y barato, decímelo con
   evidencia. Si el mercado es demasiado chico, decímelo con números. Tu trabajo no es validarme,
   es evitar que construya algo que no debería existir.

3. NADA DE TECNOLOGÍA. Ni lenguajes, ni frameworks, ni bases de datos, ni "usaríamos Postgres".
   Si escribís el nombre de una tecnología en esta fase, fallaste la fase.

4. NUMERÁ LO QUE NO SABÉS. Todo supuesto que no puedas verificar va a una sección explícita de
   "Supuestos a validar", con cómo se validaría cada uno. No los escondas en prosa afirmativa.

ENTREGABLES (escribí los archivos, no me los muestres en el chat):

A) docs/PRD.md con esta estructura exacta:

   # PRD — <Producto>

   ## Visión
   Un párrafo. Qué mundo existe si esto funciona.

   ## El problema
   Quién lo sufre, con qué frecuencia, cuánto le cuesta hoy (tiempo o dinero) y cómo lo
   resuelve actualmente. Con evidencia de la investigación, no con intuición.

   ## Personas
   2-4 personas. Para cada una: rol, contexto de uso, qué le importa, qué la frustra hoy,
   y su nivel técnico. Nombralas por rol, nunca por nombre propio.

   ## Casos de uso
   Ordenados POR FRECUENCIA REAL, no por lo interesantes que son. El caso de uso que ocurre
   200 veces al día manda sobre el que ocurre una vez al mes.

   ## Requisitos funcionales
   Lista numerada RF1..RFn. Cada uno verificable: si no podés escribir un test que lo pruebe,
   está mal redactado.

   ## Requisitos no funcionales
   RNF1..RNFn con NÚMEROS: latencia, disponibilidad, volumen, concurrencia, retención.
   "Debe ser rápido" no es un requisito, es un deseo.

   ## Fuera de alcance
   Explícito. Qué NO hace este producto, y por qué. Esta sección previene más discusiones
   que todas las anteriores juntas.

   ## Métricas de éxito
   Cómo sabremos en 3, 6 y 12 meses si funcionó. Con umbral numérico.

   ## Riesgos
   Tabla: riesgo | probabilidad | impacto | mitigación.

   ## Supuestos a validar
   Tabla: supuesto | por qué importa | cómo se valida | estado.

B) docs/GLOSARIO.md — todo término del dominio que un desarrollador nuevo no entendería.
   Si el dominio tiene jerga regulatoria o sectorial, va acá. Este archivo evita que el mismo
   concepto termine con tres nombres distintos en el código.

C) docs/README.md — índice de la documentación, con una tabla: documento | qué contiene | estado.
   Marcá cada doc como ✅ completo, 🚧 en progreso o ⬜ pendiente.

Cuando termines, devolveme en el chat SOLO:
- Los 3 hallazgos de la investigación que más cambian la idea original
- Las decisiones que necesito tomar yo
- Qué escribiste en "Supuestos a validar"
```

## Puerta de salida

No avances a la fase 1 hasta que:

- [ ] Cada RF es verificable — podés imaginar el test que lo prueba
- [ ] Cada RNF tiene un número, no un adjetivo
- [ ] "Fuera de alcance" no está vacío
- [ ] Los supuestos sin validar están listados como tales, no disfrazados de hechos
- [ ] El PRD no menciona **ninguna** tecnología
- [ ] Una persona ajena al proyecto lee el PRD y te puede explicar de vuelta qué se construye

## Errores comunes

**El PRD que es una lista de features.** Un PRD describe problemas y resultados. "Necesita un
dashboard" no es un requisito, es una solución que se coló disfrazada de requisito. Preguntá:
¿qué decisión toma el usuario mirando ese dashboard? Eso sí es el requisito.

**Los RNF de adorno.** "Alta disponibilidad" sin número no restringe nada, y por eso no sirve de
nada. La diferencia entre 99% y 99.99% son tres órdenes de magnitud de complejidad y costo. Si no
lo definís acá, lo va a definir por accidente la primera decisión de infraestructura.

**Saltarse el glosario.** Parece burocracia hasta el día en que descubrís que "cliente", "usuario"
y "cuenta" significan tres cosas distintas en tres partes del código, y que ninguna coincide con
lo que el negocio llama "cliente".
