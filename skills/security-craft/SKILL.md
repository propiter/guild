---
name: security-craft
description: "Trigger: atacar la propia obra del gremio para endurecerla — 'auditá la seguridad', 'intentá hackear esto', 'buscá vulnerabilidades', 'es esto a prueba de hacks', 'endurecé el sistema', 'pentesting de mi app', 'modelá las amenazas', 'probá si se puede explotar esto', 'hacé un red team de mi proyecto', 'revisá los secretos expuestos' — contra el ENTORNO PROPIO del usuario: local, de desarrollo o de staging, nunca contra terceros ni contra producción con datos reales. Cuatro fases, cada una delegada a su oficio: sentinel modela amenazas e inventaria la superficie de ataque confirmando primero que el objetivo es propio; breaker prueba de concepto de explotación real (bypass de autorización, IDOR, inyección, fuga entre inquilinos, secretos expuestos, SSRF, deserialización, path traversal, dependencias con CVE) demostrando acceso sin exfiltrar datos; warden remedia de raíz cada hallazgo confirmado, en rama, con evidencia antes/después; locksmith convierte cada vulnerabilidad en un candado permanente — test de regresión más guardrail de CI — apoyado en el oficio `smith` (guardrails de system-craft). Si Sentinel no puede confirmar la propiedad del objetivo, el pipeline se detiene ahí. Verde no es seguro: un exploit que nunca funcionó no prueba protección, prueba que no se probó lo suficiente."
license: Apache-2.0
metadata:
  author: propiter
  version: "1.0.0"
---

# Security Craft

Un sistema que nunca lo atacaron de verdad no sabe si es seguro — sabe que nadie lo intentó
todavía. Este pipeline ataca la propia obra del gremio para endurecerla: modela amenazas de
verdad, explota de verdad contra un entorno propio, remedia la causa y convierte cada hallazgo en
un candado que hace imposible que el mismo fallo vuelva a entrar sin que algo se ponga rojo.

No es una auditoría de checklist. Una checklist dice qué deberías tener; este pipeline COMPRUEBA,
con una prueba de concepto real, si lo que tenés de verdad te protege.

---

## El límite ético — no se negocia

> Esto SOLO opera contra sistemas del propio usuario: su entorno local, de desarrollo o de
> staging, sin datos reales de terceros. Sentinel confirma la propiedad del objetivo antes de que
> Breaker toque nada; si no puede confirmarla, el pipeline se detiene. Nunca contra sistemas de
> terceros, nunca contra producción con datos de usuarios reales, nunca exfiltración de datos.
> Breaker demuestra el acceso y documenta la clase de dato alcanzable — no lo extrae.

Este límite está duplicado a propósito: vive en este documento y en cada uno de los cuatro
oficios, porque un pipeline de explotación real no puede depender de que el orquestador se lo haya
transmitido bien. Cada agente lo verifica por sí mismo, incluso el que ya lo verificó antes que él.

---

## Los cuatro oficios

| # | Fase | Oficio | Qué hace | Produce | Puerta de salida |
|---|------|--------|----------|---------|------------------|
| 1 | Reconocimiento | `sentinel` | Modela amenazas, inventaria la superficie de ataque, **confirma la propiedad del objetivo**. Solo lectura, cero explotación. | `docs/security/objetivo.md` | La confirmación tiene evidencia concreta, o el rechazo está explícito en la primera línea |
| 2 | Explotación | `breaker` | Prueba de concepto real contra los objetivos que Sentinel confirmó y priorizó. Documenta la clase de dato alcanzable, nunca el dato. Revierte lo que toca. | `docs/security/hallazgos.md` | Cada hallazgo confirmado tiene PoC reproducible; cero datos reales; todo cambio de estado revertido |
| 3 | Remediación | `warden` | Corrige de raíz cada hallazgo confirmado, en rama, con evidencia antes(rojo)/después(verde) contra la misma PoC. | rama con el fix + `docs/SEGURIDAD.md` actualizado | Causa raíz documentada, no síntoma; la suite de tests sigue en verde |
| 4 | Candado | `locksmith` | Convierte cada remediación en test de regresión + guardrail de CI cuando corresponde, apoyado en el oficio `smith`. | tests + guardrails enchufados a verify/CI | Cada candado se rompió a propósito y falló |

## Cómo se ejecuta

**1 · Delegá cada fase a su oficio, en orden estricto.** El orden no es una sugerencia: Breaker no
corre sin la confirmación de Sentinel, Warden no remedia un hallazgo que Breaker no confirmó,
Locksmith no instala un candado sobre algo que Warden no cerró.

**2 · Si Sentinel no confirma, el pipeline termina en la fase 1.** No hay "segunda opinión" ni
"probemos igual con cuidado" — la confirmación es binaria.

**3 · Pasá los artefactos por disco.** `docs/security/objetivo.md` → `docs/security/hallazgos.md`
→ rama + `docs/SEGURIDAD.md` → tests/guardrails enchufados. Cada oficio lee lo que el anterior
escribió, nunca un resumen de memoria.

**4 · Verificá la puerta de salida de cada fase antes de avanzar.** Un "listo" sin evidencia
pegada no cuenta en ninguna de las cuatro fases.

**5 · Para solo diagnóstico, sin ataque**, corré únicamente Sentinel — es lo que hace
`/security-audit`: el mapa sin el arma.

## Reglas duras

**Cada hallazgo lleva severidad CVSS-ish + prueba de concepto + remediación de raíz + candado.**
Un hallazgo sin las cuatro cosas está a medio hacer — no es un hallazgo, es una sospecha con
nombre.

**Verde no es seguro.** Un `verify` en verde después de Warden prueba que no rompiste lo que ya
estaba probado. No prueba que el resto del sistema esté protegido contra la misma clase de ataque
en otro punto.

**Un exploit que nunca funcionó no prueba que estés protegido.** Prueba que ESE vector, con ESE
payload, en ESE momento, no funcionó. Documentalo igual — es la diferencia entre "no lo probamos"
y "lo probamos y resistió", y solo la segunda frase vale algo en una auditoría real.

**La remediación cosmética no cierra un hallazgo.** Un `if` puesto exactamente donde Breaker probó
cierra la instancia, no la clase. Warden no declara cerrado nada que no pueda explicar por qué
cierra la clase completa del fallo.

**Un guardrail nace de un fallo real.** Locksmith no instala candados hipotéticos — cada uno nace
de un hallazgo que Breaker demostró y Warden remedió. el oficio `smith` ya define esta anatomía;
Locksmith la aplica, no la reinventa.

**Nada en silencio.** Un hallazgo que no se pudo remediar en esta pasada se registra como deuda de
seguridad explícita en `docs/SEGURIDAD.md` — nunca desaparece del documento porque "ya se sabe".

---

## Qué NO hace este skill

**No opera contra nada que no sea del usuario.** Ver el límite ético arriba — es la primera
restricción del pipeline, antes que cualquier otra.

**No reemplaza una auditoría de cumplimiento formal** (SOC2, PCI-DSS, ISO 27001 y similares) —
esos marcos tienen su propio proceso y evidencia exigida. Este pipeline endurece el sistema; no
certifica cumplimiento regulatorio.

**No es un scanner automatizado de CVEs corriendo en bucle.** Esa capa continua vive en el
andamiaje del proyecto (auditoría de dependencias en `verify`/CI). Este pipeline aporta lo que un
scanner no puede: intención de atacante real, contra la lógica de negocio específica del sistema.

**No sustituye a `smith`.** Locksmith se apoya en él para la anatomía de cada candado —
no reimplementa esa disciplina.

---

## Recursos

| Ruta | Qué contiene |
|---|---|
| `agents/sentinel.md` | Reconocimiento y confirmación de propiedad |
| `agents/breaker.md` | Explotación real, sin exfiltración |
| `agents/warden.md` | Remediación de raíz, en rama, con evidencia antes/después |
| `agents/locksmith.md` | Test de regresión + guardrail, apoyado en el oficio `smith` |
| `agents/smith.md` | La anatomía de candado que Locksmith aplica (definida por smith) |
| `templates/docs/SEGURIDAD.md.template` | Dónde deja rastro cada remediación |
