import { useEffect, useState } from "react";

/**
 * Segundos restantes hasta un instante ISO (redondeo hacia arriba, nunca negativo).
 * Devuelve null sin deadline. Se re-sincroniza solo cuando cambia el deadline, asi que
 * un re-render cualquiera no reinicia la cuenta.
 */
export function useCountdown(deadlineIso: string | null): number | null {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineIso) {
      setRestante(null);
      return;
    }
    const fin = new Date(deadlineIso).getTime();
    const tick = () => setRestante(Math.max(0, Math.ceil((fin - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadlineIso]);

  return restante;
}
