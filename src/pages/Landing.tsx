import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { crearSala, unirseASala } from "@/services/api";

const CODIGO_VALIDO = /^[A-Z2-9]{6}$/;

export default function Landing() {
  const { sesion, entrarComoInvitado, cerrarSesion } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const reducirMovimiento = useReducedMotion();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [salaPublica, setSalaPublica] = useState(false);
  const [accionEnCurso, setAccionEnCurso] = useState<"crear" | "unirse" | null>(null);
  const [errorNombre, setErrorNombre] = useState<string>();

  async function asegurarSesion(): Promise<boolean> {
    if (sesion) return true;
    const limpio = nombre.trim();
    if (limpio.length < 2) {
      setErrorNombre("Ingresa tu nombre (minimo 2 caracteres) para jugar.");
      return false;
    }
    await entrarComoInvitado(limpio);
    return true;
  }

  async function handleCrear() {
    setErrorNombre(undefined);
    setAccionEnCurso("crear");
    try {
      if (!(await asegurarSesion())) return;
      const sala = await crearSala(salaPublica);
      navigate(`/sala/${sala.codigo}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo crear la sala.", "error");
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function handleUnirse(e: FormEvent) {
    e.preventDefault();
    setErrorNombre(undefined);
    setAccionEnCurso("unirse");
    try {
      if (!(await asegurarSesion())) return;
      const sala = await unirseASala(codigo.trim().toUpperCase());
      navigate(`/sala/${sala.codigo}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo entrar a la sala.", "error");
    } finally {
      setAccionEnCurso(null);
    }
  }

  const stagger = (i: number) =>
    reducirMovimiento
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay: i * 0.07, ease: "easeOut" as const },
        };

  return (
    <PageShell>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-display text-sm font-bold tracking-[0.25em] text-slate-300">
          UNO<span className="text-indigo-400"> POWER-UPS</span>
        </span>
        {sesion ? (
          <div className="flex items-center gap-1">
            {!sesion.esInvitado && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/stats")}>
                Mis estadisticas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={cerrarSesion}>
              Cerrar sesion
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            Iniciar sesion
          </Button>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-10 sm:pt-16">
        <motion.h1
          {...stagger(0)}
          className="text-center font-display text-5xl font-bold tracking-tight sm:text-6xl"
        >
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            UNO
          </span>{" "}
          <span className="text-slate-100">Power-Ups Arena</span>
        </motion.h1>

        <motion.p {...stagger(1)} className="mt-4 max-w-md text-center text-slate-400">
          UNO multijugador en tiempo real con power-ups dinamicos.
          <br className="hidden sm:block" /> Sin descargas. Sin registro obligatorio.
        </motion.p>

        <motion.div {...stagger(2)} className="mt-10 w-full max-w-sm">
          <Card variant="glass" className="flex flex-col gap-5 p-6 shadow-2xl shadow-black/30">
            {sesion ? (
              <p className="text-center text-sm text-slate-300">
                Jugando como <span className="font-semibold text-amber-300">{sesion.username}</span>
                {sesion.esInvitado && <span className="text-slate-500"> (invitado)</span>}
              </p>
            ) : (
              <Input
                label="Tu nombre"
                placeholder="Como te veran en la sala"
                value={nombre}
                maxLength={40}
                autoComplete="nickname"
                error={errorNombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            )}

            <div className="flex flex-col gap-2.5">
              <Button
                size="lg"
                loading={accionEnCurso === "crear"}
                disabled={accionEnCurso === "unirse"}
                onClick={handleCrear}
              >
                Crear sala
              </Button>
              <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={salaPublica}
                  onChange={(e) => setSalaPublica(e.target.checked)}
                  className="h-3.5 w-3.5 accent-indigo-500"
                />
                Sala publica: visible para cualquiera en el matchmaking
              </label>
            </div>

            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600">
              <span className="h-px flex-1 bg-line" />
              o
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={handleUnirse} className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Codigo de sala"
                  placeholder="ABC123"
                  value={codigo}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="font-display uppercase tracking-[0.3em]"
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                loading={accionEnCurso === "unirse"}
                disabled={!CODIGO_VALIDO.test(codigo) || accionEnCurso === "crear"}
              >
                Unirse
              </Button>
            </form>

            <Link
              to="/salas"
              className="text-center text-sm text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
            >
              Explorar salas publicas →
            </Link>
          </Card>
        </motion.div>

        <motion.div {...stagger(3)} className="mt-8 flex flex-wrap justify-center gap-2">
          <Badge>⚡ Tiempo real</Badge>
          <Badge variant="brand">✨ Power-ups</Badge>
          <Badge>👥 2–10 jugadores</Badge>
        </motion.div>

        {!sesion && (
          <motion.p {...stagger(4)} className="mt-6 text-center text-xs text-slate-500">
            ¿Quieres guardar tus estadisticas?{" "}
            <Link to="/auth" className="text-indigo-400 hover:underline">
              Crea una cuenta
            </Link>
          </motion.p>
        )}
      </main>
    </PageShell>
  );
}
