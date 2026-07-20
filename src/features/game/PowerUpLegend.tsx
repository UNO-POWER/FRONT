import { DESCRIPCION_POWERUP, ICONO_POWERUP, NOMBRE_POWERUP, REQUIERE_OBJETIVO } from "./powerups";
import type { PowerUpTipo } from "@/types/game";
import { cn } from "@/utils/cn";

const TIPOS: PowerUpTipo[] = ["ROBO_FORZADO", "ESPIA", "SALTO_SELECTIVO", "DUPLICADOR", "ESCUDO"];

export interface PowerUpLegendProps {
  /** true = columna unica (sidebar bajo el chat); false = rejilla para ancho completo (mobile). */
  compacta?: boolean;
}

/**
 * Leyenda de poderes visible sin depender de tooltips (que no existen en tactil).
 * En desktop vive bajo el chat (sidebar); en mobile, bajo la mano.
 */
export function PowerUpLegend({ compacta }: PowerUpLegendProps) {
  return (
    <section
      aria-label="Que hace cada poder"
      className="rounded-2xl border border-line bg-surface-raised/40 px-3 py-2"
    >
      <p className="pb-1.5 text-center text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500">
        Poderes
      </p>
      <ul
        className={cn(
          "grid gap-x-4 gap-y-1.5 text-[0.7rem] leading-snug text-slate-400",
          compacta ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {TIPOS.map((tipo) => (
          <li key={tipo} className="flex items-start gap-1.5">
            <span aria-hidden="true" className="shrink-0">
              {ICONO_POWERUP[tipo]}
            </span>
            <span>
              <span className="font-semibold text-slate-300">{NOMBRE_POWERUP[tipo]}</span>
              {REQUIERE_OBJETIVO.has(tipo) && <span className="text-violet-300/80"> (elige rival)</span>}
              {" — "}
              {DESCRIPCION_POWERUP[tipo]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
