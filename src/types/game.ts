// Espejo de los DTOs WebSocket del Game Service.

export type ColorCarta = "ROJO" | "AMARILLO" | "VERDE" | "AZUL" | "COMODIN";
export type ColorJugable = Exclude<ColorCarta, "COMODIN">;

export type TipoCarta =
  | "NUMERO"
  | "SALTAR"
  | "REVERSA"
  | "MAS_DOS"
  | "COMODIN"
  | "COMODIN_MAS_CUATRO";

export interface Carta {
  color: ColorCarta;
  tipo: TipoCarta;
  valor: number | null;
}

export type PowerUpTipo =
  | "ROBO_FORZADO"
  | "ESPIA"
  | "SALTO_SELECTIVO"
  | "DUPLICADOR"
  | "ESCUDO";

export interface JugadorPublico {
  userId: string;
  username: string;
  cantidadCartas: number;
  dijoUno: boolean;
  escudoActivo: boolean;
  abandonado: boolean;
}

export interface PowerUpPublico {
  id: string;
  tipo: PowerUpTipo;
}

export interface EstadoPartida {
  codigo: string;
  jugadores: JugadorPublico[];
  turnoActualUserId: string | null;
  cartaSuperior: Carta;
  colorActual: ColorCarta;
  direccion: 1 | -1;
  estado: "EN_CURSO" | "FINALIZADA";
  ganadorUserId: string | null;
  powerUpActivo: PowerUpPublico | null;
}

export interface Mano {
  codigo: string;
  cartas: Carta[];
  powerUpsInventario: PowerUpTipo[];
}

export interface MensajeChat {
  autorUserId: string;
  autorUsername: string;
  texto: string;
  enviadoEn: string;
}

export interface EspiaResultado {
  objetivoUserId: string;
  objetivoUsername: string;
  cartas: Carta[];
}

export interface ErrorJuego {
  mensaje: string;
}
