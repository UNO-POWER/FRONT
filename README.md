# Front

> Cliente web de **UNO Power-Ups Arena**: React 18 + TypeScript + Tailwind, con conexión
> REST al API Gateway y WebSocket directo al Game Service.

[![React](https://img.shields.io/badge/React-18.3-61dafb)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)]()
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## Tabla de contenidos

1. [Descripción](#1-descripción)
2. [Arquitectura](#2-arquitectura)
3. [Tecnologías](#3-tecnologías)
4. [Requisitos](#4-requisitos)
5. [Instalación](#5-instalación)
6. [Configuración](#6-configuración)
7. [Ejecución](#7-ejecución)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Flujo interno](#9-flujo-interno)
10. [Rutas / pantallas](#10-rutas--pantallas)
11. [Consumo de API REST](#11-consumo-de-api-rest)
12. [Consumo de WebSocket](#12-consumo-de-websocket)
13. [Animación de robo de cartas](#13-animación-de-robo-de-cartas)
14. [Seguridad](#14-seguridad)
15. [Testing y verificación manual](#15-testing-y-verificación-manual)
16. [Despliegue](#16-despliegue)
17. [Solución de problemas](#17-solución-de-problemas)
18. [Roadmap](#18-roadmap)
19. [Contribución](#19-contribución)
20. [Licencia](#20-licencia)
21. [Autor](#21-autor)

---

## 1. Descripción

**Front** es la única interfaz de usuario del sistema: landing, autenticación (registro/login/
invitado), matchmaking público, lobby de espera, la partida en sí (tablero, mano, power-ups, chat)
y estadísticas personales. No contiene lógica de negocio propia — toda regla de juego, validación
y autorización vive en el backend; el frontend solo la refleja.

### Historias de usuario cubiertas por pantalla

| Pantalla | HU |
|---|---|
| `Landing` | HU-01 (crear sala), HU-02 (unirse por código), entrada como invitado (EC-07) |
| `Auth` | HU-06 (registro/login con cuenta) |
| `SalasPublicas` | HU-09 (matchmaking público) |
| `Lobby` | Roster en tiempo real mientras se espera a iniciar |
| `Partida` | HU-03 (jugar), HU-04 (power-ups), HU-05 (chat), HU-08 (reconexión, banner visual) |
| `Stats` | HU-07 (estadísticas personales) |

---

## 2. Arquitectura

```
                    REST (JWT en Authorization: Bearer)
   Navegador ─────────────────────────────────────────▶ API Gateway :8080 ──▶ User/Lobby Service

                    WebSocket directo (JWT en el CONNECT STOMP)
   Navegador ─────────────────────────────────────────▶ Game Service :8083 (/ws-game)
```

El frontend habla con **dos** destinos de red distintos, deliberadamente:

- Todo lo que es CRUD (auth, salas) va por REST al **API Gateway** — `src/services/api.ts`.
- Todo lo que es tiempo real dentro de una partida (jugadas, robos, power-ups, chat) va por
  **WebSocket directo al Game Service** — `src/services/socket.ts` — sin pasar por el Gateway,
  para minimizar la latencia percibida en cada acción (ver
  [`GameService/README.md`](../GameService/README.md#1-descripción)).

### Capas de la aplicación

```
pages/       → una pantalla por ruta, orquesta hooks + servicios + features
features/    → bloques de UI con lógica propia reutilizados por una pantalla (game/, chat/)
components/  → UI genérica sin conocimiento de negocio (Button, Card, Modal, ...)
contexts/    → estado global mínimo (sesión de auth, toasts)
services/    → única capa que conoce las URLs y protocolos del backend (api.ts, socket.ts, token.ts)
types/       → contratos TypeScript espejo de los DTOs del backend
```

---

## 3. Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | UI |
| TypeScript | 5.5.4 | Tipado estático |
| Vite | 5.4.2 | Build/dev server |
| React Router | 6.26.1 | Enrutamiento SPA, con *code splitting* por pantalla (`lazy`) |
| Tailwind CSS | 3.4.10 | Estilos utilitarios |
| Framer Motion | 11.3.30 | Animaciones (turnos, robo de cartas, modales, resultado) |
| @stomp/stompjs | 7.0.0 | Cliente STOMP sobre el WebSocket |
| sockjs-client | 1.6.1 | Transporte con *fallback* si el navegador/proxy bloquea WS nativo |
| clsx + tailwind-merge | 2.x | Composición de clases condicionales sin colisiones |
| @fontsource-variable | 5.0.20 | Tipografías auto-hospedadas (Inter, Space Grotesk) |

---

## 4. Requisitos

- **Node.js 20+** y **npm**.
- **API Gateway** corriendo y alcanzable (`VITE_API_URL`).
- **Game Service** corriendo y alcanzable para el WebSocket (`VITE_GAME_SERVICE_WS_URL`).

---

## 5. Instalación

```bash
git clone https://github.com/UNO-POWER/FRONT.git
cd FRONT
cp .env.example .env
npm install
```

---

## 6. Configuración

Variables de entorno (prefijo `VITE_`, leídas por Vite en build-time — un cambio requiere
reiniciar `npm run dev` o rehacer el build):

| Variable | Obligatoria | Valor por defecto (`.env.example`) | Descripción |
|---|---|---|---|
| `VITE_API_URL` | ✅ | `http://localhost:8080` | Base URL del API Gateway |
| `VITE_GAME_SERVICE_WS_URL` | ✅ | `http://localhost:8083/ws-game` | Endpoint del WebSocket (SockJS), directo al Game Service |

En producción (AWS), estas dos variables apuntan al mismo dominio HTTPS (vía el proxy `nginx` de
borde) en vez de a hosts/puertos separados — ver
[`deploy/README.md`](../deploy/README.md).

---

## 7. Ejecución

### Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`. Hot Module Reload activo.

### Build de producción

```bash
npm run build      # tsc --noEmit && vite build → genera dist/
npm run preview    # sirve dist/ localmente para verificar el build
```

### Docker / Docker Compose

```bash
docker build -t uno-front .
docker compose up -d --build front
```

El `Dockerfile` es multi-stage: build de Node genera `dist/`, una imagen `nginx` final solo sirve
los estáticos.

### AWS (S3 + CloudFront)

El build (`dist/`) se publica a un bucket S3 privado servido detrás de CloudFront — ver el
runbook completo en [`deploy/DEPLOY.md`](../deploy/DEPLOY.md).

---

## 8. Estructura del proyecto

```
FRONT/
├── src/
│   ├── app/
│   │   ├── App.tsx          # rutas (lazy) + ErrorBoundary + Suspense
│   │   ├── ErrorBoundary.tsx
│   │   └── PageLoader.tsx
│   ├── components/
│   │   ├── layout/PageShell.tsx      # contenedor base de cada pantalla
│   │   └── ui/                       # Badge, Button, Card, EmptyState, Input, Logo, Modal, Skeleton, Spinner
│   ├── contexts/
│   │   ├── AuthContext.tsx           # sesion (token/userId/username/esInvitado) en localStorage
│   │   └── ToastContext.tsx          # notificaciones globales
│   ├── features/
│   │   ├── chat/ChatPanel.tsx        # HU-05
│   │   └── game/
│   │       ├── CartaView.tsx
│   │       ├── GameModals.tsx        # selector de color, objetivo de power-up, resultado espia
│   │       ├── GameTable.tsx         # carta superior, mazo, power-up visible
│   │       ├── OpponentBar.tsx       # rivales + turno activo + animacion de robo
│   │       ├── PlayerHand.tsx
│   │       ├── PowerUpInventory.tsx
│   │       ├── powerups.ts           # metadata de los 5 power-ups (icono, texto, REQUIERE_OBJETIVO)
│   │       └── ResultOverlay.tsx     # pantalla de victoria/derrota
│   ├── hooks/
│   │   ├── useCopyToClipboard.ts
│   │   └── useCountUp.ts
│   ├── pages/         # Landing, Auth, SalasPublicas, Lobby, Partida, Stats, NotFound
│   ├── services/
│   │   ├── api.ts     # cliente REST hacia el API Gateway
│   │   ├── socket.ts  # cliente STOMP directo al Game Service
│   │   └── token.ts   # persistencia de sesion en localStorage
│   ├── types/
│   │   ├── api.ts     # espejo de los DTOs REST (Usuario, Sala, Estadisticas)
│   │   └── game.ts     # espejo de los DTOs de partida (Carta, EstadoPartida, Mano, PowerUp, ...)
│   └── utils/cn.ts    # helper clsx + tailwind-merge
├── .env.example
├── Dockerfile
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 9. Flujo interno

### Autenticación

1. `AuthContext` guarda la sesión (`token`, `userId`, `username`, `esInvitado`) en memoria +
   `localStorage` (`services/token.ts`), y la restaura al recargar la página.
2. Las 3 vías de entrada (invitado, login, registro) llaman a `services/api.ts`, reciben un
   `AuthResponse { id, username, token }` y lo adoptan como sesión activa.
3. `services/api.ts` agrega automáticamente `Authorization: Bearer <token>` a toda request que no
   esté marcada como `auth: false` (las 3 rutas de auth mismas son públicas).

### Ciclo de vida de una partida

1. `Lobby.tsx` conecta al WebSocket, se suscribe a `/topic/sala/{codigo}/lobby` y muestra el
   roster en tiempo real mientras se espera a que el anfitrión inicie.
2. Al iniciar, el mismo canal WebSocket empieza a recibir eventos de `/topic/sala/{codigo}/juego` —
   `Partida.tsx` toma el control.
3. `Partida.tsx` mantiene el estado público de la partida (`EstadoPartida`) y la mano privada
   (`Mano`) en `useState`, actualizados por las callbacks de `conectarSala`.
4. Cada acción del jugador (jugar, robar, decir uno, capturar/usar power-up) se traduce en un
   `publish` STOMP — el frontend **no valida** la jugada, solo la propone; si el backend la
   rechaza, llega un error por `/user/queue/errores` y se muestra como toast.

---

## 10. Rutas / pantallas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Landing` | Entrar como invitado, crear sala privada, unirse con código |
| `/auth` | `Auth` | Formulario de registro / login |
| `/salas` | `SalasPublicas` | Listado paginado de salas públicas con cupo (HU-09) |
| `/sala/:codigo` | `Lobby` | Sala de espera, roster en tiempo real |
| `/partida/:codigo` | `Partida` | Tablero de juego completo |
| `/stats` | `Stats` | Estadísticas personales (requiere cuenta, no disponible para invitados) |
| `*` | `NotFound` | 404 |

Todas las pantallas se cargan con `React.lazy` + `Suspense` (`PageLoader` como *fallback*) para
mantener el bundle inicial pequeño.

---

## 11. Consumo de API REST

`src/services/api.ts` centraliza **toda** la comunicación REST — ningún componente hace `fetch`
directo. Funciones expuestas:

| Función | Endpoint | Requiere auth |
|---|---|---|
| `entrarComoInvitado(nombre)` | `POST /api/usuarios/guest` | ❌ |
| `registrarUsuario(username, password)` | `POST /api/usuarios/registro` | ❌ |
| `iniciarSesion(username, password)` | `POST /api/usuarios/login` | ❌ |
| `crearSala(publica)` | `POST /api/salas` | ✅ |
| `unirseASala(codigo)` | `POST /api/salas/{codigo}/unirse` | ✅ |
| `obtenerSala(codigo)` | `GET /api/salas/{codigo}` | ✅ |
| `iniciarPartida(codigo)` | `POST /api/salas/{codigo}/iniciar` | ✅ |
| `listarSalasPublicas(pagina, tamano)` | `GET /api/salas/publicas` | ✅ |
| `obtenerEstadisticas()` | `GET /api/usuarios/me/stats` | ✅ |

Los errores HTTP no-2xx se convierten en `ApiError { message, status }`, propagando **solo** el
mensaje que el backend decide exponer (nunca detalles internos de la excepción).

---

## 12. Consumo de WebSocket

`src/services/socket.ts` → `conectarSala(codigo, callbacks)` abre una única conexión STOMP sobre
SockJS hacia `VITE_GAME_SERVICE_WS_URL`, con el JWT en el header `Authorization` del `CONNECT`.

| Se suscribe a | Callback |
|---|---|
| `/topic/sala/{codigo}/lobby` | `onRoster` |
| `/topic/sala/{codigo}/juego` | `onEstadoPartida` |
| `/topic/sala/{codigo}/chat` | `onChat` |
| `/user/queue/mano` | `onMano` |
| `/user/queue/errores` | `onError` |
| `/user/queue/espia` | `onEspia` |

Justo tras el `onConnect`, publica a `/app/partidas/{codigo}/sincronizar` — necesario porque el
broker STOMP del backend no reenvía mensajes pasados a un suscriptor nuevo (ver
[`GameService/README.md §9`](../GameService/README.md#9-flujo-interno)); sin esto, un cliente que
entra tarde o se reconecta se quedaría sin estado hasta la siguiente jugada ajena.

`ConexionSala` expone métodos de acción (`jugar`, `robar`, `decirUno`, `capturarPowerUp`,
`usarPowerUp`, `enviarChat`) que simplemente publican al destino STOMP correspondiente
(documentado en detalle en [`GameService/README.md §11`](../GameService/README.md#11-websocket--stomp)).

`reconnectDelay: 2000` — la librería STOMP.js reintenta la conexión sola cada 2s si se pierde; el
callback `onWebSocketClose`/reconexión alimenta el banner "Conexión perdida. Reconectando…" que
se ve en `Partida.tsx`.

---

## 13. Animación de robo de cartas

Detección **sin evento explícito del backend**: `EstadoPartida` solo expone `cantidadCartas` por
jugador (nunca las cartas ajenas, ver [§15 de GameService](../GameService/README.md#15-seguridad)).
En `Partida.tsx`, cada vez que llega un `EstadoPartida` nuevo se compara contra el snapshot
anterior (guardado en un `useRef`, para no disparar un re-render extra solo por guardar el
histórico):

```ts
const diferencia = previo ? jugador.cantidadCartas - previo.cantidadCartas : 0;
if (diferencia > 0) { /* dispara la animación "+N" para ese jugador */ }
```

Esto cubre **los 3 orígenes posibles** de un robo con la misma lógica: robo voluntario (botón
"Robar carta"), robo forzado por `+2`/`+4`, o robo forzado por el power-up "Robo forzado" — todos
terminan siendo, desde la perspectiva del cliente, un incremento de `cantidadCartas` entre dos
snapshots consecutivos.

Cada evento detectado se guarda en un mapa `userId → { cantidad, id }` (`OpponentBar.tsx`), con un
`id` incremental para que Framer Motion re-dispare la animación aunque el mismo jugador robe dos
veces seguidas, y se auto-limpia después de 1.5s con un guard que verifica que no lo haya
reemplazado ya un robo más nuevo antes de borrarlo.

---

## 14. Seguridad

- El frontend **nunca** valida una jugada — solo la propone; toda regla de negocio se re-valida en
  el backend, así que manipular el estado de React (o interceptar el `fetch`/WS) no permite
  hacer trampa.
- El JWT se guarda en `localStorage` (no en cookie) — aceptable para el alcance del proyecto, con
  la contrapartida documentada de exposición a XSS si se introdujera una vulnerabilidad de
  inyección de script (mitigado por React escapando por defecto todo el contenido renderizado).
- `VITE_API_URL`/`VITE_GAME_SERVICE_WS_URL` son públicas por diseño (van al bundle JS) — no deben
  usarse para ocultar nada sensible, solo para apuntar a los hosts correctos.

---

## 15. Testing y verificación manual

Este repositorio no tiene suite de tests automatizados de UI (fuera del `tsc --noEmit` que corre
como parte de `npm run build`, que atrapa errores de tipos).

Verificación manual recomendada (camino feliz + bordes):

1. `npm run dev`, abrir dos pestañas/perfiles distintos.
2. Crear sala en una pestaña, unirse con el código en la otra (HU-01/HU-02).
3. Iniciar la partida, jugar cartas especiales (saltar/reversa/+2/comodín/+4) y confirmar que el
   turno y el mazo se actualizan igual en ambas pestañas.
4. Esperar a que aparezca un power-up (cada 3 turnos) y capturarlo desde ambas pestañas casi al
   mismo tiempo — solo una debe ganarlo.
5. Cerrar una pestaña y reabrirla dentro de los 60s (`RECONEXION_TIMEOUT_SEGUNDOS`) — debe
   reconectar sin perder la partida.
6. Enviar mensajes de chat y confirmar que aparecen en ambas pestañas.
7. Terminar la partida y confirmar el `ResultOverlay` y que `/stats` refleja el resultado (si se
   jugó con cuenta, no invitado).

---

## 16. Despliegue

- **Docker**: `Dockerfile` multi-stage (Node build → nginx sirviendo `dist/`).
- **Docker Compose**: servicio `front` en [`docker-compose.yml`](../docker-compose.yml) (dev).
- **AWS**: build estático publicado a S3, servido vía CloudFront con TLS — ver
  [`deploy/README.md`](../deploy/README.md) y [`deploy/DEPLOY.md`](../deploy/DEPLOY.md) para el
  procedimiento completo, incluida la configuración de SPA (redirigir 403/404 a `index.html`).

---

## 17. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Pantalla en blanco tras `npm run dev` | `.env` no existe o le faltan variables | `cp .env.example .env` y reiniciar el servidor de dev |
| Errores CORS en consola | El origen de `http://localhost:5173` no está en `CORS_ALLOWED_ORIGINS` del Gateway/Game Service | Ajustar esa variable en los backends, no en el frontend |
| La partida se queda en "Conectando a la partida…" | El WebSocket no logra conectar (backend caído, o `VITE_GAME_SERVICE_WS_URL` incorrecta) | Verificar `curl $VITE_GAME_SERVICE_WS_URL/info` (endpoint de info de SockJS) |
| El chat crece indefinidamente y estira la página | Bug histórico corregido: el contenedor usaba `h-auto` en vez de `h-full`, rompiendo el `overflow-y-auto` interno | Ya corregido en `Partida.tsx`; si reaparece, confirmar que el contenedor del `ChatPanel` use `h-full` dentro de una fila flex ya acotada |
| Cambié `VITE_API_URL` y no surte efecto | Las variables `VITE_*` se inyectan en build-time | Reiniciar `npm run dev`, o rehacer `npm run build` si es producción |

---

## 18. Roadmap

- Suite de tests de componentes (Vitest + Testing Library) — actualmente solo hay verificación
  manual, documentada como deuda técnica.
- Modo espectador.
- Internacionalización (actualmente todo el texto está en español, hardcodeado).
- PWA / soporte offline básico para reconexión más resiliente en redes inestables.

---

## 19. Contribución

1. Toda llamada a la red pasa por `services/api.ts` o `services/socket.ts` — nunca `fetch`/WS
   directo desde un componente o página.
2. Nuevos tipos deben reflejar exactamente el DTO del backend correspondiente (`types/api.ts` /
   `types/game.ts`) — si el backend cambia un DTO, actualizar aquí en el mismo cambio.
3. `npm run build` (incluye `tsc --noEmit`) debe pasar antes de abrir PR.
4. Commits en [Conventional Commits](https://www.conventionalcommits.org/).

---

## 20. Licencia

MIT — ver [`LICENSE`](../LICENSE) en el repositorio raíz.

---

## 21. Autor

**DUCU** — Desarrollador Full-Stack (individual), proyecto de la asignatura ARSW.
Organización GitHub: [UNO-POWER](https://github.com/UNO-POWER).

Repositorio raíz del sistema: **[UNO Power-Ups Arena](../README.md)**.
