# FRONT

Frontend de UNO Power-Ups Arena. React 18 + Vite + Tailwind CSS + react-router-dom.

## Desarrollo local

```bash
cp .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`. Requiere API Gateway corriendo en `http://localhost:8080` y Game Service en `http://localhost:8083` (ver `docker-compose.yml` en la raiz del proyecto).

## Estructura

- `src/api/client.js` — cliente REST hacia el API Gateway (auth, salas).
- `src/api/ws.js` — conexion WebSocket **directa al Game Service** (no pasa por el Gateway, ver seccion 12.b del Inception doc) para roster de lobby, chat y eventos de partida.
- `src/pages/Landing.jsx` — entrar como invitado, crear sala o unirse con codigo (HU-01/HU-02).
- `src/pages/Lobby.jsx` — sala de espera con roster sincronizado en tiempo real.

## Pendiente (Sprint 2/3)

Pantalla de partida (HU-03/HU-04), chat (HU-05), login/registro con cuenta (HU-06 ya tiene backend, falta UI), estadisticas personales (HU-07).
