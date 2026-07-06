import { useCallback, useEffect, useRef, useState } from "react";

/** Copia texto y expone un flag "copiado" temporal para feedback en la UI. */
export function useCopyToClipboard(duracionMs = 1800) {
  const [copiado, setCopiado] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copiar = useCallback(
    async (texto: string) => {
      try {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopiado(false), duracionMs);
        return true;
      } catch {
        return false;
      }
    },
    [duracionMs],
  );

  return { copiado, copiar };
}
