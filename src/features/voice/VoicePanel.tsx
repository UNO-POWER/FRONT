import { AnimatePresence, motion } from "framer-motion";
import type { ParticipanteVoz } from "./webrtc";
import { cn } from "@/utils/cn";

export interface VoicePanelProps {
  activa: boolean;
  micAbierto: boolean;
  participantes: ParticipanteVoz[];
  onActivar: () => void;
  onDesactivar: () => void;
  onAlternarMic: () => void;
  onSilenciar: (userId: string, silenciado: boolean) => void;
}

/**
 * Barra de voz de la sala (WebRTC P2P). Compacta: toggle de canal, toggle de microfono
 * y chips de quienes estan en voz con indicador de "hablando" y silencio local.
 */
export function VoicePanel({
  activa,
  micAbierto,
  participantes,
  onActivar,
  onDesactivar,
  onAlternarMic,
  onSilenciar,
}: VoicePanelProps) {
  return (
    <section
      aria-label="Chat de voz"
      className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-line bg-surface-raised/40 px-3 py-2"
    >
      {!activa ? (
        <button
          type="button"
          onClick={onActivar}
          className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25"
        >
          🎙️ Activar voz
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onAlternarMic}
            aria-pressed={!micAbierto}
            aria-label={micAbierto ? "Silenciar mi microfono" : "Reactivar mi microfono"}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              micAbierto
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                : "border-amber-400/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25",
            )}
          >
            {micAbierto ? "🎙️ Mic abierto" : "🔇 Mic cerrado"}
          </button>
          <button
            type="button"
            onClick={onDesactivar}
            className="flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/25"
          >
            Salir de voz
          </button>

          <AnimatePresence initial={false}>
            {participantes.map((p) => (
              <motion.button
                key={p.userId}
                type="button"
                onClick={() => onSilenciar(p.userId, !p.silenciado)}
                title={p.silenciado ? `Volver a escuchar a ${p.username}` : `Silenciar a ${p.username} (solo para ti)`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  p.hablando
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/50"
                    : "border-line bg-surface-raised text-slate-300",
                  p.silenciado && "opacity-50",
                )}
              >
                <span aria-hidden="true">{p.silenciado ? "🔇" : p.hablando ? "🗣️" : "👤"}</span>
                <span className="max-w-24 truncate">{p.username}</span>
              </motion.button>
            ))}
          </AnimatePresence>
          {participantes.length === 0 && (
            <span className="text-xs text-slate-500">Nadie mas en voz todavia</span>
          )}
        </>
      )}
    </section>
  );
}
