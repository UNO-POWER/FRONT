import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CartaView } from "./CartaView";
import { NOMBRE_POWERUP } from "./powerups";
import type { ColorJugable, EspiaResultado, JugadorPublico, PowerUpTipo } from "@/types/game";
import { cn } from "@/utils/cn";

// ── Selector de color (comodines) ───────────────────────────────────────────
const COLORES: { id: ColorJugable; nombre: string; clase: string }[] = [
  { id: "ROJO", nombre: "Rojo", clase: "bg-carta-rojo" },
  { id: "AMARILLO", nombre: "Amarillo", clase: "bg-carta-amarillo" },
  { id: "VERDE", nombre: "Verde", clase: "bg-carta-verde" },
  { id: "AZUL", nombre: "Azul", clase: "bg-carta-azul" },
];

export function ColorPickerModal({
  abierto,
  onElegir,
  onCerrar,
}: {
  abierto: boolean;
  onElegir: (color: ColorJugable) => void;
  onCerrar: () => void;
}) {
  return (
    <Modal abierto={abierto} titulo="Elige un color" onCerrar={onCerrar}>
      <div className="grid grid-cols-2 gap-3">
        {COLORES.map((c) => (
          <button
            key={c.id}
            onClick={() => onElegir(c.id)}
            className={cn(
              "flex h-20 items-end justify-start rounded-2xl p-3 font-display font-bold text-white shadow-lg",
              "transition-transform hover:scale-[1.03] active:scale-100",
              c.clase,
              c.id === "AMARILLO" && "text-slate-900",
            )}
          >
            {c.nombre}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ── Selector de objetivo (power-ups dirigidos) ──────────────────────────────
export function TargetPickerModal({
  abierto,
  powerUp,
  rivales,
  onElegir,
  onCerrar,
}: {
  abierto: boolean;
  powerUp: PowerUpTipo | null;
  rivales: JugadorPublico[];
  onElegir: (userId: string) => void;
  onCerrar: () => void;
}) {
  return (
    <Modal
      abierto={abierto}
      titulo={powerUp ? `${NOMBRE_POWERUP[powerUp]}: elige un objetivo` : "Elige un objetivo"}
      onCerrar={onCerrar}
    >
      <div className="flex flex-col gap-2">
        {rivales.map((r) => (
          <Button key={r.userId} variant="secondary" onClick={() => onElegir(r.userId)} className="justify-between">
            <span>{r.username}</span>
            <span className="text-xs text-slate-400">
              {r.cantidadCartas} cartas {r.escudoActivo && "· 🛡️"}
            </span>
          </Button>
        ))}
      </div>
    </Modal>
  );
}

// ── Resultado del Espia ─────────────────────────────────────────────────────
export function EspiaModal({
  resultado,
  onCerrar,
}: {
  resultado: EspiaResultado | null;
  onCerrar: () => void;
}) {
  return (
    <Modal
      abierto={!!resultado}
      titulo={resultado ? `👁️ Mano de ${resultado.objetivoUsername}` : ""}
      onCerrar={onCerrar}
      size="md"
    >
      <div className="flex flex-wrap gap-2">
        {resultado?.cartas.map((c, i) => <CartaView key={i} carta={c} size="sm" />)}
      </div>
      <Button variant="secondary" onClick={onCerrar} className="mt-5 w-full">
        Entendido
      </Button>
    </Modal>
  );
}
