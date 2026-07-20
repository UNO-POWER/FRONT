import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CartaView } from "./CartaView";
import { esJugable, ordenarMano } from "./reglas";
import type { Carta, ColorCarta } from "@/types/game";
import { cn } from "@/utils/cn";

export interface PlayerHandProps {
  cartas: Carta[];
  esMiTurno: boolean;
  /** Carta superior del descarte, para resaltar visualmente que cartas son jugables. */
  cartaSuperior: Carta | null;
  /** Color activo (puede diferir del de la carta superior tras un comodin). */
  colorActual: ColorCarta | null;
  onJugar: (carta: Carta) => void;
}

const claveCarta = (c: Carta, i: number) => `${c.color}-${c.tipo}-${c.valor}-${i}`;

/**
 * Mano propia: carrusel horizontal en mobile, abanico centrado en desktop.
 * Ordenada por color/valor. En tu turno, las cartas jugables se resaltan y las no
 * jugables se atenuan (solo visual: el servidor sigue validando cada jugada).
 */
export function PlayerHand({ cartas, esMiTurno, cartaSuperior, colorActual, onJugar }: PlayerHandProps) {
  const reducirMovimiento = useReducedMotion();
  const cartasOrdenadas = useMemo(() => ordenarMano(cartas), [cartas]);

  const puedeEvaluar = esMiTurno && cartaSuperior !== null && colorActual !== null;
  const jugablePorCarta = cartasOrdenadas.map((c) =>
    puedeEvaluar ? esJugable(c, cartaSuperior, colorActual) : false,
  );
  const sinJugadas = puedeEvaluar && cartasOrdenadas.length > 0 && !jugablePorCarta.some(Boolean);

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
            className={cn(
              "font-display text-xs font-bold uppercase tracking-widest",
              sinJugadas ? "text-amber-300" : "text-indigo-300",
            )}
          >
            {sinJugadas ? "Sin jugadas: roba del mazo" : "Tu turno"}
          </motion.p>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 pt-3 sm:justify-center sm:overflow-visible">
        <AnimatePresence initial={false}>
          {cartasOrdenadas.map((carta, i) => (
            <motion.div
              key={claveCarta(carta, i)}
              layout={!reducirMovimiento}
              initial={reducirMovimiento ? false : { opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: -40, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <CartaView
                carta={carta}
                jugable={esMiTurno && jugablePorCarta[i]}
                atenuada={esMiTurno && puedeEvaluar && !jugablePorCarta[i]}
                disabled={!esMiTurno}
                onClick={() => onJugar(carta)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
