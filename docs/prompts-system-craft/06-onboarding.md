# Fase 6 · Onboarding

## Objetivo

Escribir los dos documentos que permiten que **alguien sin contexto —humano o agente— arranque
solo y no rompa nada**.

Son dos, y confundirlos es el error más común:

| Documento | Cuándo se lee | Qué contiene |
|---|---|---|
| `CLAUDE.md` (raíz) | **Siempre**, cargado automáticamente | Lo que hay que tener presente todo el tiempo: stack, estructura, comandos, prohibiciones |
| `docs/AGENT-ONBOARDING.md` | Al **arrancar** una sesión, pegado a mano | El protocolo: cómo averiguar dónde estamos y qué sigue |

`CLAUDE.md` es el manual de la máquina. `AGENT-ONBOARDING.md` es el procedimiento de arranque.
Uno describe el estado; el otro, el método.

## Precondiciones

- Fase 5 terminada: los comandos que el onboarding menciona tienen que existir de verdad
- `STANDARDS.md` completo
- `docs/ROADMAP.md` puede estar vacío todavía — la fase 7 lo llena

## EL PROMPT

```
Vas a escribir los documentos de ONBOARDING del proyecto.

LEÉ PRIMERO (obligatorio):
1. STANDARDS.md
2. docs/STACK.md
3. docs/ARQUITECTURA.md
4. package.json / pyproject.toml — los comandos REALES. No inventes ninguno.
5. .github/workflows/ci.yml — los gates reales

PRINCIPIO CENTRAL:
Estos documentos se escriben para el lector que NO tiene contexto y NO puede preguntarte:
vos dentro de ocho meses, un desarrollador nuevo, o un agente en una sesión limpia.

Ese lector no sabe qué es obvio. Todo lo que quede implícito, se pierde.

REGLAS DE TRABAJO:

1. TODO COMANDO QUE ESCRIBAS TIENE QUE EXISTIR. Verificalo contra el archivo de manifiesto.
   Un comando inventado en el onboarding hace que el lector desconfíe del documento entero —
   y con razón.

2. EL ONBOARDING ENSEÑA A AVERIGUAR EL ESTADO, NO LO DECLARA. "Vamos por la fase 3" envejece en
   una semana y después miente. "Corré estos comandos para saber en qué fase estamos" no
   envejece nunca. Escribí criterio y método, no datos.

3. INCLUÍ EXPLÍCITAMENTE QUE LOS DOCUMENTOS PUEDEN MENTIR. Incluido ese mismo documento. La
   verdad está en el código y en el historial. Los documentos son un atajo, no una fuente de
   autoridad — y si el lector detecta que uno miente, su trabajo es corregirlo ahí mismo.

4. LAS PROHIBICIONES SON EXPLÍCITAS Y JUSTIFICADAS. No "seguí las buenas prácticas". La lista
   concreta de lo que nunca se hace en este proyecto, cada una con su motivo.

5. INCLUÍ LAS REGLAS DE ESCEPTICISMO. Son las que evitan el falso "listo":
   - "Verde ≠ correcto": los gates prueban que no rompiste lo que ya estaba probado. No prueban
     que lo nuevo esté bien.
   - "Un test que nunca falló no es un test": reintroducí el defecto y comprobá que se pone rojo.
   - "Fallá cerrado": un valor por defecto que aparece cuando falta configuración es una trampa
     que solo se dispara en producción.
   - "Los gaps nunca en silencio": lo que detectás y no vas a cerrar se registra en el roadmap.
     Detectar un problema y callarlo es peor que no detectarlo, porque consume la oportunidad
     de que otro lo encuentre.

6. INCLUÍ LA DISCIPLINA DE EJECUCIÓN. Son las reglas que deciden si el proyecto acumula deuda
   o no. Van textuales, no parafraseadas, porque son las que más se erosionan:

   - "Cero deuda por encima de rapidez": se corrige de RAÍZ, nunca con parches que tapen. Si una
     decisión inicial resultó equivocada, se corrige el código Y la documentación para que queden
     consistentes. Un parche es deuda que además esconde dónde está el problema.
   - "TDD estricto, RED→GREEN": primero el test, se comprueba que falla POR EL MOTIVO CORRECTO, y
     recién después el código. La lógica crítica del dominio va con test de integración contra
     infraestructura real, nunca solo contra simulacros.
   - "Los bugs se corrigen al encontrarlos": no se anotan para después. Y se corrigen con datos
     verificados contra la fuente, no con una hipótesis de qué los causa.
   - "Un ciclo se ejecuta entero o no se ejecuta": nada de dejar la implementación a medias y
     reportar avance. Un ciclo con el código escrito y la verificación pendiente es exactamente
     la deuda que el método no acepta.
   - "Nunca asumas": verificá contra la fuente verídica. Los comentarios, los tipos y los informes
     de verificación previos pueden mentir.

   Cada una lleva su por qué. Sin el por qué, son órdenes; con el por qué, son criterio — y el
   criterio sobrevive a los casos que la regla no anticipó.

7. DEFINÍ QUÉ SIGNIFICA "TERMINADO". Terminar un pull request no es terminar. Definí el límite
   real de una unidad de trabajo en este proyecto, y qué se hace cuando se alcanza.

ENTREGABLES:

A) CLAUDE.md (raíz del repositorio) — se carga SIEMPRE. Máximo dos pantallas: todo lo que
   agregues acá se paga en cada sesión, y un documento largo se lee en diagonal.

   # <Producto>
   ## Qué construimos — 3 líneas
   ## Stack — tabla compacta, marcada como BLOQUEADA (no se cambia sin discutir)
   ## Estructura del repositorio — árbol de un nivel, con la responsabilidad de cada carpeta
   ## Convenciones — solo las que se aplican a diario; el resto vive en STANDARDS.md
   ## Comandos — tabla: comando | qué hace | cuándo se usa
   ## Qué NO hacer — la lista de prohibiciones, con su motivo
   ## Cómo trabajar una tarea — el flujo en pasos numerados
   ## Dónde está cada cosa — tabla: pregunta | documento que la responde

B) docs/AGENT-ONBOARDING.md — se pega al arrancar sesión. Puede ser más largo.

   # Onboarding

   ## 0 · No pares
   Lo que más se rompe, así que va primero: qué significa terminar, y por qué terminar un pull
   request no es terminar. Un ciclo se ejecuta entero o no se ejecuta. La única razón legítima
   para frenar, y qué hacer mientras tanto (registrar y seguir con lo que no depende de eso).

   ## 1 · Lo innegociable
   Cero deuda por encima de rapidez · fix de raíz, nunca parches · TDD estricto RED→GREEN ·
   los bugs se corrigen al encontrarlos · los gaps se cierran o se registran, nunca se callan ·
   nunca asumas, verificá contra la fuente.

   ## 2 · Protocolo de arranque (antes de tocar nada)
   Pasos numerados y verificables:
   1. Recuperar memoria de sesiones previas (comando exacto)
   2. Leer la secuencia de trabajo (docs/ROADMAP.md)
   3. Averiguar el estado real: historial de commits, pull requests abiertos, estado del CI,
      ciclos de cambio a medias — con los comandos exactos
   4. VERIFICAR EN EL CÓDIGO. Los documentos y la memoria pueden estar desactualizados. Si
      algo dice que X está hecho, comprobá que X existe. Si un documento miente, corregilo.
   5. Declarar el plan en UNA línea antes de ejecutar.

   Incluí el árbol de decisión: ¿hay trabajo a medias? → terminalo primero. ¿Todo cerrado? →
   lo siguiente del roadmap. ¿Hueco evidente? → agregalo al roadmap con justificación.

   ## 3 · Cómo trabajo
   Ciclo de cambio, TDD, tamaño de los pull requests, commits, y las reglas de escepticismo.

   ## 4 · Decisiones cerradas
   Lo que NO se re-litiga, con el motivo y dónde está documentado en detalle. Esta sección
   evita que cada sesión nueva reabra las mismas cinco discusiones.

   ## 5 · Cuándo parar y preguntar
   La lista corta de decisiones que son del owner (dinero, infraestructura compartida,
   secretos, compromisos externos). Y qué hacer mientras tanto: registrar y seguir con lo que
   no depende de eso.

   ## 6 · Dónde está todo
   Tabla: necesito saber X → leé Y.

   ## 7 · Cierre de sesión
   Qué se persiste antes de terminar, con el comando exacto.

Cuando termines, devolveme en el chat SOLO:
- La lista de comandos que citaste, con confirmación de que cada uno existe en el manifiesto
- La sección "Qué NO hacer" completa
- La definición de "terminado" que escribiste
```

## Puerta de salida

- [ ] Todo comando citado existe de verdad (verificado contra el manifiesto, no de memoria)
- [ ] `CLAUDE.md` entra en dos pantallas
- [ ] El onboarding enseña a **averiguar** el estado, no lo declara
- [ ] Está escrito explícitamente que los documentos pueden mentir y que la verdad está en el código
- [ ] Están las cuatro reglas de escepticismo
- [ ] Están las reglas de disciplina: cero deuda, fix de raíz, cero parches, TDD estricto RED→GREEN,
      bugs corregidos al encontrarlos, ciclo entero o nada
- [ ] Cada regla dura lleva su por qué, no solo el enunciado
- [ ] "Terminado" está definido y no es "el PR está mergeado"
- [ ] Está la lista de decisiones cerradas que no se re-litigan

## La prueba real

Abrí una sesión limpia, pegá `AGENT-ONBOARDING.md` y no digas nada más.

Si el agente arranca, averigua el estado solo y te propone el siguiente paso correcto: funciona.
Si te pregunta algo que el documento debería responder: al documento le falta esa respuesta.

Esa prueba se corre otra vez cada vez que el proyecto cambia de forma. Es barata y es la única
que mide lo que el documento realmente vale.

## Errores comunes

**Mezclar los dos documentos.** Todo en `CLAUDE.md` significa pagar el protocolo de arranque en
cada sesión aunque no arranques nada. Todo en el onboarding significa que las prohibiciones no
están cargadas cuando importan. Estado en uno, método en el otro.

**El onboarding que declara el estado.** "Estamos en la fase 3, falta el módulo de pagos."
Envejece en días y después miente con total confianza — que es peor que no decir nada, porque
el lector le cree.

**Comandos inventados.** El agente corre `pnpm test:all`, no existe, y ya perdiste la confianza
del lector en todo el resto del documento. Verificá cada comando contra el manifiesto real.
