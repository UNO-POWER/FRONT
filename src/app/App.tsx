import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { PageLoader } from "./PageLoader";

// Code splitting por pantalla (DESIGN.md §10)
const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const SalasPublicas = lazy(() => import("@/pages/SalasPublicas"));
const Lobby = lazy(() => import("@/pages/Lobby"));
const Partida = lazy(() => import("@/pages/Partida"));
const Stats = lazy(() => import("@/pages/Stats"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/salas" element={<SalasPublicas />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/sala/:codigo" element={<Lobby />} />
          <Route path="/partida/:codigo" element={<Partida />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
