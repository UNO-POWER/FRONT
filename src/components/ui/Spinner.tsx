import { cn } from "@/utils/cn";

const TAMANOS = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" } as const;

export function Spinner({ size = "md", className }: { size?: keyof typeof TAMANOS; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex", className)}>
      <span
        className={cn(
          "animate-spin rounded-full border-slate-500/30 border-t-indigo-400",
          TAMANOS[size],
        )}
      />
      <span className="sr-only">Cargando…</span>
    </span>
  );
}
