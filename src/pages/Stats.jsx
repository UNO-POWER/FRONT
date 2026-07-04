import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerEstadisticas } from "../api/client.js";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerEstadisticas()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 px-4">
      <h1 className="text-2xl font-bold text-yellow-400">Mis estadisticas</h1>

      {error && (
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <p className="text-slate-400 text-sm mt-1">
            Si estas jugando como invitado, tus estadisticas no se guardan.
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-md text-center">
          <div className="bg-slate-800 rounded p-4">
            <p className="text-3xl font-bold text-yellow-400">{stats.partidasJugadas}</p>
            <p className="text-slate-400 text-sm">Jugadas</p>
          </div>
          <div className="bg-slate-800 rounded p-4">
            <p className="text-3xl font-bold text-yellow-400">{stats.partidasGanadas}</p>
            <p className="text-slate-400 text-sm">Ganadas</p>
          </div>
          <div className="bg-slate-800 rounded p-4">
            <p className="text-3xl font-bold text-yellow-400">{stats.rachaActual}</p>
            <p className="text-slate-400 text-sm">Racha actual</p>
          </div>
        </div>
      )}

      <Link to="/" className="text-yellow-400 text-sm hover:underline">
        Volver
      </Link>
    </div>
  );
}
