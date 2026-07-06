import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  variant: ToastVariant;
  mensaje: string;
}

interface ToastContextValue {
  toast: (mensaje: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONO: Record<ToastVariant, string> = { success: "✓", error: "✕", info: "i" };

const ESTILO: Record<ToastVariant, string> = {
  success: "border-emerald-400/30 [&>span]:bg-emerald-400/15 [&>span]:text-emerald-300",
  error: "border-rose-500/30 [&>span]:bg-rose-500/15 [&>span]:text-rose-300",
  info: "border-sky-400/30 [&>span]:bg-sky-400/15 [&>span]:text-sky-300",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(1);

  const toast = useCallback((mensaje: string, variant: ToastVariant = "info") => {
    const id = siguienteId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, variant, mensaje }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Region viva para lectores de pantalla (WCAG 4.1.3) */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-surface-overlay/95 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-md",
                ESTILO[t.variant],
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {ICONO[t.variant]}
              </span>
              <p className="text-sm text-slate-100">{t.mensaje}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
