import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  Carta,
  ColorJugable,
  EspiaResultado,
  EstadoPartida,
  ErrorJuego,
  Mano,
  MensajeChat,
  PowerUpTipo,
} from "@/types/game";
import type { SalaResponse } from "@/types/api";
import { obtenerToken } from "./token";

const GAME_WS_URL = import.meta.env.VITE_GAME_SERVICE_WS_URL ?? "http://localhost:8083/ws-game";

export interface CallbacksSala {
  onRoster?: (sala: SalaResponse) => void;
  onEstadoPartida?: (estado: EstadoPartida) => void;
  onMano?: (mano: Mano) => void;
  onChat?: (mensaje: MensajeChat) => void;
  onError?: (error: ErrorJuego) => void;
  onEspia?: (resultado: EspiaResultado) => void;
  onConexionCambio?: (conectado: boolean) => void;
}

export interface ConexionSala {
  desconectar: () => void;
  jugar: (carta: Carta, colorElegido: ColorJugable | null) => void;
  robar: () => void;
  decirUno: () => void;
  capturarPowerUp: (powerUpId: string) => void;
  usarPowerUp: (tipo: PowerUpTipo, objetivoUserId: string | null) => void;
  enviarChat: (texto: string) => void;
}

/**
 * Conexion WebSocket directa al Game Service, sin pasar por el API Gateway
 * (DESIGN.md / Inception §12.b, minimiza latencia EC-01). El JWT viaja en el
 * CONNECT y el Game Service lo valida el mismo (EC-05).
 */
export function conectarSala(codigo: string, callbacks: CallbacksSala): ConexionSala {
  const client = new Client({
    webSocketFactory: () => new SockJS(GAME_WS_URL) as WebSocket,
    connectHeaders: { Authorization: `Bearer ${obtenerToken() ?? ""}` },
    reconnectDelay: 2000,
    onConnect: () => {
      callbacks.onConexionCambio?.(true);
      const sub = <T,>(destino: string, handler?: (payload: T) => void) =>
        client.subscribe(destino, (msg) => handler?.(JSON.parse(msg.body) as T));

      sub<SalaResponse>(`/topic/sala/${codigo}/lobby`, callbacks.onRoster);
      sub<EstadoPartida>(`/topic/sala/${codigo}/juego`, callbacks.onEstadoPartida);
      sub<MensajeChat>(`/topic/sala/${codigo}/chat`, callbacks.onChat);
      sub<Mano>("/user/queue/mano", callbacks.onMano);
      sub<ErrorJuego>("/user/queue/errores", callbacks.onError);
      sub<EspiaResultado>("/user/queue/espia", callbacks.onEspia);

      // El broker simple no reenvia mensajes pasados: pedimos el estado actual al conectar.
      client.publish({ destination: `/app/partidas/${codigo}/sincronizar` });
    },
    onWebSocketClose: () => callbacks.onConexionCambio?.(false),
  });
  client.activate();

  const enviar = (destino: string, body: unknown = {}) => {
    if (client.connected) {
      client.publish({ destination: destino, body: JSON.stringify(body) });
    }
  };

  return {
    desconectar: () => void client.deactivate(),
    jugar: (carta, colorElegido) => enviar(`/app/partidas/${codigo}/jugar`, { carta, colorElegido }),
    robar: () => enviar(`/app/partidas/${codigo}/robar`),
    decirUno: () => enviar(`/app/partidas/${codigo}/decir-uno`),
    capturarPowerUp: (powerUpId) => enviar(`/app/partidas/${codigo}/powerups/capturar`, { powerUpId }),
    usarPowerUp: (tipo, objetivoUserId) => enviar(`/app/partidas/${codigo}/powerups/usar`, { tipo, objetivoUserId }),
    enviarChat: (texto) => enviar(`/app/salas/${codigo}/chat`, { texto }),
  };
}
