// Espejo de los DTOs REST del backend (UserService / LobbyService via Gateway).

export interface AuthResponse {
  id: string;
  username: string;
  token: string;
}

export interface MiembroResponse {
  userId: string;
  username: string;
  esAnfitrion: boolean;
}

export type EstadoSala = "LOBBY" | "EN_JUEGO" | "FINALIZADA";

export interface SalaResponse {
  codigo: string;
  anfitrionUserId: string;
  publica: boolean;
  maxJugadores: number;
  estado: EstadoSala;
  jugadores: MiembroResponse[];
}

export interface EstadisticasResponse {
  username: string;
  partidasJugadas: number;
  partidasGanadas: number;
  rachaActual: number;
}

// HU-09: matchmaking publico
export interface SalaPublicaResponse {
  codigo: string;
  anfitrionUsername: string;
  jugadores: number;
  maxJugadores: number;
}

export interface ListaSalasPublicasResponse {
  salas: SalaPublicaResponse[];
  pagina: number;
  totalPaginas: number;
  totalSalas: number;
}
