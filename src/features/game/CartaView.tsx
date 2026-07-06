import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Carta, ColorCarta } from "@/types/game";
import { cn } from "@/utils/cn";

export interface CartaViewProps {
  carta: Carta;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** Resalta la carta como jugable (elevacion + anillo al hover). */
  jugable?: boolean;
}

const FONDO: Record<ColorCarta, string> = {
  ROJO: "bg-gradient-to-br from-carta-rojo to-rose-600 text-white",
  AMARILLO: "bg-gradient-to-br from-carta-amarillo to-amber-500 text-slate-900",
  VERDE: "bg-gradient-to-br from-carta-verde to-emerald-600 text-white",
  AZUL: "bg-gradient-to-br from-carta-azul to-blue-600 text-white",
  COMODIN:
    "bg-slate-900 text-white ring-2 ring-inset ring-transparent [background:linear-gradient(#0f172a,#0f172a)_padding-box,conic-gradient(#F43F5E,#F59E0B,#10B981,#3B82F6,#F43F5E)_border-box] border-2 border-transparent",
};

/** Forma por color: el color nunca es el unico canal (WCAG 1.4.1). */
const FORMA: Record<ColorCarta, string> = {
  ROJO: "●",
  AMARILLO: "■",
  VERDE: "▲",
  AZUL: "◆",
  COMODIN: "★",
};

const SIMBOLO: Record<string, string> = {
  SALTAR: "⦸",
  REVERSA: "⇄",
  MAS_DOS: "+2",
  COMODIN: "★",
  COMODIN_MAS_CUATRO: "+4",
};

const NOMBRE_TIPO: Record<string, string> = {
  SALTAR: "saltar",
  REVERSA: "reversa",
  MAS_DOS: "mas dos",
  COMODIN: "comodin",
  COMODIN_MAS_CUATRO: "comodin mas cuatro",
};

const TAMANOS = {
  sm: "h-14 w-10 rounded-lg text-base",
  md: "h-24 w-16 rounded-xl text-2xl",
  lg: "h-28 w-20 rounded-xl text-3xl",
} as const;

export function etiquetaCarta(carta: Carta): string {
  const tipo = carta.tipo === "NUMERO" ? String(carta.valor) : (NOMBRE_TIPO[carta.tipo] ?? carta.tipo);
  return carta.color === "COMODIN" ? tipo : `${tipo} ${carta.color.toLowerCase()}`;
}

export const CartaView = memo(function CartaView({ carta, onClick, disabled, size = "md", jugable }: CartaViewProps) {
  const reducirMovimiento = useReducedMotion();
  const contenido = carta.tipo === "NUMERO" ? carta.valor : SIMBOLO[carta.tipo];
  const interactiva = !!onClick;

  const clases = cn(
    "relative flex shrink-0 select-none items-center justify-center font-display font-bold shadow-lg shadow-black/30",
    TAMANOS[size],
    FONDO[carta.color],
    interactiva && !disabled && "cursor-pointer",
    disabled && "opacity-45",
  );

  const forma = (
    <span aria-hidden="true" className="absolute left-1 top-0.5 text-[0.55rem] opacity-70">
      {FORMA[carta.color]}
    </span>
  );

  if (!interactiva) {
    return (
      <div className={clases} aria-label={`Carta ${etiquetaCarta(carta)}`} role="img">
        {forma}
        {contenido}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Jugar ${etiquetaCarta(carta)}`}
      whileHover={reducirMovimiento || disabled ? undefined : { y: -10, scale: 1.05 }}
      whileTap={reducirMovimiento || disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={cn(clases, jugable && !disabled && "hover:ring-2 hover:ring-white/70")}
    >
      {forma}
      {contenido}
    </motion.button>
  );
});
