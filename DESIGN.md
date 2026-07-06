# UNO Power-Ups Arena — Especificación de Diseño y Frontend

> Fuente de verdad del rediseño. Cubre UX, arquitectura, design system, wireframes,
> árbol de componentes y especificación por pantalla. El código de `src/` implementa
> exactamente lo que se define aquí.

---

## 1. Principios de producto

1. **Cero fricción**: del landing a jugar en < 60 s (EC-07). Sin registro obligatorio.
2. **Una acción principal por pantalla**: el usuario nunca se pregunta "¿y ahora qué?".
3. **Premium, no infantil**: estética Riot/Discord/Linear — oscuro, gradientes contenidos,
   glassmorphism ligero, movimiento con propósito.
4. **El servidor manda**: la UI nunca decide reglas de juego; refleja estado del backend
   y muestra el rechazo con claridad (EC-05).
5. **Accesible por defecto**: WCAG AA, teclado completo, `prefers-reduced-motion`.

## 2. Flujo UX principal (happy path)

```
Landing ──nombre──▶ [Crear sala] ──▶ Sala de espera ──copiar código──▶ amigos entran
   │                                        │ (roster en vivo, chat)
   │ código ──▶ [Unirse]────────────────────┘
   │                                        ▼ anfitrión: [Iniciar partida]
   └─ "Iniciar sesión" (opcional) ──▶  Tablero de juego ──▶ Victoria/Derrota ──▶ Stats
```

- Clics mínimos: **2** para estar en una sala (nombre + Crear sala).
- La acción primaria siempre es el elemento con mayor jerarquía visual (gradiente brand).
- Estados vacíos, de carga y de error diseñados — nunca pantalla en blanco.

### Flujos secundarios
- **Cuenta** (`/auth`): tabs Iniciar sesión / Registro. Beneficio explícito: "tus
  estadísticas se guardan". Nunca bloquea el flujo de juego.
- **Reconexión**: banner ámbar persistente + reintento automático (STOMP reconnectDelay).
- **Expulsión de errores de jugada**: toast no bloqueante, el turno sigue visible.

## 3. Arquitectura frontend

```
src/
├── app/                    # composición de la aplicación
│   ├── App.tsx             # router + Suspense + ErrorBoundary
│   ├── providers.tsx       # AuthProvider, ToastProvider
│   └── routes.tsx          # definición lazy de rutas
├── assets/                 # (fuentes vía @fontsource, sin imágenes pesadas)
├── components/
│   ├── ui/                 # design system puro, sin dominio
│   │   ├── Button.tsx  Input.tsx  Card.tsx  Badge.tsx  Modal.tsx
│   │   ├── Toast.tsx  Skeleton.tsx  Spinner.tsx  EmptyState.tsx
│   └── layout/
│       └── PageShell.tsx   # fondo, glow, contenedor responsive
├── features/
│   ├── auth/               # GuestGate, LoginForm, RegisterForm
│   ├── lobby/              # PlayerSlots, RoomCode, StartGameCta
│   ├── game/               # GameBoard, PlayerHand, CartaView, DiscardPile,
│   │                       # OpponentBar, PowerUpOrb, PowerUpInventory,
│   │                       # ColorPicker, TargetPicker, EspiaModal,
│   │                       # ResultOverlay (victoria/derrota)
│   ├── chat/               # ChatPanel (compartido lobby + juego)
│   └── stats/              # StatCard, WinrateRing
├── contexts/               # AuthContext, ToastContext
├── hooks/                  # useGameSocket, useCountUp, useCopyToClipboard
├── pages/                  # Landing, Auth, Lobby, Partida, Stats, NotFound
├── services/               # api.ts (REST tipado), socket.ts (STOMP), token.ts
├── types/                  # espejo de los DTOs del backend (api.ts, game.ts)
├── utils/                  # cn.ts (clsx + tailwind-merge)
└── styles/index.css        # capas Tailwind + tokens CSS
```

Reglas:
- `components/ui` **no** importa nada de `features/` ni `services/` (design system puro).
- `pages/` compone features; no contiene lógica de red directa.
- Toda llamada de red vive en `services/`; los componentes consumen hooks/contexts.
- Un componente = una responsabilidad. > 150 líneas → se divide.

## 4. Design System

### 4.1 Color

| Token | Valor | Uso |
|---|---|---|
| `surface` | `#0A0D14` | fondo base de página |
| `surface-raised` | `#121826` | cards, paneles |
| `surface-overlay` | `#1A2130` | modals, popovers |
| `line` | `white/8%` | bordes hairline |
| **Primario** | gradiente `indigo-500 → violet-500` | CTA principal, foco de marca |
| **Acento** | `amber-400` | "Decir UNO", momentos de juego, highlights |
| Éxito | `emerald-400/500` | confirmaciones, victoria |
| Error | `rose-500` | errores, derrota, abandonar |
| Info | `sky-400` | estados informativos |
| Texto primario | `slate-100` | títulos, contenido |
| Texto secundario | `slate-400` | descripciones, metadatos |

Cartas del juego (saturación calibrada para fondo oscuro, contraste AA con texto blanco):
`ROJO #F43F5E · AMARILLO #F59E0B (texto slate-900) · VERDE #10B981 · AZUL #3B82F6 ·
COMODÍN slate-900 + anillo cónico multicolor`.

**Accesibilidad de color**: cada color de carta lleva además una **forma** en la esquina
(● rojo, ■ amarillo, ▲ verde, ◆ azul) — nunca se depende solo del color.

### 4.2 Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Space Grotesk** (variable) | títulos, código de sala, números grandes |
| UI | **Inter** (variable) | todo lo demás |

Escala: `text-xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 4xl 36 / 6xl 60`.
Ambas auto-alojadas vía `@fontsource` (sin CDN externo, sin FOUT de terceros).

### 4.3 Espaciado, radios, elevación

- Espaciado: escala Tailwind (base 4 px). Secciones `py-16/24`, gaps de card `gap-4/6`.
- Radios: botones/inputs `rounded-xl` (12), cards `rounded-2xl` (16), modals `rounded-3xl` (24), pills `rounded-full`.
- Elevación: sombras suaves y de color — `shadow-lg shadow-indigo-500/20` en CTA,
  `shadow-2xl shadow-black/40` en modals. Glass: `bg-white/5 backdrop-blur-md border border-white/10`.

### 4.4 Breakpoints

Tailwind estándar: `sm 640 · md 768 · lg 1024 · xl 1280`. Diseño mobile-first;
layouts de juego y chat cambian de composición (no solo de tamaño) en `lg`.

### 4.5 Componentes del sistema

| Componente | Variantes | Notas de accesibilidad |
|---|---|---|
| **Button** | `primary` (gradiente) · `secondary` · `ghost` · `danger`; tamaños `sm/md/lg`; estado `loading` | focus ring visible, `aria-busy` en loading |
| **Input** | label flotante fijo, error, hint, prefijo | `aria-invalid`, `aria-describedby` del error |
| **Card** | `solid` · `glass` | — |
| **Modal** | tamaño `sm/md` | `role=dialog`, `aria-modal`, focus trap, Escape, devuelve foco |
| **Toast** | `success/error/info` | región `aria-live=polite`, auto-dismiss 4 s |
| **Badge** | `neutral/brand/success/warning/danger` | — |
| **Skeleton** | línea/bloque, shimmer | `aria-hidden` |
| **Spinner** | `sm/md/lg` | `role=status` + texto sr-only |
| **EmptyState** | icono + título + descripción + acción | — |

### 4.6 Movimiento (Framer Motion)

- **Duraciones**: micro 150–200 ms · transición de UI 250–350 ms · eventos de juego 400–600 ms.
- **Easing**: springs suaves (`stiffness 260, damping 24`) para cartas; `easeOut` para fades.
- **Reglas**: nada parpadea, nada rebota más de una vez, nada bloquea input.
  `useReducedMotion()` desactiva partículas, vuelos de carta y stagger (fade simple).
- Catálogo: fade-up de entrada (stagger 60 ms), lift de hover en CTA (−2 px), vuelo de
  carta mano→descarte, deal de cartas al robar, pulso del orbe de power-up, anillo de
  turno animado, overlay de resultado con partículas (solo victoria), slide de chat.

## 5. Wireframes (desktop → mobile)

### Landing
```
┌────────────────────────────────────────────────┐
│ ◆ UNO POWER-UPS            [Iniciar sesión]   │
│                                                │
│          U N O  POWER-UPS ARENA                │  ← display, gradiente
│     UNO en tiempo real con power-ups.          │
│      Sin descargas. Sin registro.              │
│   ┌──────────── glass card ────────────┐       │
│   │ [ Tu nombre__________________ ]    │       │
│   │ [██████ Crear sala ██████]  1 CTA  │       │
│   │ ─────────── o ───────────          │       │
│   │ [ CÓDIGO ] [Unirse]                │       │
│   └─────────────────────────────────────┘      │
│   · Tiempo real · Power-ups · 2–10 jugadores   │
└────────────────────────────────────────────────┘
```
Mobile: misma jerarquía en columna, CTA full-width, header compacto.

### Sala de espera (Lobby)
```
┌────────────────────────────────────────────────┐
│ ← Salir        SALA  A B 4 K 9 M  [copiar]     │  ← código display + toast
│   "Comparte el código para invitar"            │
│  ┌──────┐ ┌──────┐ ┌╌╌╌╌╌╌┐ ┌╌╌╌╌╌╌┐          │
│  │ ◉ Ana│ │ ◉ Leo│ │espera│ │espera│  …x10    │  ← slots, host con corona
│  │ 👑   │ │      │ ┆ndo…  ┆ ┆      ┆          │
│  └──────┘ └──────┘ └╌╌╌╌╌╌┘ └╌╌╌╌╌╌┘          │
│  [████ Iniciar partida ████] (solo anfitrión)  │
│  ┌─────────────── chat ───────────────┐        │
└────────────────────────────────────────────────┘
```

### Tablero de juego (Partida)
```
┌────────────────────────────────────────────────┐
│ AB4K9M ● conectado                    [Salir]  │
│   ┌─Leo 5🂠─┐ ┌─Ana 2🂠 UNO!─┐ ┌─Mia 7🂠─┐      │  ← oponentes, turno = anillo glow
│                                                │
│        [mazo]   [descarte]   (orbe ⚡)         │  ← mesa central
│                  color: ● AZUL  ↻ dirección    │
│                                                │
│  power-ups: [Escudo] [Espía]                   │  ← inventario chips
│  ┌── MI MANO (fan, jugables elevadas) ──┐      │
│  │  🂠 🂠 🂠 🂠 🂠 🂠 🂠      [DECIR UNO]  │      │
│  └────────────────────────────────────────┘    │
│                                    [chat ▸]    │  ← panel colapsable
└────────────────────────────────────────────────┘
```
Mobile: oponentes en fila scrolleable, mano en carrusel horizontal, chat como sheet.

### Resultado (overlay sobre el tablero)
```
┌───────── backdrop blur ─────────┐
│        🏆  ¡VICTORIA!           │   (derrota: tono neutro, sin burla)
│   Ganaste a 3 jugadores         │
│ [Jugar de nuevo] [Ver stats]    │
└─────────────────────────────────┘
```

### Stats
```
┌ ◆ ducuplayer ────────────────────┐
│  [ 12 jugadas ][ 7 ganadas ][ racha 3 ]   ← count-up
│        ◔ 58% winrate (anillo SVG)         │
│  [Volver]                                  │
└───────────────────────────────────────────┘
```

## 6. Árbol de componentes (pantalla de juego)

```
Partida (page)
├── GameTopBar (código, estado conexión, salir)
├── OpponentBar → OpponentCard* (nombre, nº cartas, UNO!, 🛡, anillo de turno)
├── GameTable
│   ├── DeckPile (robar)
│   ├── DiscardPile → CartaView (tope, stack rotado)
│   ├── ColorIndicator + DirectionIndicator
│   └── PowerUpOrb (AnimatePresence)
├── PowerUpInventory → chip* → TargetPicker | acción directa
├── PlayerHand → CartaView* (fan, jugable/deshabilitada, vuelo al jugar)
├── SayUnoButton
├── ChatPanel (colapsable / sheet)
├── ColorPickerModal · TargetPickerModal · EspiaModal
├── ResultOverlay (victoria/derrota + partículas)
└── ReconnectBanner
```

## 7. Pantallas: alcance

| Pantalla | Estado | Nota |
|---|---|---|
| Landing (+ invitado, crear, unirse) | ✅ código | acción principal única |
| Auth (login/registro tabs) | ✅ código | HU-06 |
| Sala de espera + chat | ✅ código | HU-01/02/05 |
| Juego completo + power-ups + chat + victoria/derrota + reconexión | ✅ código | HU-03/04 |
| Stats | ✅ código | HU-07 |
| 404 / Loading / Error boundary | ✅ código | estados de sistema |
| Listado público de salas | 📋 roadmap | requiere HU-09 backend (Could, no construido) |
| Dashboard KPIs | 📋 roadmap | HU-11 se sirve en Grafana (ObservabilityStack) |
| Configuración | 📋 roadmap | sin settings de servidor aún; solo tendría tema/sonido |

**Regla**: no se codifica UI sin backend real detrás (nada de datos falsos).

## 8. Accesibilidad (WCAG AA)

- Contraste ≥ 4.5:1 en texto (slate-100/400 sobre surface verificados; ámbar lleva texto oscuro).
- Teclado: todo operable con Tab/Enter/Espacio; cartas son `<button>` con
  `aria-label="Jugar 5 rojo"`; modals con focus trap + Escape.
- `:focus-visible` con anillo índigo en TODOS los interactivos.
- Color nunca es el único canal: formas en cartas, texto en estados, iconos en toasts.
- Live regions: toasts (`aria-live=polite`), turno anunciado en texto visible.
- `prefers-reduced-motion` respetado globalmente.

## 9. Seguridad frontend

- **JWT fuera de `localStorage`** → `services/token.ts`: memoria de módulo con espejo en
  `sessionStorage` (aislado por pestaña, se limpia al cerrarla; reduce superficie XSS
  frente a localStorage). **Pendiente backend documentado**: cookie `HttpOnly` +
  `SameSite=Strict` emitida por el Gateway eliminaría el acceso de JS al token por completo.
- React escapa todo por defecto; **prohibido** `dangerouslySetInnerHTML`; chat se
  renderiza como texto plano con límite de longitud.
- Validación en cliente espejo de la del servidor (longitudes, requeridos) — el servidor
  sigue siendo autoritativo (EC-05).
- Errores del API se muestran con mensaje del backend, sin stack traces ni detalles internos.
- La identidad en el juego sale del JWT validado por el Game Service en el CONNECT,
  jamás del payload del cliente.

## 10. Performance

- Rutas con `React.lazy` + `Suspense` (code splitting por pantalla).
- `CartaView` memoizada; handlers estables (`useCallback`) en el tablero.
- Sin imágenes bitmap: todo CSS/SVG/tipografía (bundle pequeño, cero CLS).
- Fuentes variables auto-alojadas con `font-display: swap`.
- Animaciones solo `transform/opacity` (compositor), nunca layout thrash.
```
