import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CartaView } from "./CartaView";
import type { Carta, ColorCarta, PowerUpPublico } from "@/types/game";
import { NOMBRE_POWERUP } from "./powerups";
import { cn } from "@/utils/cn";

export interface GameTableProps {
  cartaSuperior: Carta;
  colorActual: ColorCarta;
  direccion: 1 | -1;
  powerUpActivo: PowerUpPublico | null;
  esMiTurno: boolean;
  /** Resalta el mazo cuando el jugador no tiene ninguna carta jugable (guia visual). */
  resaltarRobar?: boolean;
  onRobar: () => void;
  onCapturarPowerUp: (id: string) => void;
}

const COLOR_DOT: Record<ColorCarta, string> = {
  ROJO: "bg-carta-rojo",
  AMARILLO: "bg-carta-amarillo",
  VERDE: "bg-carta-verde",
  AZUL: "bg-carta-azul",
  COMODIN: "bg-gradient-to-r from-carta-rojo via-carta-verde to-carta-azul",
};

/** Mesa central: mazo (robar), descarte animado, indicadores y orbe de power-up. */
export function GameTable({
  cartaSuperior,
  colorActual,
  direccion,
  powerUpActivo,
  esMiTurno,
  resaltarRobar,
  onRobar,
  onCapturarPowerUp,
}: GameTableProps) {
  const reducirMovimiento = useReducedMotion();
  const claveDescarte = `${cartaSuperior.color}-${cartaSuperior.tipo}-${cartaSuperior.valor}`;

  return (
    <section aria-label="Mesa de juego" className="flex flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-6 sm:gap-10">
        {/* Mazo: robar carta */}
        <motion.button
          type="button"
          onClick={onRobar}
          disabled={!esMiTurno}
          aria-label="Robar carta del mazo"
          whileHover={reducirMovimiento || !esMiTurno ? undefined : { y: -4 }}
          whileTap={reducirMovimiento || !esMiTurno ? undefined : { scale: 0.97 }}
          className={cn(
            "relative h-24 w-16 rounded-xl border border-white/15 shadow-lg shadow-black/40",
            "bg-[repeating-linear-gradient(45deg,#1e1b4b_0_8px,#312e81_8px_16px)]",
            "disabled:opacity-45",
            resaltarRobar && esMiTurno && "ring-2 ring-amber-400/70 animate-pulse-glow",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-1 -translate-y-1 rounded-xl border border-white/10 bg-[repeating-linear-gradient(45deg,#1e1b4b_0_8px,#312e81_8px_16px)]"
          />
          <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-bold tracking-widest text-indigo-300">
            ROBAR
          </span>
        </motion.button>

        {/* Descarte: la carta nueva "cae" con spring */}
        <div className="relative" aria-label={`Descarte`}>
          <div aria-hidden="true" className="absolute inset-0 rotate-6 rounded-xl bg-white/5" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={claveDescarte}
              initial={reducirMovimiento ? false : { y: 46, scale: 1.12, rotate: -8, opacity: 0 }}
              animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <CartaView carta={cartaSuperior} size="lg" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Orbe de power-up (HU-04): primer click gana */}
        <div className="flex h-24 w-16 items-center justify-center">
          <AnimatePresence>
            {powerUpActivo && (
              <motion.button
                type="button"
                key={powerUpActivo.id}
                onClick={() => onCapturarPowerUp(powerUpActivo.id)}
                aria-label={`Capturar power-up ${NOMBRE_POWERUP[powerUpActivo.tipo]}`}
                initial={reducirMovimiento ? false : { scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-violet-400/40 bg-violet-600/25 text-xl shadow-lg shadow-violet-500/30 animate-pulse-glow"
              >
                ⚡
                <span className="px-1 text-center text-[0.5rem] font-bold uppercase leading-tight text-violet-200">
                  {NOMBRE_POWERUP[powerUpActivo.tipo]}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-2">
          Color actual
          <span aria-hidden="true" className={cn("h-3.5 w-3.5 rounded-full", COLOR_DOT[colorActual])} />
          <span className="font-semibold text-slate-200">{colorActual}</span>
        </span>
        <span aria-label={`Direccion ${direccion === 1 ? "horaria" : "antihoraria"}`} className="flex items-center gap-1.5">
          <motion.span
            aria-hidden="true"
            animate={reducirMovimiento ? undefined : { rotate: direccion === 1 ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-block text-indigo-300"
          >
            ↻
          </motion.span>
          direccion
        </span>
      </div>
    </section>
  );
}
