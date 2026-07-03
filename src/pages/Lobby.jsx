import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerSala } from "../api/client.js";
import { conectarSala } from "../api/ws.js";

export default function Lobby() {
  const { codigo } = useParams();
  const [sala, setSala] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerSala(codigo).then(setSala).catch((e) => setError(e.message));
    const desconectar = conectarSala(codigo, setSala);
    return desconectar;
  }, [codigo]);

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-10 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">
        Sala <span className="text-yellow-400">{codigo}</span>
      </h1>
      <p className="text-slate-400">Comparte este codigo para invitar amigos.</p>

      {error && <p className="text-red-400">{error}</p>}

      <ul className="w-full max-w-sm divide-y divide-slate-700">
        {(sala?.jugadores ?? []).map((j) => (
          <li key={j.userId} className="py-2 flex justify-between">
            <span>{j.username}</span>
            {j.esAnfitrion && <span className="text-yellow-400 text-sm">Anfitrion</span>}
          </li>
        ))}
      </ul>

      {sala && (
        <p className="text-slate-500 text-sm">
          {sala.jugadores.length} / {sala.maxJugadores} jugadores
        </p>
      )}
    </div>
  );
}
