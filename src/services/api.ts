import type { AuthResponse, EstadisticasResponse, SalaResponse } from "@/types/api";
import { obtenerToken } from "./token";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = obtenerToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Solo el mensaje que el backend decide exponer; nunca detalles internos.
    const payload = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(payload?.error ?? "Algo salio mal. Intenta de nuevo.", res.status);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ── Auth (HU-06 / EC-07) ────────────────────────────────────────────────────
export const entrarComoInvitado = (nombre: string) =>
  request<AuthResponse>("/api/usuarios/guest", { method: "POST", body: { nombre }, auth: false });

export const registrarUsuario = (username: string, password: string) =>
  request<AuthResponse>("/api/usuarios/registro", { method: "POST", body: { username, password }, auth: false });

export const iniciarSesion = (username: string, password: string) =>
  request<AuthResponse>("/api/usuarios/login", { method: "POST", body: { username, password }, auth: false });

// ── Salas (HU-01/HU-02/HU-03) ───────────────────────────────────────────────
export const crearSala = (publica = false) =>
  request<SalaResponse>("/api/salas", { method: "POST", body: { publica } });

export const unirseASala = (codigo: string) =>
  request<SalaResponse>(`/api/salas/${codigo}/unirse`, { method: "POST" });

export const obtenerSala = (codigo: string) => request<SalaResponse>(`/api/salas/${codigo}`);

export const iniciarPartida = (codigo: string) =>
  request<SalaResponse>(`/api/salas/${codigo}/iniciar`, { method: "POST" });

// ── Estadisticas (HU-07) ────────────────────────────────────────────────────
export const obtenerEstadisticas = () => request<EstadisticasResponse>("/api/usuarios/me/stats");
