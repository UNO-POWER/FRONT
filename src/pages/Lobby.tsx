import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatPanel } from "@/features/chat/ChatPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { iniciarPartida, obtenerSala } from "@/services/api";
import { conectarSala, type ConexionSala } from "@/services/socket";
import type { SalaResponse } from "@/types/api";
import type { MensajeChat } from "@/types/game";
import { cn } from "@/utils/cn";

const SLOTS_VISIBLES = 10;

export default function Lobby() {
  const { codigo = "" } = useParams();
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const { toast } = useToast();
  const { copiado, copiar } = useCopyToClipboard();
  const reducirMovimiento = useReducedMotion();

  const [sala, setSala] = useState<SalaResponse | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [iniciando, setIniciando] = useState(false);
  const conexionRef = useRef<ConexionSala | null>(null);

  useEffect(() => {
    let activo = true;
    obtenerSala(codigo)
      .then((s) => activo && setSala(s))
      .catch((e) => {
        toast(e instanceof Error ? e.message : "Sala no encontrada.", "error");
        navigate("/");
      });

    const conexion = conectarSala(codigo, {
      onRoster: setSala,
      onChat: (m) => setMensajes((prev) => [...prev, m]),
      // Si la partida ya arranco (p. ej. entramos tarde), saltamos directo al tablero.
      onEstadoPartida: () => navigate(`/partida/${codigo}`),
    });
    conexionRef.current = conexion;
    return () => {
      activo = false;
      conexion.desconectar();
    };
  }, [codigo, navigate, toast]);

  async function handleIniciar() {
    setIniciando(true);
    try {
      await iniciarPartida(codigo);
      navigate(`/partida/${codigo}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo iniciar la partida.", "error");
      setIniciando(false);
    }
  }

  const jugadores = sala?.jugadores ?? [];
  const esAnfitrion = !!sesion && sala?.anfitrionUserId === sesion.userId;
  const puedeIniciar = jugadores.length >= 2;

  return (
    <PageShell className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Salir
        </Link>
        <Badge variant="brand">Sala de espera</Badge>
      </header>

      <section className="mt-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Codigo de sala</p>
        <button
          onClick={() => void copiar(codigo).then((ok) => ok && toast("Codigo copiado", "success"))}
          aria-label={`Copiar codigo de sala ${codigo}`}
          className="group mt-2 inline-flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-6 py-3 transition-colors hover:border-indigo-400/40"
        >
          <span className="font-display text-3xl font-bold tracking-[0.35em] text-slate-100 sm:text-4xl">
            {codigo}
          </span>
          <span
            className={cn(
              "rounded-lg px-2 py-1 text-xs font-semibold transition-colors",
              copiado ? "bg-emerald-500/15 text-emerald-300" : "bg-white/8 text-slate-400 group-hover:text-slate-200",
            )}
          >
            {copiado ? "✓ Copiado" : "Copiar"}
          </span>
        </button>
        <p className="mt-2 text-sm text-slate-400">Compartelo para invitar a tus amigos.</p>
      </section>

      <section aria-label="Jugadores en la sala" className="mt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatePresence initial={false}>
            {jugadores.map((j) => (
              <motion.div
                key={j.userId}
                layout={!reducirMovimiento}
                initial={reducirMovimiento ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface-raised px-3 py-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-display text-lg font-bold text-white"
                >
                  {j.username.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-full truncate text-sm font-medium text-slate-200">{j.username}</span>
                {j.esAnfitrion && <Badge variant="warning">👑 Anfitrion</Badge>}
              </motion.div>
            ))}
          </AnimatePresence>

          {Array.from({ length: Math.max(0, Math.min(SLOTS_VISIBLES, sala?.maxJugadores ?? SLOTS_VISIBLES) - jugadores.length) }).map(
            (_, i) => (
              <div
                key={`vacio-${i}`}
                aria-hidden="true"
                className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-slate-600"
              >
                <span className="h-11 w-11 rounded-full border border-dashed border-white/15" />
                <span className="text-xs">Esperando…</span>
              </div>
            ),
          )}
        </div>
        <p className="mt-3 text-center text-sm text-slate-500">
          {jugadores.length} / {sala?.maxJugadores ?? 10} jugadores
        </p>
      </section>

      <section className="mt-6 flex flex-col items-center gap-2">
        {esAnfitrion ? (
          <>
            <Button size="lg" loading={iniciando} disabled={!puedeIniciar} onClick={handleIniciar}>
              Iniciar partida
            </Button>
            {!puedeIniciar && (
              <p className="text-xs text-slate-500">Necesitas al menos 2 jugadores para iniciar.</p>
            )}
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Esperando a que el anfitrion inicie la partida…
          </p>
        )}
      </section>

      <ChatPanel
        mensajes={mensajes}
        miUserId={sesion?.userId ?? null}
        onEnviar={(t) => conexionRef.current?.enviarChat(t)}
        className="mx-auto mt-8 h-64 w-full max-w-lg"
      />
    </PageShell>
  );
}
