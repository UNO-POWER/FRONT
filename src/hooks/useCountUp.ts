import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Anima un contador de 0 al valor final con easeOut (respeta reduced motion). */
export function useCountUp(valorFinal: number, duracionMs = 900): number {
  const reducirMovimiento = useReducedMotion();
  const [valor, setValor] = useState(reducirMovimiento ? valorFinal : 0);

  useEffect(() => {
    if (reducirMovimiento) {
      setValor(valorFinal);
      return;
    }
    let frame: number;
    const inicio = performance.now();
    const tick = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracionMs, 1);
      const eased = 1 - Math.pow(1 - progreso, 3);
      setValor(Math.round(valorFinal * eased));
      if (progreso < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valorFinal, duracionMs, reducirMovimiento]);

  return valor;
}
