import type { PowerUpTipo } from "@/types/game";

export const NOMBRE_POWERUP: Record<PowerUpTipo, string> = {
  ROBO_FORZADO: "Robo forzado",
  ESPIA: "Espia",
  SALTO_SELECTIVO: "Salto selectivo",
  DUPLICADOR: "Duplicador",
  ESCUDO: "Escudo",
};

export const DESCRIPCION_POWERUP: Record<PowerUpTipo, string> = {
  ROBO_FORZADO: "Obliga a un rival a robar 2 cartas",
  ESPIA: "Mira la mano de un rival",
  SALTO_SELECTIVO: "Salta el proximo turno de un rival",
  DUPLICADOR: "Tu proximo +2/+4 vale doble",
  ESCUDO: "Bloquea el proximo ataque que recibas",
};

export const ICONO_POWERUP: Record<PowerUpTipo, string> = {
  ROBO_FORZADO: "🫳",
  ESPIA: "👁️",
  SALTO_SELECTIVO: "⏭️",
  DUPLICADOR: "✖️2",
  ESCUDO: "🛡️",
};

/** Power-ups que requieren elegir un rival como objetivo. */
export const REQUIERE_OBJETIVO: ReadonlySet<PowerUpTipo> = new Set([
  "ROBO_FORZADO",
  "ESPIA",
  "SALTO_SELECTIVO",
]);
