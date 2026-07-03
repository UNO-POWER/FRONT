import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const GAME_WS_URL = import.meta.env.VITE_GAME_SERVICE_WS_URL || "http://localhost:8083/ws-game";

/**
 * Conecta directo al Game Service (sin pasar por API Gateway) para minimizar latencia,
 * segun la arquitectura definida (seccion 12.b del Inception doc).
 */
export function conectarSala(codigo, onRoster) {
  const client = new Client({
    webSocketFactory: () => new SockJS(GAME_WS_URL),
    reconnectDelay: 2000,
    onConnect: () => {
      client.subscribe(`/topic/sala/${codigo}/lobby`, (message) => {
        onRoster(JSON.parse(message.body));
      });
    },
  });
  client.activate();
  return () => client.deactivate();
}
