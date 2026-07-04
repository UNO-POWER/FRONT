import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./client.js";

const GAME_WS_URL = import.meta.env.VITE_GAME_SERVICE_WS_URL || "http://localhost:8083/ws-game";

/**
 * Conecta directo al Game Service (sin pasar por API Gateway) para minimizar latencia,
 * segun la arquitectura definida (seccion 12.b del Inception doc). El JWT viaja en el
 * header nativo del CONNECT STOMP; el Game Service lo valida el mismo (EC-05), ya que
 * el WebSocket no pasa por el Gateway.
 *
 * callbacks: { onRoster, onEstadoPartida, onMano, onChat, onError, onEspia }
 * Devuelve { desconectar, jugar, robar, decirUno, capturarPowerUp, usarPowerUp, enviarChat }
 */
export function conectarSala(codigo, callbacks) {
  const client = new Client({
    webSocketFactory: () => new SockJS(GAME_WS_URL),
    connectHeaders: { Authorization: `Bearer ${getToken()}` },
    reconnectDelay: 2000,
    onConnect: () => {
      client.subscribe(`/topic/sala/${codigo}/lobby`, (msg) => callbacks.onRoster?.(JSON.parse(msg.body)));
      client.subscribe(`/topic/sala/${codigo}/juego`, (msg) => callbacks.onEstadoPartida?.(JSON.parse(msg.body)));
      client.subscribe(`/topic/sala/${codigo}/chat`, (msg) => callbacks.onChat?.(JSON.parse(msg.body)));
      client.subscribe(`/user/queue/mano`, (msg) => callbacks.onMano?.(JSON.parse(msg.body)));
      client.subscribe(`/user/queue/errores`, (msg) => callbacks.onError?.(JSON.parse(msg.body)));
      client.subscribe(`/user/queue/espia`, (msg) => callbacks.onEspia?.(JSON.parse(msg.body)));
      // el broker simple no reenvia mensajes pasados: forzamos un resync al conectar
      // (util al navegar directo a /partida/{codigo} o al reconectar, ver EC-08 futuro)
      client.publish({ destination: `/app/partidas/${codigo}/sincronizar` });
    },
  });
  client.activate();

  const enviar = (destino, body = {}) => {
    if (client.connected) {
      client.publish({ destination: destino, body: JSON.stringify(body) });
    }
  };

  return {
    desconectar: () => client.deactivate(),
    jugar: (carta, colorElegido) => enviar(`/app/partidas/${codigo}/jugar`, { carta, colorElegido }),
    robar: () => enviar(`/app/partidas/${codigo}/robar`),
    decirUno: () => enviar(`/app/partidas/${codigo}/decir-uno`),
    capturarPowerUp: (powerUpId) => enviar(`/app/partidas/${codigo}/powerups/capturar`, { powerUpId }),
    usarPowerUp: (tipo, objetivoUserId) => enviar(`/app/partidas/${codigo}/powerups/usar`, { tipo, objetivoUserId }),
    enviarChat: (texto) => enviar(`/app/salas/${codigo}/chat`, { texto }),
  };
}
