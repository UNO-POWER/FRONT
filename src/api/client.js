const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "uno_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
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

export { API_URL };
