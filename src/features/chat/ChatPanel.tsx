import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";
import type { MensajeChat } from "@/types/game";

export interface ChatPanelProps {
  mensajes: MensajeChat[];
  onEnviar: (texto: string) => void;
  miUserId: string | null;
  className?: string;
}

const MAX_LONGITUD = 300;

/**
 * HU-05: chat de sala. Los mensajes se renderizan siempre como texto plano
 * (React escapa por defecto; jamas dangerouslySetInnerHTML).
 */
export function ChatPanel({ mensajes, onEnviar, miUserId, className }: ChatPanelProps) {
  const [texto, setTexto] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
  }, [mensajes.length]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpio = texto.trim().slice(0, MAX_LONGITUD);
    if (!limpio) return;
    onEnviar(limpio);
    setTexto("");
  }

  return (
    <section
      aria-label="Chat de la sala"
      className={cn(
        "flex flex-col rounded-2xl border border-line bg-surface-raised/80 backdrop-blur-sm",
        className,
      )}
    >
      <header className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Chat de la sala
      </header>

      <div ref={listaRef} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-3">
        {mensajes.length === 0 && (
          <p className="m-auto text-center text-sm text-slate-500">
            Nadie ha dicho nada todavia. Rompe el hielo 👋
          </p>
        )}
        <AnimatePresence initial={false}>
          {mensajes.map((m, i) => {
            const esMio = m.autorUserId === miUserId;
            return (
              <motion.div
                key={`${m.enviadoEn}-${i}`}
                initial={reducirMovimiento ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={cn("max-w-[85%] text-sm", esMio ? "self-end text-right" : "self-start")}
              >
                <span className={cn("mr-1.5 font-semibold", esMio ? "text-indigo-300" : "text-amber-300")}>
                  {esMio ? "Tu" : m.autorUsername}
                </span>
                <span className="break-words text-slate-200">{m.texto}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t border-line p-3">
        <label htmlFor="chat-mensaje" className="sr-only">
          Escribe un mensaje
        </label>
        <input
          id="chat-mensaje"
          value={texto}
          maxLength={MAX_LONGITUD}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-slate-100 placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-400/60"
        />
        <button
          type="submit"
          aria-label="Enviar mensaje"
          disabled={!texto.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          ➤
        </button>
      </form>
    </section>
  );
}
