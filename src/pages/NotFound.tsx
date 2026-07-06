import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

const CARTAS_DECORATIVAS = [
  { rotate: -14, x: -46, color: "bg-carta-rojo" },
  { rotate: -4, x: -16, color: "bg-carta-amarillo" },
  { rotate: 6, x: 14, color: "bg-carta-verde" },
  { rotate: 16, x: 44, color: "bg-carta-azul" },
];

export default function NotFound() {
  const navigate = useNavigate();
  const reducirMovimiento = useReducedMotion();

  return (
    <PageShell className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div aria-hidden="true" className="relative h-28 w-40">
        {CARTAS_DECORATIVAS.map((c, i) => (
          <motion.span
            key={i}
            initial={reducirMovimiento ? false : { opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: c.rotate, x: c.x }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            className={`absolute left-1/2 top-0 h-24 w-16 -translate-x-1/2 rounded-xl ${c.color} opacity-90 shadow-lg shadow-black/40`}
          />
        ))}
      </div>

      <div>
        <h1 className="font-display text-6xl font-bold text-slate-100">404</h1>
        <p className="mt-2 max-w-sm text-slate-400">
          Esta pagina no esta en el mazo. Puede que el enlace este mal escrito o la sala ya no exista.
        </p>
      </div>

      <Button size="lg" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </PageShell>
  );
}
