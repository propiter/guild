# Fase 7 · Roadmap

## Objetivo

Ordenar el trabajo en una **secuencia con dependencias explícitas**, y establecer el mecanismo que
impide que la deuda técnica se acumule en silencio.

Un roadmap no es una lista de deseos con fechas. Es la respuesta a una sola pregunta: **¿qué sigue,
y por qué eso y no otra cosa?** Si un agente o un desarrollador nuevo no puede responderla leyendo
este documento, el documento no cumple su función.

## Precondiciones

- Fases 0 a 6 completas
- Andamiaje funcionando (`verify` en verde)

## EL PROMPT

```
Vas a escribir el ROADMAP: la secuencia de trabajo del proyecto.

LEÉ PRIMERO (obligatorio):
1. docs/PRD.md — el alcance por etapas y las métricas
2. docs/ARQUITECTURA.md — las dependencias técnicas reales entre componentes
3. docs/MODELO-DATOS.md — qué tablas necesita cada capacidad
4. STANDARDS.md — la sección de prerequisitos, si existe

REGLAS DE TRABAJO:

1. ORDENÁ POR DEPENDENCIA TÉCNICA, NO POR ENTUSIASMO. Las capacidades transversales
   (identidad, permisos, aislamiento, contrato de error, migraciones, observabilidad) van
   primero porque todo lo demás las asume. Construir la primera funcionalidad de negocio antes
   que el aislamiento por tenant significa reescribirla después.

2. CADA ELEMENTO DECLARA QUÉ BLOQUEA Y QUÉ LO BLOQUEA. Si dos elementos no tienen dependencia
   entre sí, decilo: son paralelizables, y eso es información valiosa.

3. CADA ELEMENTO TIENE UN CRITERIO DE CIERRE VERIFICABLE. "Módulo de facturas" no es un
   criterio. "Se puede emitir una factura, consultarla y anularla, con test de integración que
   lo prueba contra base real" sí lo es.

4. INCLUÍ LA TABLA DE DEUDA TÉCNICA REGISTRADA. Esta es la pieza que hace la diferencia:

   Tabla: # | Tarea | Por qué no se hizo | Cuándo se hace

   Toda decisión de dejar algo a medias se anota acá, en el momento en que se toma. Es la
   diferencia entre deuda técnica —que es una decisión consciente con fecha de pago— y
   desprolijidad —que es lo mismo pero sin que nadie se acuerde.

   Esta tabla se audita periódicamente. Poné cuándo.

5. NO PONGAS FECHAS QUE NO PODÉS SOSTENER. Un roadmap con fechas inventadas se descarta entero
   la primera vez que se incumple. Ordená por secuencia; si necesitás fechas, ponelas solo en
   los hitos que tienen un compromiso externo real.

ENTREGABLE: docs/ROADMAP.md

   # Roadmap — <Producto>

   ## El norte
   Qué estamos construyendo, en dos líneas. Para releer cuando el detalle marea.

   ## Secuencia
   Etapas ordenadas. Por cada elemento:
   - Nombre e identificador
   - Qué habilita (en términos de producto, no de código)
   - Depende de: <elementos>
   - Bloquea a: <elementos>
   - Criterio de cierre verificable
   - Estado: ⬜ pendiente · 🚧 en curso · ✅ cerrado

   ## Grafo de dependencias
   Diagrama ASCII. Se ve de un vistazo qué es paralelizable.

   ## Hitos
   Solo los que tienen un compromiso externo real. Con fecha únicamente si existe.

   ## Deuda técnica registrada
   Tabla: # | Tarea | Por qué no se hizo | Cuándo se hace
   Más: cada cuánto se audita esta tabla y quién.

   ## Decisiones pendientes del owner
   Lo que está bloqueado esperando una decisión humana, y qué se necesita para desbloquearlo.

Cuando termines, devolveme en el chat SOLO:
- La secuencia, una línea por elemento
- El primer elemento y por qué es ese y no otro
- Las decisiones que necesito tomar yo para desbloquear
```

## Puerta de salida

- [ ] Cada elemento declara sus dependencias en ambas direcciones
- [ ] Cada elemento tiene criterio de cierre verificable
- [ ] Las capacidades transversales están antes que las funcionalidades de negocio
- [ ] Existe la tabla de deuda técnica registrada, con su cadencia de auditoría
- [ ] No hay fechas inventadas
- [ ] Leyendo solo este documento se puede responder "¿qué sigue?"

## Por qué la deuda registrada cambia todo

Sin esa tabla, la deuda técnica existe igual — pero distribuida en la memoria de quien la creó, y
se pierde en la primera rotación de equipo o en el primer contexto compactado. Después aparece
como "el código está raro acá" sin que nadie sepa que fue una decisión deliberada, tomada con un
motivo que en su momento fue bueno.

Escribirla tiene un segundo efecto, más interesante: **hace visible el ritmo al que la estás
tomando**. Una tabla que crece más rápido de lo que se vacía es una señal medible, no una
sensación.

## Errores comunes

**Ordenar por lo que da ganas de construir.** La funcionalidad estrella primero, el aislamiento por
tenant después. Resultado: se reescribe la funcionalidad estrella cuando llega el aislamiento, y
esa reescritura nunca estaba en el plan.

**Criterios de cierre vagos.** "Terminar el módulo X". Nadie sabe cuándo está terminado, así que se
declara terminado cuando alguien se cansa.

**El roadmap que nadie actualiza.** Si no se actualiza al cerrar cada elemento, en un mes es
ficción. Actualizarlo tiene que ser parte del cierre del ciclo de cambio (fase 8), no una tarea
aparte que alguien tiene que recordar.
