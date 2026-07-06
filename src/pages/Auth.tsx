import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

type Modo = "login" | "registro";

const TABS: { id: Modo; label: string }[] = [
  { id: "login", label: "Iniciar sesion" },
  { id: "registro", label: "Crear cuenta" },
];

export default function Auth() {
  const { iniciarSesion, registrarse } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [modo, setModo] = useState<Modo>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setCargando(true);
    try {
      if (modo === "login") {
        await iniciarSesion(username.trim(), password);
      } else {
        await registrarse(username.trim(), password);
        toast("Cuenta creada. ¡A jugar!", "success");
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la operacion.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <PageShell className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <Link
        to="/"
        className="mb-8 font-display text-sm font-bold tracking-[0.25em] text-slate-300 hover:text-white"
      >
        UNO<span className="text-indigo-400"> POWER-UPS</span>
      </Link>

      <Card variant="glass" className="w-full max-w-sm p-6 shadow-2xl shadow-black/30">
        {/* Tabs con indicador compartido (layoutId) */}
        <div role="tablist" aria-label="Modo de acceso" className="mb-6 flex gap-1 rounded-xl bg-black/25 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={modo === tab.id}
              onClick={() => {
                setModo(tab.id);
                setError(undefined);
              }}
              className="relative flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white aria-selected:text-white"
            >
              {modo === tab.id && (
                <motion.span
                  layoutId="tab-activa"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/80 to-violet-500/80"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        <p className="mb-5 text-sm text-slate-400">
          {modo === "login"
            ? "Retoma tu racha donde la dejaste."
            : "Tus partidas, victorias y racha quedan guardadas entre sesiones."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={40}
            required
            autoComplete="username"
            hint={modo === "registro" ? "Entre 3 y 40 caracteres." : undefined}
          />
          <div className="relative">
            <Input
              label="Contrasena"
              type={verPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              maxLength={100}
              required
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              hint={modo === "registro" ? "Minimo 6 caracteres." : undefined}
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              className="absolute right-3 top-[34px] rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              {verPassword ? "Ocultar" : "Ver"}
            </button>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={cargando}>
            {modo === "login" ? "Entrar" : "Registrarme"}
          </Button>
        </form>
      </Card>

      <Link to="/" className="mt-6 text-sm text-slate-400 hover:text-slate-200">
        ← Seguir como invitado
      </Link>
    </PageShell>
  );
}
