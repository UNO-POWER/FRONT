import type { Carta, ColorCarta, TipoCarta } from "@/types/game";

/**
 * Espejo exacto de Carta.esJugableSobre del Game Service. Es SOLO visual (resaltar/atenuar
 * cartas): el servidor re-valida cada jugada y sigue siendo el autoritativo (EC-05).
 */
export function esJugable(carta: Carta, cartaSuperior: Carta, colorActual: ColorCarta): boolean {
  if (carta.tipo === "COMODIN" || carta.tipo === "COMODIN_MAS_CUATRO") return true;
  if (carta.color === colorActual) return true;
  if (carta.tipo !== "NUMERO" && carta.tipo === cartaSuperior.tipo) return true;
  return carta.tipo === "NUMERO" && cartaSuperior.tipo === "NUMERO" && carta.valor === cartaSuperior.valor;
}

const ORDEN_COLOR: Record<ColorCarta, number> = { ROJO: 0, AMARILLO: 1, VERDE: 2, AZUL: 3, COMODIN: 4 };
const ORDEN_TIPO: Record<TipoCarta, number> = {
  NUMERO: 0,
  SALTAR: 1,
  REVERSA: 2,
  MAS_DOS: 3,
  COMODIN: 4,
  COMODIN_MAS_CUATRO: 5,
};

/** Mano agrupada por color y ordenada por valor, para ubicar cartas rapido. No muta la original. */
export function ordenarMano(cartas: Carta[]): Carta[] {
  return [...cartas].sort(
    (a, b) =>
      ORDEN_COLOR[a.color] - ORDEN_COLOR[b.color] ||
      ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] ||
      (a.valor ?? 0) - (b.valor ?? 0),
  );
}
