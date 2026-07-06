/**
 * Almacenamiento del JWT (ver DESIGN.md §9).
 *
 * El token vive en memoria de modulo con espejo en sessionStorage: aislado por
 * pestana y eliminado al cerrarla, lo que reduce la ventana de exposicion frente
 * a localStorage. La solucion definitiva (cookie HttpOnly + SameSite=Strict
 * emitida por el API Gateway) requiere cambio de backend y queda documentada
 * como pendiente; este modulo es el unico punto a tocar cuando llegue.
 */

const STORAGE_KEY = "uno.session";

export interface Sesion {
  token: string;
  userId: string;
  username: string;
  esInvitado: boolean;
}

let sesionActual: Sesion | null = leerDeSessionStorage();

function leerDeSessionStorage(): Sesion | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Sesion) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  sesionActual = sesion;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
  } catch {
    // sessionStorage no disponible (modo privado extremo): la sesion sigue en memoria.
  }
}

export function limpiarSesion(): void {
  sesionActual = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}

export function obtenerSesion(): Sesion | null {
  return sesionActual;
}

export function obtenerToken(): string | null {
  return sesionActual?.token ?? null;
}
