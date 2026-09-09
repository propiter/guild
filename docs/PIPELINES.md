# Los pipelines — cómo encajan

El gremio tiene 5 pipelines. Cada uno resuelve un problema distinto, con sus propias fases,
oficios y puertas de salida — eso ya está documentado en cada `SKILL.md` y en
[`docs/OFICIOS.md`](OFICIOS.md). Lo que falta ahí es esto: **cómo se encadenan en un proyecto
real**, cuándo usás cada uno, y en qué orden.

Si sos nuevo en el gremio, este es el documento que te ahorra probar los cinco comandos a
ciegas.

---

## El flujo típico

No los cinco pipelines corren siempre. Pero cuando un proyecto pasa por todos, el orden es
este:

```
                         ┌────────────────────────────┐
                         │          /proyecto           │
                         │   (system-craft)              │
                         │   arquitectura, stack,         │
                         │   modelo de datos, CI,         │
                         │   guardrails, backend           │
                         └──────────────┬─────────────────┘
                                        │  deja un contrato tipado
                                        │  (o un backend que ya corre)
                        ┌──────────────┴───────────────┐
                        ▼                                ▼
            ┌────────────────────┐            ┌────────────────────┐
            │        /app          │            │      /landing        │
            │   (app-craft)         │            │   (landing-craft)     │
            │   la interfaz de la    │            │   el sitio de          │
            │   aplicación, contra    │            │   marketing,            │
            │   el contrato            │            │   investigado y          │
            │   que dejó el sistema     │            │   desplegado              │
            └──────────────┬─────────┘            └────────┬─────────────────┘
                           └─────────────────┬──────────────┘
                                             ▼
                                 ┌─────────────────────┐
                                 │      /seguridad        │
                                 │   (security-craft)      │
                                 │   ataca lo YA construido,│
                                 │   lo endurece, deja        │
                                 │   candados permanentes      │
                                 └───────────┬─────────────────┘
                                             ▼
                                 ┌─────────────────────┐
                                 │       /entrega          │
                                 │   (delivery-craft)        │
                                 │   limpia rastros de IA,     │
                                 │   prueba el sistema real,     │
                                 │   firma (o rechaza) la entrega │
                                 └─────────────────────────────────┘
```

**Lectura del diagrama:** `system-craft` arranca el proyecto y deja el contrato que consume la
interfaz. `app-craft` y `landing-craft` son alternativas, no un paso obligado uno después del
otro — un proyecto usa uno, el otro, o ninguno (un backend sin UI también es un producto
válido). `security-craft` y `delivery-craft` corren **sobre lo que ya está construido**, al
final, en ese orden: primero se endurece, después se limpia y se firma. `delivery-craft` es
siempre el último paso.

---

## Tabla de referencia

| Pipeline | Comando insignia | Cuándo lo usás | Qué produce | Con qué se encadena |
|---|---|---|---|---|
| **system-craft** | `/proyecto` | Arrancás un proyecto de software desde cero, o un proyecto existente no tiene arquitectura, stack justificado, CI ni guardrails | Backend + arquitectura documentada + stack con alternativas descartadas + modelo de datos + estándares + CI verde + onboarding + roadmap | Deja el contrato tipado que `app-craft` consume (o negocia). Después de construir, sigue `/seguridad` y `/entrega`. |
| **app-craft** | `/app` | Necesitás la interfaz de una aplicación — dashboard, panel admin, pantallas de un SaaS — contra un backend propio o de terceros | Pantallas + sistema de diseño + todos los estados (carga/vacío/error/permiso) + el contrato consumido y verificado | Se enchufa al backend que dejó `/proyecto` o a uno que ya existía (modo Adopt). Sigue `/seguridad` y `/entrega`. |
| **landing-craft** | `/landing` | Necesitás un sitio de marketing que venda — landing, sales page, sitio de producto | Sitio multi-página investigado (estudio de mercado real), copy, diseño, motion, SEO/GEO, desplegado con URL viva | No depende de `/proyecto` — un sitio de marketing no necesita un backend propio. Sigue `/seguridad` (si tiene formularios/backend propio) y `/entrega`. |
| **security-craft** | `/seguridad` | Ya construiste algo (con el gremio o no) y querés saber si resiste un ataque real, no una checklist | Hallazgos con prueba de concepto explotada de verdad, remediados de raíz, con candado permanente (test de regresión + guardrail de CI) por cada uno | Corre **sobre** lo que `/proyecto`, `/app` o `/landing` (o cualquier otro proceso) ya construyeron. Antes de `/entrega`. |
| **delivery-craft** | `/entrega` | Vas a entregarle el producto a un cliente — típicamente después de que una IA ayudó a construirlo | Diagnóstico de rastros de IA y huecos de entrega + limpieza en olas verificadas + prueba del sistema real + firma o rechazo | **Siempre el último paso**, agnóstico del lenguaje (TS, Python, Go, lo que sea). No depende de qué construiste antes. |

---

## Relaciones que ya están decididas

Estas no son sugerencias — son la forma en que los pipelines fueron diseñados para encajar.

**`app-craft`/`landing-craft` se enchufan a un backend, no lo reemplazan.**
`app-craft` es la mitad frontend de un esfuerzo full-stack: casi nunca construye en el vacío.
El mecanismo que hace encajar las dos mitades es un **contrato tipado** — la interfaz declara
qué necesita, el backend lo implementa, ninguno rompe al otro cuando cambia por dentro. Si el
schema ya existe (Drizzle/Prisma/tRPC/OpenAPI/GraphQL/Supabase/server actions), `app-craft`
**deriva** el contrato de ahí — nunca inventa nombres de campo. Si el backend no existe todavía,
**especifica** el contrato que necesita y lo deja escrito para quien construya el backend.
`landing-craft` es más independiente: un sitio de marketing puede no necesitar backend propio
más allá de un formulario de contacto.

**`security-craft` y `delivery-craft` corren SOBRE lo ya construido, al final.**
Ninguno de los dos diseña ni decide arquitectura. `security-craft` ataca de verdad — con prueba
de concepto explotada, no una checklist — lo que `system-craft`/`app-craft`/`landing-craft` (o
cualquier otro proceso) ya construyeron. `delivery-craft` audita y limpia el resultado final. El
orden entre ellos importa: primero se endurece la seguridad, después se limpia y se firma la
entrega — no tiene sentido firmar una entrega que todavía tiene un IDOR sin cerrar.

**`delivery-craft` es el paso final SIEMPRE, agnóstico del lenguaje.**
No juzga si la arquitectura es correcta ni si la interfaz es linda — eso ya lo decidieron, o lo
van a decidir, los otros pipelines. Juzga una sola cosa, con evidencia: ¿un desarrollador senior
ajeno al proyecto lo recibe y **no** nota que hubo una IA escribiendo sin supervisión? Corre
sobre cualquier producto tenga o no interfaz — una API, un CLI, un script de datos.

**El rescate de UI (`app-rescue`/`landing-rescue`) NO es lo mismo que `delivery-craft`.**
`app-craft` en modo Rescue (oficios `examiner`/`renovator`) y `landing-craft` en modo Rescue
(oficios `assessor`/`restorer`) reparan la **interfaz** de un producto mal construido: sistema
de diseño, arquitectura de componentes, estados faltantes, accesibilidad, motion, conversión.
Necesitan Playwright, necesitan renderizar la pantalla, necesitan juzgar si el producto **se ve
y se usa** bien. `delivery-craft` no opina de eso — es la higiene y la prueba final que corre
DESPUÉS, sobre cualquier producto tenga o no frontend: logs de debug en el backend, dependencias
sin usar en todo el repo, el README, el `.env.example`, arrancar desde un clone limpio. Si la
interfaz está mal construida, corré primero el rescate de UI que corresponda — `delivery-craft`
corre igual al final, haya habido rescate o no.

---

## Casos de uso concretos

### "Quiero un SaaS de cero"

```
/proyecto   → arquitectura + stack + modelo de datos + CI + backend
/app        → la interfaz, contra el contrato que dejó /proyecto
/seguridad  → ataca tu propio entorno de dev/staging, remedia, pone candados
/entrega    → limpia rastros de IA, prueba el sistema real, firma
```

### "Ya tengo backend, quiero la UI"

```
/app        → prospector detecta el modo Adopt, deriva el contrato del schema real
/seguridad  → (opcional pero recomendado antes de producción)
/entrega    → limpia y firma
```

No hace falta `/proyecto`: si el backend ya existe, `app-craft` lee su schema real en vez de
inventar uno.

### "Tengo algo hecho con IA de una sola pasada y quiero entregarlo pro"

```
# Si la interfaz está mal construida (duplicación, sin estados, `any` por todos lados):
/app-rescue      → (o /landing-rescue) audita y remedia la UI en olas verificadas

# Siempre, haya habido rescate de UI o no:
/entrega         → diagnostica rastros de IA en TODO el repo, limpia, prueba, firma

# Si solo querés el diagnóstico sin tocar nada:
/entrega-diagnostico
```

### "Quiero endurecer la seguridad"

```
/seguridad         → modela amenazas, explota de verdad tu propio entorno, remedia, pone candados
# o, si solo querés el mapa sin atacar:
/security-audit
```

`security-craft` se detiene en la fase 1 si no puede confirmar que el objetivo es tuyo — nunca
opera contra terceros ni contra producción con datos reales.

---

## Los límites — lo que el gremio no decide por vos

El gremio investiga y decide técnicamente en vez de interrogar — esa es la filosofía de las 9
fases de `system-craft` y se repite en los otros cuatro pipelines. Pero hay una línea que no
cruza:

- **No reemplaza el criterio del dueño del proyecto.** El test que usa `system-craft` para saber
  cuándo preguntar en vez de decidir: *¿la respuesta cambia según quién sea el dueño del
  proyecto?* Presupuesto, plazos, apetito de riesgo, compromisos comerciales con terceros,
  restricciones legales que solo el dueño conoce — eso se pregunta, siempre. Lo demás, el gremio
  lo decide y lo justifica.
- **`security-craft` solo opera contra el entorno propio del usuario** — local, de desarrollo o
  de staging, nunca contra terceros ni contra producción con datos reales de usuarios. Si
  `sentinel` no puede confirmarlo, el pipeline no avanza — no hay excepción ni "probemos igual
  con cuidado".
- **Ningún pipeline certifica cumplimiento regulatorio** (SOC2, PCI-DSS, ISO 27001 y similares).
  `security-craft` endurece el sistema contra ataques reales; no sustituye el proceso y la
  evidencia que exige una auditoría de cumplimiento formal.
- **Verde no significa correcto**, en ninguno de los 5 pipelines. Un gate en verde prueba que no
  rompiste lo que ya estaba probado — no prueba que lo nuevo esté bien. Es permiso para revisar,
  no un certificado.

---

## Ver también

- [`docs/OFICIOS.md`](OFICIOS.md) — los 46 oficios, uno por uno, con su pipeline y su función.
- [`skills/craft-core/references/leyes-del-gremio.md`](../skills/craft-core/references/leyes-del-gremio.md) — las 10 leyes que todo oficio respeta, sin excepción.
- Cada `skills/<pipeline>/SKILL.md` — el detalle completo de fases, oficios y comandos de ese pipeline.
