import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * Configuracion del perfil: cambiar el nombre de usuario (solo cuentas registradas —
 * el invitado no esta persistido). El backend re-emite el JWT con el claim nuevo y
 * la sesion local lo adopta de inmediato.
 */
export default function Config() {
  const { sesion, actualizarUsername, cerrarSesion } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [nuevoUsername, setNuevoUsername] = useState(sesion?.username ?? "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>();

  if (!sesion || sesion.esInvitado) {
    return (
      <PageShell className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 py-6">
        <header>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
            ← Volver
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <EmptyState
            icono="⚙️"
            titulo="Configuracion solo para cuentas"
            descripcion="Estas jugando como invitado: tu nombre es temporal y no hay perfil que editar. Crea una cuenta para personalizarlo."
            accion={<Button onClick={() => navigate("/auth")}>Crear cuenta</Button>}
          />
        </main>
      </PageShell>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const limpio = nuevoUsername.trim();
    if (limpio === sesion?.username) {
      setError("Ese ya es tu nombre de usuario actual.");
      return;
    }
    setError(undefined);
    setCargando(true);
    try {
      await actualizarUsername(limpio);
      toast("Nombre de usuario actualizado.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <PageShell className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 py-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          ← Volver
        </Link>
        <span className="flex items-center gap-2 text-sm text-slate-300">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-display text-xs font-bold text-white">
            {sesion.username.charAt(0).toUpperCase()}
          </span>
          {sesion.username}
        </span>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-bold text-slate-100">Configuracion</h1>

        <Card variant="glass" className="mx-auto w-full max-w-sm p-6 shadow-2xl shadow-black/30">
          <h2 className="mb-1 font-display text-lg font-bold text-slate-100">Nombre de usuario</h2>
          <p className="mb-5 text-sm text-slate-400">
            Es el nombre que ven los demas jugadores en salas, partidas y chat.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nuevo nombre de usuario"
              value={nuevoUsername}
              onChange={(e) => setNuevoUsername(e.target.value)}
              minLength={3}
              maxLength={40}
              required
              autoComplete="username"
              hint="Entre 3 y 40 caracteres. Debe estar libre."
            />

            {error && (
              <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" loading={cargando}>
              Guardar cambios
            </Button>
          </form>
        </Card>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              cerrarSesion();
              navigate("/");
            }}
            className="text-sm text-slate-500 hover:text-rose-300"
          >
            Cerrar sesion
          </button>
        </div>
      </main>
    </PageShell>
  );
}
