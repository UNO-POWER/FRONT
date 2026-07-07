import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { listarSalasPublicas, unirseASala } from "@/services/api";
import type { SalaPublicaResponse } from "@/types/api";

const REFRESCO_MS = 7000;

/** HU-09: matchmaking publico — ver y unirse a salas abiertas con cupo. */
export default function SalasPublicas() {
  const { sesion, entrarComoInvitado } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const reducirMovimiento = useReducedMotion();

  const [salas, setSalas] = useState<SalaPublicaResponse[] | null>(null);
  const [nombre, setNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState<string>();
  const [uniendoseA, setUniendoseA] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await listarSalasPublicas();
      setSalas(r.salas);
    } catch {
      // Silencioso en refrescos: el estado anterior sigue siendo util.
      setSalas((prev) => prev ?? []);
    }
  }, []);

  // HU-09 requiere sesion (el gateway exige JWT): el invitado se crea al vuelo al unirse,
  // pero para LISTAR tambien hace falta token, asi que sin sesion mostramos el paso de nombre.
  useEffect(() => {
    if (!sesion) return;
    void cargar();
    const timer = setInterval(() => void cargar(), REFRESCO_MS);
    return () => clearInterval(timer);
  }, [sesion, cargar]);

  async function handleEntrarConNombre() {
    const limpio = nombre.trim();
    if (limpio.length < 2) {
      setErrorNombre("Ingresa tu nombre (minimo 2 caracteres).");
      return;
    }
    try {
      await entrarComoInvitado(limpio);
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo iniciar la sesion.", "error");
    }
  }

  async function handleUnirse(codigo: string) {
    setUniendoseA(codigo);
    try {
      const sala = await unirseASala(codigo);
      navigate(`/sala/${sala.codigo}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo entrar a la sala.", "error");
      setUniendoseA(null);
      void cargar(); // la sala pudo llenarse o iniciar mientras tanto
    }
  }

  return (
    <PageShell className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver
        </Link>
        <Badge variant="brand">Salas publicas</Badge>
      </header>

      <main className="mt-8 flex flex-1 flex-col">
        <h1 className="text-center font-display text-3xl font-bold text-slate-100">
          Unete a una partida abierta
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Salas creadas como publicas, con cupo disponible. Se actualiza solo.
        </p>

        {!sesion ? (
          <Card variant="glass" className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-4 p-6">
            <Input
              label="Tu nombre"
              placeholder="Como te veran en la sala"
              value={nombre}
              maxLength={40}
              autoComplete="nickname"
              error={errorNombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Button onClick={() => void handleEntrarConNombre()}>Continuar</Button>
          </Card>
        ) : salas === null ? (
          <div className="mt-8 flex flex-col gap-3" aria-label="Cargando salas">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : salas.length === 0 ? (
          <EmptyState
            icono="🃏"
            titulo="No hay salas publicas ahora"
            descripcion="Crea una sala publica desde el inicio y aparecera aqui para que cualquiera se una."
            accion={
              <Button variant="secondary" onClick={() => navigate("/")}>
                Crear una sala
              </Button>
            }
          />
        ) : (
          <ul className="mt-8 flex flex-col gap-3" aria-label="Salas publicas disponibles">
            <AnimatePresence initial={false}>
              {salas.map((sala) => (
                <motion.li
                  key={sala.codigo}
                  layout={!reducirMovimiento}
                  initial={reducirMovimiento ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold tracking-[0.2em] text-slate-100">
                        {sala.codigo}
                      </p>
                      <p className="truncate text-sm text-slate-400">
                        Anfitrion: <span className="text-slate-300">{sala.anfitrionUsername}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge>
                        👥 {sala.jugadores}/{sala.maxJugadores}
                      </Badge>
                      <Button
                        size="sm"
                        loading={uniendoseA === sala.codigo}
                        disabled={uniendoseA !== null && uniendoseA !== sala.codigo}
                        onClick={() => void handleUnirse(sala.codigo)}
                      >
                        Unirse
                      </Button>
                    </div>
                  </Card>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>
    </PageShell>
  );
}
