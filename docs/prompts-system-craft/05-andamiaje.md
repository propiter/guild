# Fase 5 · Andamiaje

## Objetivo

Montar el repositorio, el tooling, el CI y los **guardrails** — de modo que el proyecto arranque
con las puertas de calidad puestas, no agregadas después.

Agregar CI a un proyecto de seis meses significa arreglar doscientos errores de lint el mismo día.
Nadie lo hace: se desactivan las reglas. Por eso el andamiaje va antes que la primera línea de
lógica de negocio.

## Precondiciones

- `STANDARDS.md` completo, **con su anexo de reglas automatizables**
- `docs/STACK.md` con versiones fijadas
- Un repositorio vacío

## EL PROMPT

```
Sos el ingeniero de plataforma. Vas a montar el ANDAMIAJE del proyecto.

LEÉ PRIMERO (obligatorio):
1. STANDARDS.md — completo, con especial atención al Anexo de reglas automatizables.
   Ese anexo es tu lista de trabajo.
2. docs/STACK.md — herramientas y versiones fijadas
3. docs/ARQUITECTURA.md — la estructura de directorios sale de los bounded contexts

PRINCIPIO CENTRAL DE ESTA FASE — no negociable:

    El comando `verify` local debe reproducir EXACTAMENTE lo que corre el CI,
    en el MISMO ORDEN. Y debe existir un guardrail que lo fuerce por código.

Si `verify` y el CI pueden divergir, van a divergir. Y el día que diverjan, alguien va a tener
un verify en verde y main en rojo, y va a perder una hora antes de sospechar de la herramienta.
Esto no se resuelve con disciplina: se resuelve con un script que compara ambos y falla.

REGLAS DE TRABAJO:

1. CADA REGLA DEL ANEXO SE AUTOMATIZA O SE MARCA COMO NO AUTOMATIZABLE, CON MOTIVO. Nada queda
   en el limbo.

2. CUANDO EL LINTER NO PUEDE EXPRESAR UNA REGLA, ESCRIBÍ UNA FITNESS FUNCTION. Un checker que
   analiza el árbol sintáctico y vive bajo los tests, no una regla de linter torcida. Ejemplo
   real: "la capa de dominio no puede importar infraestructura" o "prohibido punto flotante en
   el dominio" — ningún linter estándar lo expresa; un checker de AST de 40 líneas sí, y encima
   falla con un mensaje que explica qué hacer.

3. TODO GUARDRAIL DOCUMENTA EN SU CABECERA EL MODO DE FALLA EXACTO QUE PREVIENE. Y por qué el
   CI normal no lo detecta. Sin eso, el próximo que lo vea molestar lo va a borrar.

4. LOS MENSAJES DE ERROR DICEN QUÉ HACER. "check-x falló" es inútil. "El script verify no
   incluye `pnpm knip`, que sí está en ci.yml paso 12. Agregalo después de `build`" es útil.

5. EL SMOKE TEST ARRANCA EL ARTEFACTO REAL. No el código fuente: la imagen construida, con su
   comando de producción. Y pega contra una ruta que USE las dependencias inyectadas, no solo
   contra /health — una app con la inyección de dependencias rota responde /health perfecto.

6. LOS HOOKS TIENEN DOS VELOCIDADES. pre-commit rápido (formato sobre lo staged + guarda de
   secretos, alrededor de un segundo). pre-push completo (`verify` entero). Un pre-commit lento
   se termina saltando con --no-verify, y ahí perdiste el hook.

ENTREGABLES:

A) Estructura del repositorio, según los bounded contexts de la arquitectura.

B) Configuración del perfil de stack: gestor de paquetes con versión fijada, runtime fijado,
   linter, verificador de tipos, runner de tests, orquestador si es monorepo, y el archivo de
   configuración de cada uno — CON COMENTARIOS que expliquen cada excepción y cada override.

C) El script `verify` que encadena, en orden: guardrails → lint → tipos → tests → build →
   arranque real → auditoría de dependencias.

D) .github/workflows/ci.yml que corre EXACTAMENTE lo mismo, en el mismo orden, más los jobs
   que necesitan servicios (integración con base de datos real, auditoría).

E) Los guardrails de scripts/, empezando por el de paridad verify↔CI. Sin dependencias
   externas. Cada uno con su cabecera explicando el fallo real que previene.

F) Las fitness functions de las reglas del anexo que el linter no puede expresar.

G) Hooks de git: pre-commit rápido, pre-push completo.

H) Dockerfile multi-stage: usuario sin privilegios; healthcheck que apunte a LIVENESS (una
   ruta sin entrada/salida a dependencias externas) y que valide el CONTENIDO de la respuesta,
   no solo que el puerto abra; e instalación del artefacto empaquetado en vez de copiar el
   código fuente — así se comprueba que el empaquetado incluye todo lo que hace falta.

   La distinción liveness/readiness no es cosmética: un healthcheck que falla solo puede
   reiniciar el proceso, y reiniciar no arregla una base de datos caída. Si lo apuntás a una
   ruta que toca dependencias, una caída de la base te reinicia todas las réplicas en cadena.
   Liveness responde "¿el proceso está vivo?"; readiness responde "¿puede atender tráfico?".
   Son preguntas distintas, con consumidores distintos.

I) .github/workflows/build-push.yml: construir sin publicar en los pull requests (guarda
   contra la deriva entre el Dockerfile y el workspace), publicar con etiquetas en la rama
   principal, y smoke test real contra el contenedor.

J) Plantilla de pull request con el Definition of Done de STANDARDS.md.

CRITERIO DE ACEPTACIÓN DE LA FASE:
En un repositorio SIN lógica de negocio, `verify` corre entero y sale en verde. Si no podés
demostrar eso, la fase no está terminada.

Cuando termines, devolveme en el chat SOLO:
- La salida real de `verify` corriendo entero
- La tabla de guardrails: nombre | qué previene | qué rompe si falta
- Qué reglas del anexo NO pudiste automatizar y por qué
```

## Puerta de salida

- [ ] `verify` corre entero y sale verde en un repo sin lógica de negocio
- [ ] Existe el guardrail de paridad `verify` ↔ CI y **falla** si los desincronizás a propósito
- [ ] Cada regla del anexo está automatizada o marcada como no automatizable con motivo
- [ ] Cada guardrail documenta el fallo real que previene
- [ ] El pre-commit tarda alrededor de un segundo
- [ ] El smoke test arranca el artefacto empaquetado, no el código fuente
- [ ] El healthcheck apunta a liveness (sin I/O externa) y valida contenido de respuesta

## La prueba que casi nadie hace

Rompé un guardrail a propósito y comprobá que falla. Un guardrail que nunca falló es exactamente
igual a un guardrail que no existe — y tenés la misma evidencia sobre ambos: ninguna.

Es la misma regla que aplica a los tests, y la razón por la que el ciclo RED→GREEN no es una
formalidad: **un test que nunca estuvo rojo no probó nada.**

## Errores comunes

**El CI que se agrega después.** Doscientos errores de lint el primer día, y la salida fácil es
desactivar reglas. El andamiaje va primero justamente porque en un repo vacío no cuesta nada.

**El `verify` que "se acuerda" de estar sincronizado con el CI.** No se acuerda. Nunca. El CI suma
un paso, `verify` no, y la divergencia se descubre semanas después con main en rojo. Por eso el
primer guardrail que se escribe es el de paridad.

**El healthcheck que solo mira el puerto.** Un proceso arrancado con la inyección de dependencias
rota o sin parámetros cargados responde el puerto perfectamente. El healthcheck tiene que validar
el **contenido** de la respuesta.

**El healthcheck apuntado a readiness.** El error inverso y más caro: la ruta que elegiste consulta
la base de datos. La base tiene un hipo de treinta segundos y el orquestador reinicia todas las
réplicas a la vez — convertiste una degradación en una caída total.

**Guardrails hipotéticos.** Un guardrail nace de un fallo que ya ocurrió y costó tiempo. Los
inventados por si acaso son fricción sin beneficio y erosionan la credibilidad de los que sí
importan.
