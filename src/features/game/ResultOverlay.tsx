import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export interface ResultOverlayProps {
  visible: boolean;
  gane: boolean;
  nombreGanador: string | null;
}

const PARTICULAS = 14;

/** Overlay de fin de partida. Victoria celebra; derrota informa sin burla. */
export function ResultOverlay({ visible, gane, nombreGanador }: ResultOverlayProps) {
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const reducirMovimiento = useReducedMotion();

  const particulas = useMemo(
    () =>
      Array.from({ length: PARTICULAS }, (_, i) => ({
        x: (Math.random() - 0.5) * 420,
        y: -(120 + Math.random() * 260),
        rotate: Math.random() * 360,
        delay: i * 0.03,
        color: ["#F43F5E", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][i % 5],
      })),
    [],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={gane ? "Victoria" : "Fin de la partida"}
        >
          {gane && !reducirMovimiento && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              {particulas.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 40, opacity: 1, rotate: 0 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
                  transition={{ duration: 1.4, delay: p.delay, ease: "easeOut" }}
                  style={{ backgroundColor: p.color }}
                  className="absolute left-1/2 top-1/2 h-3 w-2 rounded-sm"
                />
              ))}
            </div>
          )}

          <motion.div
            initial={reducirMovimiento ? false : { scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-surface-overlay p-8 text-center shadow-2xl shadow-black/50"
          >
            <span aria-hidden="true" className="text-5xl">
              {gane ? "🏆" : "🎴"}
            </span>
            <div>
              <h2
                className={`font-display text-3xl font-bold ${gane ? "bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent" : "text-slate-100"}`}
              >
                {gane ? "¡Victoria!" : "Fin de la partida"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {gane ? "Dominaste la arena. Bien jugado." : nombreGanador ? `Gano ${nombreGanador}. La proxima es tuya.` : "La partida ha terminado."}
              </p>
            </div>
            {sesion?.esInvitado && (
              <div className="w-full rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-left">
                <p className="text-sm font-semibold text-amber-200">Jugaste como invitado</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Esta partida no quedo guardada. Crea una cuenta para que tus proximas partidas,
                  victorias y racha cuenten en tus estadisticas. Si prefieres seguir de invitado,
                  siempre podras registrarte despues desde el inicio.
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              {sesion?.esInvitado ? (
                <>
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Crear cuenta y guardar mi progreso
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/")}>
                    Seguir como invitado
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate("/")}>
                    Jugar de nuevo
                  </Button>
                  {sesion && (
                    <Button variant="ghost" onClick={() => navigate("/stats")}>
                      Ver mis estadisticas
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
