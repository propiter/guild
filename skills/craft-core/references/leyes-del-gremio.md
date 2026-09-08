# Las leyes del gremio

Innegociables. Valen para **todo** oficio del gremio —landing, app, system, security— sin excepción.
Un agente que las rompe no entregó su trabajo, aunque el resultado "funcione".

---

## 1 · Cero gaps

Nada queda a medias sin registrar. Si detectás un faltante que no vas a cerrar en este paso, va al
lugar de deuda del proyecto con su motivo y su ventana — y lo decís en tu informe. **Un hueco
callado es peor que un hueco visible:** consume la oportunidad de que otro lo encuentre.

## 2 · Cero bugs

Los defectos se corrigen al encontrarlos, no se anotan para después. Y se corrigen con datos
verificados contra la fuente real —el código, el esquema, la respuesta del sistema corriendo—,
nunca con una hipótesis de qué los causa.

## 3 · Cero parches — todo de raíz

Un parche que tapa el síntoma es deuda que además esconde dónde está el problema. Si una decisión
anterior resultó equivocada, se corrige la decisión —el código *y* la documentación que la
sostiene— para que queden consistentes. Nada de `TODO`/`FIXME` huérfanos, nada de `catch` vacío,
nada de silenciar un tipo o un error "para que compile". **Arreglar una instancia no es arreglar la
clase:** un `if` puesto donde apareció el bug cierra el caso, no la causa.

## 4 · Limpio, escalable, ordenado

- **Limpio:** se lee como lo escribió una sola persona con criterio. Nombres que dicen qué hacen,
  sin código muerto, sin duplicación — una sola fuente de verdad por cosa.
- **Escalable:** la pieza número cuarenta se construye igual que la primera. Si dos piezas
  equivalentes se ven distintas sin una razón documentada, una está mal.
- **Ordenado:** cada cosa en su capa. El dominio no sabe de infraestructura; la infraestructura no
  decide reglas de negocio. Las fronteras son explícitas.

## 5 · Fácil de depurar y corregir

Se escribe pensando en quien va a arreglar el próximo error a las 3 de la mañana, sin contexto y sin
poder preguntar. Errores que dicen **qué hacer**, no solo qué falló. Estado observable. Fallos
ruidosos y tempranos, nunca silenciosos y tardíos.

## 6 · Seguro por defecto

La seguridad no es una fase al final, es una propiedad de cada línea. Toda entrada se valida en la
frontera. Menor privilegio siempre: nada corre con más permiso del que necesita. Ningún secreto en
el código, en los logs, ni en la imagen — nunca en claro. **Fallá cerrado:** cuando falta una
señal —una variable, un permiso, un token—, el sistema niega, no asume; un default que aparece por
ausencia es una trampa que solo se dispara en producción.

## 7 · Probado, no prometido

Lo testeable va con test, y el test se ve fallar antes de verlo pasar (RED→GREEN) — un test que
nunca estuvo en rojo no probó nada. La lógica crítica —dinero, permisos, aislamiento— se prueba
contra infraestructura real, no contra simulacros. Y **"terminado" significa verificado contra su
contrato**, no "el build pasa".

## 8 · Verde no es correcto

Los gates prueban que no rompiste lo que ya estaba probado. No prueban que lo nuevo esté bien, ni
que lo que no tocaste sea seguro. El verde es permiso para revisar, no certificado de que esté bien.

---

**La prueba de todas juntas:** si tuvieras que entregarle esto a alguien que te odia y busca el
error —un bug, un hueco, una vulnerabilidad—, ¿lo encontraría rápido, o le dejaste trampas? El
gremio entrega la primera.
