import type { ReactNode } from "react";

export interface EmptyStateProps {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export function EmptyState({ icono, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-raised text-2xl">
        {icono}
      </div>
      <div>
        <p className="font-display font-semibold text-slate-200">{titulo}</p>
        <p className="mt-1 max-w-xs text-sm text-slate-400">{descripcion}</p>
      </div>
      {accion}
    </div>
  );
}
