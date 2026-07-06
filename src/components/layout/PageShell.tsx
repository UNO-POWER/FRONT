import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Fondo de marca: superficie oscura + glow radial indigo/violeta contenido.
 * Todas las paginas viven dentro de este shell para consistencia visual.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -right-40 h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[120px]"
      />
      <div className={cn("relative", className)}>{children}</div>
    </div>
  );
}
