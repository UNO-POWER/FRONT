import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CartaView } from "./CartaView";
import type { Carta } from "@/types/game";
import { cn } from "@/utils/cn";

export interface PlayerHandProps {
  cartas: Carta[];
  esMiTurno: boolean;
  onJugar: (carta: Carta) => void;
}

const claveCarta = (c: Carta, i: number) => `${c.color}-${c.tipo}-${c.valor}-${i}`;

/**
 * Mano propia: carrusel horizontal en mobile, abanico centrado en desktop.
 * Las cartas nuevas entran con deal animado (AnimatePresence).
 */
export function PlayerHand({ cartas, esMiTurno, onJugar }: PlayerHandProps) {
  const reducirMovimiento = useReducedMotion();

  return (
    <section
      aria-label={esMiTurno ? "Tu mano — es tu turno" : "Tu mano"}
      className={cn(
        "rounded-2xl border px-3 py-4 transition-colors duration-300",
        esMiTurno ? "border-indigo-400/40 bg-indigo-500/5" : "border-line bg-surface-raised/60",
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Tu mano · {cartas.length}
        </p>
        {esMiTurno && (
          <motion.p
            initial={reducirMovimiento ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-xs font-bold uppercase tracking-widest text-indigo-300"
          >
            Tu turno
          </motion.p>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 pt-3 sm:justify-center sm:overflow-visible">
        <AnimatePresence initial={false}>
          {cartas.map((carta, i) => (
            <motion.div
              key={claveCarta(carta, i)}
              layout={!reducirMovimiento}
              initial={reducirMovimiento ? false : { opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: -40, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <CartaView carta={carta} jugable={esMiTurno} disabled={!esMiTurno} onClick={() => onJugar(carta)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
