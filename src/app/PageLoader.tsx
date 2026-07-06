import { PageShell } from "@/components/layout/PageShell";
import { Spinner } from "@/components/ui/Spinner";

/** Fallback de Suspense para el code splitting por ruta. */
export function PageLoader() {
  return (
    <PageShell className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <span className="font-display text-xl font-bold tracking-widest text-slate-500">UNO</span>
      <Spinner size="lg" />
    </PageShell>
  );
}
