import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hayError: boolean;
}

/**
 * Ultima linea de defensa: nunca pantalla blanca. No expone detalles internos
 * del error al usuario (DESIGN.md §9).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hayError: false };

  static getDerivedStateFromError(): State {
    return { hayError: true };
  }

  render() {
    if (!this.state.hayError) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
        <p className="font-display text-5xl font-bold text-slate-600">:(</p>
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-100">Algo salio mal</h1>
          <p className="mt-1 text-sm text-slate-400">Recarga la pagina para continuar.</p>
        </div>
        <Button onClick={() => window.location.assign("/")}>Volver al inicio</Button>
      </div>
    );
  }
}
