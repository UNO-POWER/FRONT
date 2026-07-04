const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "uno_token";
const GUEST_KEY = "uno_is_guest";
const USERNAME_KEY = "uno_username";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setSesion({ token, username, esInvitado }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(GUEST_KEY, esInvitado ? "1" : "0");
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(GUEST_KEY);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function esInvitado() {
  return localStorage.getItem(GUEST_KEY) !== "0";
}

export function haySesion() {
  return !!getToken();
}

/** Decodifica el payload del JWT solo para uso de UI (el servidor es quien valida de verdad). */
export function getUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).sub;
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// HU-01/EC-07: entrar como invitado sin registro previo
export function entrarComoInvitado(nombre) {
  return request("/api/usuarios/guest", { method: "POST", body: { nombre }, auth: false });
}

export function registrarUsuario(username, password) {
  return request("/api/usuarios/registro", { method: "POST", body: { username, password }, auth: false });
}

export function iniciarSesion(username, password) {
  return request("/api/usuarios/login", { method: "POST", body: { username, password }, auth: false });
}

// HU-01: crear sala privada
export function crearSala(publica = false) {
  return request("/api/salas", { method: "POST", body: { publica } });
}

// HU-02: unirse a sala con codigo de 6 caracteres
export function unirseASala(codigo) {
  return request(`/api/salas/${codigo}/unirse`, { method: "POST" });
}

export function obtenerSala(codigo) {
  return request(`/api/salas/${codigo}`, { method: "GET" });
}

// HU-03: el anfitrion inicia la partida
export function iniciarPartida(codigo) {
  return request(`/api/salas/${codigo}/iniciar`, { method: "POST" });
}

// HU-07: estadisticas personales (solo cuentas registradas, no invitados)
export function obtenerEstadisticas() {
  return request("/api/usuarios/me/stats", { method: "GET" });
}

export { API_URL };
