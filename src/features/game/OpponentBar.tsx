import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";
import type { JugadorPublico } from "@/types/game";
import { cn } from "@/utils/cn";

export interface RoboEvento {
  cantidad: number;
  id: number;
}

export interface OpponentBarProps {
  jugadores: JugadorPublico[];
  turnoActualUserId: string | null;
  miUserId: string | null;
  /** userId -> ultimo robo detectado (propio o forzado por +2/+4/power-up), para animar. */
  roboPorJugador?: Record<string, RoboEvento>;
  /** Vencimiento del turno actual (ISO): countdown visible en el chip del jugador en turno. */
  turnoVenceEn?: string | null;
}

/** Fila de jugadores: el turno activo lleva anillo con glow animado (layoutId compartido). */
export function OpponentBar({
  jugadores,
  turnoActualUserId,
  miUserId,
  roboPorJugador,
  turnoVenceEn,
}: OpponentBarProps) {
  const reducirMovimiento = useReducedMotion();
  const segundosRestantes = useCountdown(turnoVenceEn ?? null);

  return (
    <ul aria-label="Jugadores en la partida" className="flex justify-center gap-2 overflow-x-auto px-1 py-2 sm:gap-3">
      <AnimatePresence initial={false}>
        {jugadores.map((j) => {
          const esTurno = j.userId === turnoActualUserId;
          const soyYo = j.userId === miUserId;
          const robo = roboPorJugador?.[j.userId];
          return (
            <motion.li
              key={j.userId}
              layout={!reducirMovimiento}
              initial={reducirMovimiento ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: j.abandonado ? 0.4 : 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={cn(
                "relative flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-3 py-2",
                esTurno ? "border-indigo-400/50 bg-indigo-500/10" : "border-line bg-surface-raised",
                robo && !reducirMovimiento && "animate-flash-robo",
              )}
            >
              {esTurno && (
                <motion.span
                  layoutId="anillo-turno"
                  aria-hidden="true"
                  className="absolute -inset-px rounded-2xl ring-2 ring-indigo-400/70 animate-pulse-glow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Alerta de robo: "+N" flotante, propio o forzado por +2/+4/power-up */}
              <AnimatePresence>
                {robo && (
                  <motion.span
                    key={robo.id}
                    role="status"
                    aria-label={`${soyYo ? "Robaste" : `${j.username} robó`} ${robo.cantidad} carta${robo.cantidad === 1 ? "" : "s"}`}
                    initial={{ opacity: 0, y: 4, scale: 0.6 }}
                    animate={{ opacity: 1, y: -22, scale: 1.1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute -top-3 right-0 z-10 flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 font-display text-xs font-bold text-slate-900 shadow-lg shadow-amber-500/40"
                  >
                    🂠 +{robo.cantidad}
                  </motion.span>
                )}
              </AnimatePresence>

              <span className="relative flex items-center gap-1.5">
                <span className="max-w-24 truncate text-xs font-semibold text-slate-200">
                  {soyYo ? "Tu" : j.username}
                </span>
                {j.escudoActivo && (
                  <span title="Escudo activo" aria-label="Escudo activo">
                    🛡️
                  </span>
                )}
                {esTurno && segundosRestantes !== null && (
                  <span
                    role="timer"
                    aria-label={`Quedan ${segundosRestantes} segundos de turno`}
                    className={cn(
                      "rounded-full px-1.5 font-display text-[0.65rem] font-bold tabular-nums",
                      segundosRestantes <= 5
                        ? "bg-rose-500/20 text-rose-300 animate-pulse"
                        : "bg-indigo-500/20 text-indigo-200",
                    )}
                  >
                    ⏱ {segundosRestantes}s
                  </span>
                )}
              </span>
              <span className="relative flex items-center gap-1.5 text-xs text-slate-400">
                <span aria-hidden="true">🂠</span>
                <span>
                  {j.cantidadCartas} {j.cantidadCartas === 1 ? "carta" : "cartas"}
                </span>
                {j.dijoUno && (
                  <span className="rounded-full bg-amber-400/15 px-1.5 font-display text-[0.65rem] font-bold text-amber-300">
                    ¡UNO!
                  </span>
                )}
                {j.abandonado && <span className="text-rose-400">salio</span>}
              </span>
              {esTurno && <span className="sr-only">Es su turno</span>}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
