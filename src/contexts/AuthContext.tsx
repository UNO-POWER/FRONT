import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as api from "@/services/api";
import { guardarSesion, limpiarSesion, obtenerSesion, type Sesion } from "@/services/token";
import type { AuthResponse } from "@/types/api";

interface AuthContextValue {
  sesion: Sesion | null;
  entrarComoInvitado: (nombre: string) => Promise<Sesion>;
  iniciarSesion: (username: string, password: string) => Promise<Sesion>;
  registrarse: (username: string, password: string) => Promise<Sesion>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function aSesion(auth: AuthResponse, esInvitado: boolean): Sesion {
  return { token: auth.token, userId: auth.id, username: auth.username, esInvitado };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => obtenerSesion());

  const adoptar = useCallback((auth: AuthResponse, esInvitado: boolean) => {
    const nueva = aSesion(auth, esInvitado);
    guardarSesion(nueva);
    setSesion(nueva);
    return nueva;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      sesion,
      entrarComoInvitado: async (nombre) => adoptar(await api.entrarComoInvitado(nombre), true),
      iniciarSesion: async (username, password) => adoptar(await api.iniciarSesion(username, password), false),
      registrarse: async (username, password) => adoptar(await api.registrarUsuario(username, password), false),
      cerrarSesion: () => {
        limpiarSesion();
        setSesion(null);
      },
    }),
    [sesion, adoptar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
