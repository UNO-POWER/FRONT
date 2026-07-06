import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { GameTable } from "@/features/game/GameTable";
import { OpponentBar } from "@/features/game/OpponentBar";
import { PlayerHand } from "@/features/game/PlayerHand";
import { PowerUpInventory } from "@/features/game/PowerUpInventory";
import { ColorPickerModal, EspiaModal, TargetPickerModal } from "@/features/game/GameModals";
import { ResultOverlay } from "@/features/game/ResultOverlay";
import { REQUIERE_OBJETIVO } from "@/features/game/powerups";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { conectarSala, type ConexionSala } from "@/services/socket";
import type {
  Carta,
  ColorJugable,
  EspiaResultado,
  EstadoPartida,
  Mano,
  MensajeChat,
  PowerUpTipo,
} from "@/types/game";
import { cn } from "@/utils/cn";

export default function Partida() {
  const { codigo = "" } = useParams();
  const { sesion } = useAuth();
  const { toast } = useToast();

  const [estado, setEstado] = useState<EstadoPartida | null>(null);
  const [mano, setMano] = useState<Mano | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [espia, setEspia] = useState<EspiaResultado | null>(null);
  const [cartaPendienteColor, setCartaPendienteColor] = useState<Carta | null>(null);
  const [powerUpPendiente, setPowerUpPendiente] = useState<PowerUpTipo | null>(null);
  const [conectado, setConectado] = useState(true);
  const [chatAbierto, setChatAbierto] = useState(false);
  const conexionRef = useRef<ConexionSala | null>(null);

  useEffect(() => {
    const conexion = conectarSala(codigo, {
      onEstadoPartida: setEstado,
      onMano: setMano,
      onChat: (m) => setMensajes((prev) => [...prev, m]),
      onError: (e) => toast(e.mensaje, "error"),
      onEspia: setEspia,
      onConexionCambio: setConectado,
    });
    conexionRef.current = conexion;
    return conexion.desconectar;
  }, [codigo, toast]);

  const jugar = useCallback((carta: Carta) => {
    if (carta.tipo === "COMODIN" || carta.tipo === "COMODIN_MAS_CUATRO") {
      setCartaPendienteColor(carta);
    } else {
      conexionRef.current?.jugar(carta, null);
    }
  }, []);

  const confirmarColor = useCallback(
    (color: ColorJugable) => {
      if (cartaPendienteColor) conexionRef.current?.jugar(cartaPendienteColor, color);
      setCartaPendienteColor(null);
    },
    [cartaPendienteColor],
  );

  const usarPowerUp = useCallback((tipo: PowerUpTipo) => {
    if (REQUIERE_OBJETIVO.has(tipo)) {
      setPowerUpPendiente(tipo);
    } else {
      conexionRef.current?.usarPowerUp(tipo, null);
    }
  }, []);

  const confirmarObjetivo = useCallback(
    (objetivoUserId: string) => {
      if (powerUpPendiente) conexionRef.current?.usarPowerUp(powerUpPendiente, objetivoUserId);
      setPowerUpPendiente(null);
    },
    [powerUpPendiente],
  );

  const robar = useCallback(() => conexionRef.current?.robar(), []);
  const capturar = useCallback((id: string) => conexionRef.current?.capturarPowerUp(id), []);

  if (!estado || !sesion) {
    return (
      <PageShell className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">Conectando a la partida…</p>
        <Link to="/" className="text-sm text-indigo-400 hover:underline">
          Volver al inicio
        </Link>
      </PageShell>
    );
  }

  const esMiTurno = estado.turnoActualUserId === sesion.userId;
  const finalizada = estado.estado === "FINALIZADA";
  const gane = estado.ganadorUserId === sesion.userId;
  const nombreGanador = estado.jugadores.find((j) => j.userId === estado.ganadorUserId)?.username ?? null;
  const rivales = estado.jugadores.filter((j) => j.userId !== sesion.userId && !j.abandonado);
  const puedeDecirUno = (mano?.cartas.length ?? 0) === 1;

  return (
    <PageShell className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-3 py-4 sm:px-6">
      {/* Banner de reconexion (STOMP reintenta solo; aqui solo informamos) */}
      <AnimatePresence>
        {!conectado && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            role="status"
            className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300"
          >
            <Spinner size="sm" /> Conexion perdida. Reconectando…
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold tracking-[0.25em] text-slate-300">{codigo}</span>
          <span
            aria-label={conectado ? "Conectado" : "Desconectado"}
            className={cn("h-2 w-2 rounded-full", conectado ? "bg-emerald-400" : "bg-amber-400")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="hidden sm:inline-flex">
            {estado.jugadores.filter((j) => !j.abandonado).length} en juego
          </Badge>
          <Link to="/" className="text-sm text-slate-400 hover:text-rose-300">
            Salir
          </Link>
        </div>
      </header>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        {/* Columna de juego */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <OpponentBar
            jugadores={estado.jugadores}
            turnoActualUserId={estado.turnoActualUserId}
            miUserId={sesion.userId}
          />

          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4">
            <GameTable
              cartaSuperior={estado.cartaSuperior}
              colorActual={estado.colorActual}
              direccion={estado.direccion}
              powerUpActivo={estado.powerUpActivo}
              esMiTurno={esMiTurno && !finalizada}
              onRobar={robar}
              onCapturarPowerUp={capturar}
            />
            <PowerUpInventory powerUps={mano?.powerUpsInventario ?? []} onUsar={usarPowerUp} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <AnimatePresence>
                {puedeDecirUno && !finalizada && (
                  <motion.button
                    type="button"
                    onClick={() => conexionRef.current?.decirUno()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-2.5 font-display text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/30 animate-pulse-glow"
                  >
                    ¡DECIR UNO!
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <PlayerHand cartas={mano?.cartas ?? []} esMiTurno={esMiTurno && !finalizada} onJugar={jugar} />
          </div>
        </div>

        {/* Chat: sidebar en desktop, sheet en mobile */}
        <ChatPanel
          mensajes={mensajes}
          miUserId={sesion.userId}
          onEnviar={(t) => conexionRef.current?.enviarChat(t)}
          className="hidden h-auto max-h-full w-80 shrink-0 lg:flex"
        />
      </div>

      <button
        type="button"
        onClick={() => setChatAbierto(true)}
        aria-label="Abrir chat"
        className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-xl shadow-lg shadow-indigo-500/30 lg:hidden"
      >
        💬
      </button>
      <AnimatePresence>
        {chatAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-black/50 lg:hidden"
            onMouseDown={(e) => e.target === e.currentTarget && setChatAbierto(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="w-full"
            >
              <ChatPanel
                mensajes={mensajes}
                miUserId={sesion.userId}
                onEnviar={(t) => conexionRef.current?.enviarChat(t)}
                className="h-[60dvh] rounded-b-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ColorPickerModal
        abierto={!!cartaPendienteColor}
        onElegir={confirmarColor}
        onCerrar={() => setCartaPendienteColor(null)}
      />
      <TargetPickerModal
        abierto={!!powerUpPendiente}
        powerUp={powerUpPendiente}
        rivales={rivales}
        onElegir={confirmarObjetivo}
        onCerrar={() => setPowerUpPendiente(null)}
      />
      <EspiaModal resultado={espia} onCerrar={() => setEspia(null)} />
      <ResultOverlay visible={finalizada} gane={gane} nombreGanador={nombreGanador} />
    </PageShell>
  );
}
