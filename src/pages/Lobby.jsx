import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserId, iniciarPartida, obtenerSala } from "../api/client.js";
import { conectarSala } from "../api/ws.js";
import Chat from "../components/Chat.jsx";

export default function Lobby() {
  const { codigo } = useParams();
  const [sala, setSala] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [error, setError] = useState(null);
  const [iniciando, setIniciando] = useState(false);
  const conexionRef = useRef(null);
  const navigate = useNavigate();
  const userId = getUserId();

  useEffect(() => {
    obtenerSala(codigo).then(setSala).catch((e) => setError(e.message));

    const conexion = conectarSala(codigo, {
      onRoster: setSala,
      onChat: (msg) => setMensajesChat((prev) => [...prev, msg]),
      onEstadoPartida: () => navigate(`/partida/${codigo}`),
      onError: (err) => setError(err.mensaje),
    });
    conexionRef.current = conexion;
    return conexion.desconectar;
  }, [codigo]);

  async function handleIniciar() {
    setError(null);
    setIniciando(true);
    try {
      await iniciarPartida(codigo);
      navigate(`/partida/${codigo}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setIniciando(false);
    }
  }

  const esAnfitrion = sala && userId && sala.anfitrionUserId === userId;

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

      {esAnfitrion && (
        <button
          className="bg-yellow-400 text-slate-900 font-semibold rounded py-2 px-6 disabled:opacity-50"
          disabled={iniciando || !sala || sala.jugadores.length < 2}
          onClick={handleIniciar}
        >
          Iniciar partida
        </button>
      )}
      {esAnfitrion && sala && sala.jugadores.length < 2 && (
        <p className="text-slate-500 text-xs">Necesitas al menos 2 jugadores para iniciar.</p>
      )}

      <Chat mensajes={mensajesChat} onEnviar={(texto) => conexionRef.current?.enviarChat(texto)} />
    </div>
  );
}
