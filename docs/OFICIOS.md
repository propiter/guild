# Los oficios del gremio

Cada agente es un oficio con un nombre propio, no un prefijo. Esta tabla es el mapa: si ves
`choreographer` en un log y no sabés qué hace, empezá acá.

Todos los oficios, sin excepción, están sujetos a [las leyes del gremio](../skills/craft-core/references/leyes-del-gremio.md):
cero gaps, cero bugs, cero parches, todo de raíz.

---

## 🏛️ landing — el sitio de marketing

| Oficio | Fase | Qué hace |
|---|---|---|
| `surveyor` | init | Reconoce el terreno: framework, tooling, assets, estado del repo |
| `cartographer` | research | Mapea el mercado, la competencia y la intención de búsqueda |
| `strategist` | strategy | Fija posicionamiento, audiencia y promesa antes de una línea de copy |
| `draughtsman` | architecture | Traza el plano del sitio: qué páginas y qué secciones |
| `wordsmith` | copy | Escribe el mensaje y el copy de conversión, en la voz del comprador |
| `stylist` | design | Define la dirección visual: tipografía, color, ritmo |
| `wright` | build | Construye el sitio en código |
| `choreographer` | motion | Coreografía el movimiento — reveals, micro-interacciones |
| `burnisher` | polish | El pase de pulido: tipografía, alineación, contraste |
| `crier` | seo | Hace el sitio encontrable y citable por buscadores y motores de IA |
| `arbiter` | review | La puerta: renderiza, puntúa contra las barras, aprueba o rechaza |
| `courier` | deploy | Publica: GitHub + Vercel, entrega la URL viva |
| `assessor` | audit | Diagnostica un sitio existente, sin cambiar nada |
| `restorer` | remediate | Repara un sitio mal construido, en olas verificadas |

## 🖥️ app — la interfaz de aplicación

| Oficio | Fase | Qué hace |
|---|---|---|
| `prospector` | init | Detecta el modo (adoptar/nuevo), el stack y el modelo de auth |
| `ethnographer` | product | Estudia a los usuarios: roles, trabajos por hacer, frecuencia |
| `wayfinder` | ia | Elige el modelo de navegación y traza los flujos |
| `artificer` | system | Forja el sistema de diseño: tokens, primitivas, la firma |
| `framer` | screens | Especifica el layout de cada pantalla y su matriz de estados |
| `envoy` | contract | Negocia el contrato tipado con el backend |
| `joiner` | build | Ensambla la app: shell, primitivas, cada pantalla |
| `steward` | states | Implementa cada estado: carga, vacío, error, sin permiso, overflow |
| `conductor` | motion | Dirige el movimiento como feedback y continuidad, nunca espectáculo |
| `lapidary` | polish | Pule densidad, alineación, teclado, accesibilidad al detalle |
| `magistrate` | review | La puerta: renderiza cada pantalla y estado, puntúa, aprueba |
| `examiner` | audit | Diagnostica una app existente, módulo por módulo |
| `renovator` | remediate | Rescata una app mal construida, en olas verificadas |

## 🏗️ system — el sistema completo y su disciplina

| Oficio | Fase | Qué hace |
|---|---|---|
| `scout` | descubrimiento | Investiga qué se construye y para quién; escribe el PRD |
| `architect` | arquitectura | Diseña cómo fluye el sistema, sin nombrar tecnología |
| `quartermaster` | stack | Elige las tecnologías con alternativas descartadas |
| `archivist` | datos | Custodia el modelo de datos y sus convenciones |
| `codifier` | estándares | Escribe el molde: cómo se construye cada pieza |
| `foreman` | andamiaje | Levanta repo, tooling, CI, guardrails y contenedores |
| `herald` | onboarding | Escribe los documentos para arrancar sin contexto |
| `navigator` | roadmap | Ordena el trabajo por dependencias; registra la deuda |
| `mason` | ciclo | Construye cada cambio pieza a pieza, con TDD y verificación |
| `inspector` | auditoría | Diagnostica un proyecto contra el método, sin cambiar nada |
| `smith` | guardrail | Convierte un fallo en un candado automatizado que rompe el build |

## 🔒 security — el gremio ataca su propia obra

| Oficio | Fase | Qué hace |
|---|---|---|
| `sentinel` | modelado | Modela amenazas y confirma que el objetivo es propio, o se detiene |
| `breaker` | explotación | Prueba de concepto real; demuestra el acceso sin exfiltrar datos |
| `warden` | remediación | Corrige de raíz cada hallazgo confirmado, con evidencia |
| `locksmith` | candado | Convierte cada vulnerabilidad en test de regresión + guardrail permanente |

---

**42 oficios.** Nombres únicos en todo el gremio — dos oficios nunca comparten nombre, porque los
agentes viven en un solo espacio (`~/.claude/agents/`).
