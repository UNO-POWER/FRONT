import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { JugadorPublico } from "@/types/game";
import { cn } from "@/utils/cn";

export interface OpponentBarProps {
  jugadores: JugadorPublico[];
  turnoActualUserId: string | null;
  miUserId: string | null;
}

/** Fila de jugadores: el turno activo lleva anillo con glow animado (layoutId compartido). */
export function OpponentBar({ jugadores, turnoActualUserId, miUserId }: OpponentBarProps) {
  const reducirMovimiento = useReducedMotion();

  return (
    <ul aria-label="Jugadores en la partida" className="flex justify-center gap-2 overflow-x-auto px-1 py-2 sm:gap-3">
      <AnimatePresence initial={false}>
        {jugadores.map((j) => {
          const esTurno = j.userId === turnoActualUserId;
          const soyYo = j.userId === miUserId;
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
              <span className="relative flex items-center gap-1.5">
                <span className="max-w-24 truncate text-xs font-semibold text-slate-200">
                  {soyYo ? "Tu" : j.username}
                </span>
                {j.escudoActivo && (
                  <span title="Escudo activo" aria-label="Escudo activo">
                    🛡️
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
