import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar?: () => void;
  children: ReactNode;
  size?: "sm" | "md";
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Dialogo accesible: role=dialog + aria-modal, focus trap, cierre con Escape,
 * devuelve el foco al elemento que lo abrio (WCAG 2.4.3).
 */
export function Modal({ abierto, titulo, onCerrar, children, size = "sm" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const origenFocoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!abierto) return;
    origenFocoRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && onCerrar) {
        e.stopPropagation();
        onCerrar();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      origenFocoRef.current?.focus();
    };
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onCerrar?.();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "w-full rounded-3xl border border-white/10 bg-surface-overlay p-6 shadow-2xl shadow-black/50",
              size === "sm" ? "max-w-sm" : "max-w-lg",
            )}
          >
            <h2 className="mb-4 font-display text-lg font-semibold text-slate-100">{titulo}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
