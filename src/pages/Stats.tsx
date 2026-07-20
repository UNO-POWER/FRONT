import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCountUp } from "@/hooks/useCountUp";
import { obtenerEstadisticas } from "@/services/api";
import type { EstadisticasResponse } from "@/types/api";

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  const animado = useCountUp(valor);
  return (
    <Card className="flex flex-col items-center gap-1 px-4 py-6">
      <span className="font-display text-4xl font-bold text-slate-100">{animado}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{etiqueta}</span>
    </Card>
  );
}

function WinrateRing({ jugadas, ganadas }: { jugadas: number; ganadas: number }) {
  const reducirMovimiento = useReducedMotion();
  const porcentaje = jugadas > 0 ? Math.round((ganadas / jugadas) * 100) : 0;
  const radio = 52;
  const circunferencia = 2 * Math.PI * radio;

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label={`Porcentaje de victorias: ${porcentaje}%`}>
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
        <circle cx="70" cy="70" r={radio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="70"
          cy="70"
          r={radio}
          fill="none"
          stroke="url(#grad-winrate)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          initial={{ strokeDashoffset: circunferencia }}
          animate={{ strokeDashoffset: circunferencia * (1 - porcentaje / 100) }}
          transition={reducirMovimiento ? { duration: 0 } : { duration: 1, ease: "easeOut", delay: 0.2 }}
          transform="rotate(-90 70 70)"
        />
        <defs>
          <linearGradient id="grad-winrate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-3xl font-bold text-slate-100">{porcentaje}%</p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500">victorias</p>
      </div>
    </div>
  );
}

export default function Stats() {
  const { sesion } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EstadisticasResponse | null>(null);
  const [error, setError] = useState<string>();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstadisticas()
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "No se pudieron cargar las estadisticas."))
      .finally(() => setCargando(false));
  }, []);

  const esInvitadoSinStats = !sesion || sesion.esInvitado;

  return (
    <PageShell className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 py-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver
        </Link>
        {sesion && (
          <span className="flex items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-display text-xs font-bold text-white">
                {sesion.username.charAt(0).toUpperCase()}
              </span>
              {sesion.username}
            </span>
            <Link to="/config" aria-label="Configuracion del perfil" className="text-slate-400 hover:text-slate-200">
              ⚙️
            </Link>
          </span>
        )}
      </header>

      <main className="flex flex-1 flex-col justify-center py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-slate-100">Mis estadisticas</h1>

        {cargando && (
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {!cargando && (error || esInvitadoSinStats) && !stats && (
          <EmptyState
            icono="📊"
            titulo="Sin estadisticas todavia"
            descripcion={
              esInvitadoSinStats
                ? "Estas jugando como invitado: tus partidas no se guardan. Crea una cuenta para llevar tu historial y tu racha."
                : (error ?? "")
            }
            accion={
              esInvitadoSinStats ? (
                <Button onClick={() => navigate("/auth")}>Crear cuenta</Button>
              ) : (
                <Button variant="secondary" onClick={() => navigate("/")}>
                  Volver al inicio
                </Button>
              )
            }
          />
        )}

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-8"
          >
            <WinrateRing jugadas={stats.partidasJugadas} ganadas={stats.partidasGanadas} />
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard etiqueta="Jugadas" valor={stats.partidasJugadas} />
              <StatCard etiqueta="Ganadas" valor={stats.partidasGanadas} />
              <StatCard etiqueta="Racha actual" valor={stats.rachaActual} />
            </div>
            <Button size="lg" onClick={() => navigate("/")}>
              Jugar una partida
            </Button>
          </motion.div>
        )}
      </main>
    </PageShell>
  );
}
