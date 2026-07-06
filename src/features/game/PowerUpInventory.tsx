import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DESCRIPCION_POWERUP, ICONO_POWERUP, NOMBRE_POWERUP } from "./powerups";
import type { PowerUpTipo } from "@/types/game";

export interface PowerUpInventoryProps {
  powerUps: PowerUpTipo[];
  onUsar: (tipo: PowerUpTipo) => void;
}

/** Chips de power-ups capturados, listos para usar (HU-04). */
export function PowerUpInventory({ powerUps, onUsar }: PowerUpInventoryProps) {
  const reducirMovimiento = useReducedMotion();
  if (powerUps.length === 0) return null;

  return (
    <div aria-label="Tus power-ups" className="flex flex-wrap justify-center gap-2">
      <AnimatePresence initial={false}>
        {powerUps.map((tipo, i) => (
          <motion.button
            key={`${tipo}-${i}`}
            type="button"
            onClick={() => onUsar(tipo)}
            title={DESCRIPCION_POWERUP[tipo]}
            aria-label={`Usar ${NOMBRE_POWERUP[tipo]}: ${DESCRIPCION_POWERUP[tipo]}`}
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={reducirMovimiento ? undefined : { y: -2 }}
            className="flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-200 shadow-md shadow-violet-500/10 hover:bg-violet-500/25"
          >
            <span aria-hidden="true">{ICONO_POWERUP[tipo]}</span>
            {NOMBRE_POWERUP[tipo]}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
