import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserId } from "../api/client.js";
import { conectarSala } from "../api/ws.js";
import Chat from "../components/Chat.jsx";
import CartaView from "../components/CartaView.jsx";

const COLORES = ["ROJO", "AMARILLO", "VERDE", "AZUL"];
const POWERUPS_CON_OBJETIVO = ["ROBO_FORZADO", "SALTO_SELECTIVO", "ESPIA"];
const NOMBRE_POWERUP = {
  ROBO_FORZADO: "Robo forzado",
  ESPIA: "Espia",
  SALTO_SELECTIVO: "Salto selectivo",
  DUPLICADOR: "Duplicador",
  ESCUDO: "Escudo",
};

export default function Partida() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const userId = getUserId();
  const conexionRef = useRef(null);

  const [estado, setEstado] = useState(null);
  const [mano, setMano] = useState({ cartas: [], powerUpsInventario: [] });
  const [mensajesChat, setMensajesChat] = useState([]);
  const [error, setError] = useState(null);
  const [espia, setEspia] = useState(null);
  const [cartaParaColor, setCartaParaColor] = useState(null);
  const [powerUpParaObjetivo, setPowerUpParaObjetivo] = useState(null);

  useEffect(() => {
    const conexion = conectarSala(codigo, {
      onEstadoPartida: setEstado,
      onMano: setMano,
      onChat: (msg) => setMensajesChat((prev) => [...prev, msg]),
      onError: (err) => setError(err.mensaje),
      onEspia: setEspia,
    });
    conexionRef.current = conexion;
    return conexion.desconectar;
  }, [codigo]);

  if (!estado) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Conectando a la partida...</p>
      </div>
    );
  }

  const esMiTurno = estado.turnoActualUserId === userId;

  function jugar(carta) {
    if (carta.tipo === "COMODIN" || carta.tipo === "COMODIN_MAS_CUATRO") {
      setCartaParaColor(carta);
    } else {
      conexionRef.current.jugar(carta, null);
    }
  }

  function confirmarColor(color) {
    conexionRef.current.jugar(cartaParaColor, color);
    setCartaParaColor(null);
  }

  function usarPowerUp(tipo) {
    if (POWERUPS_CON_OBJETIVO.includes(tipo)) {
      setPowerUpParaObjetivo(tipo);
    } else {
      conexionRef.current.usarPowerUp(tipo, null);
    }
  }

  function confirmarObjetivo(objetivoUserId) {
    conexionRef.current.usarPowerUp(powerUpParaObjetivo, objetivoUserId);
    setPowerUpParaObjetivo(null);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6 flex flex-col items-center gap-4">
      {estado.estado === "FINALIZADA" && (
        <div className="bg-yellow-400 text-slate-900 font-bold rounded p-4 text-center w-full max-w-md">
          {estado.ganadorUserId === userId ? "Ganaste la partida!" : "Partida terminada"}
          <button className="block mx-auto mt-2 underline text-sm" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {estado.jugadores.map((j) => (
          <div
            key={j.userId}
            className={`px-3 py-2 rounded text-sm ${
              j.userId === estado.turnoActualUserId ? "bg-yellow-400 text-slate-900" : "bg-slate-800"
            }`}
          >
            {j.username} - {j.cantidadCartas} cartas
            {j.dijoUno && <span className="ml-1 font-bold">UNO!</span>}
            {j.escudoActivo && <span className="ml-1">🛡</span>}
          </div>
        ))}
      </div>

      <p className="text-slate-400 text-sm">
        Color actual: <span className="font-semibold">{estado.colorActual}</span> · Turno de{" "}
        {estado.jugadores.find((j) => j.userId === estado.turnoActualUserId)?.username ?? "-"}
      </p>

      <div className="flex items-center gap-6">
        <CartaView carta={estado.cartaSuperior} />
        {estado.powerUpActivo && (
          <button
            className="w-16 h-16 rounded-full bg-purple-600 text-xs font-bold animate-pulse"
            onClick={() => conexionRef.current.capturarPowerUp(estado.powerUpActivo.id)}
          >
            {NOMBRE_POWERUP[estado.powerUpActivo.tipo]}
          </button>
        )}
      </div>

      {esMiTurno && estado.estado === "EN_CURSO" && (
        <div className="flex gap-3">
          <button className="bg-slate-700 rounded px-4 py-1 text-sm" onClick={() => conexionRef.current.robar()}>
            Robar carta
          </button>
          <button
            className="bg-slate-700 rounded px-4 py-1 text-sm"
            onClick={() => conexionRef.current.decirUno()}
            disabled={mano.cartas.length !== 1}
          >
            Decir UNO
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {mano.cartas.map((c, i) => (
          <CartaView key={i} carta={c} onClick={() => jugar(c)} disabled={!esMiTurno} />
        ))}
      </div>

      {mano.powerUpsInventario.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {mano.powerUpsInventario.map((tipo, i) => (
            <button
              key={i}
              className="bg-purple-700 rounded px-3 py-1 text-sm"
              onClick={() => usarPowerUp(tipo)}
            >
              Usar {NOMBRE_POWERUP[tipo]}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {cartaParaColor && (
        <Modal titulo="Elige un color">
          <div className="flex gap-2">
            {COLORES.map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded ${
                  { ROJO: "bg-red-600", AMARILLO: "bg-yellow-400", VERDE: "bg-green-600", AZUL: "bg-blue-600" }[color]
                }`}
                onClick={() => confirmarColor(color)}
              />
            ))}
          </div>
        </Modal>
      )}

      {powerUpParaObjetivo && (
        <Modal titulo={`Elige un objetivo para ${NOMBRE_POWERUP[powerUpParaObjetivo]}`}>
          <div className="flex flex-col gap-2">
            {estado.jugadores
              .filter((j) => j.userId !== userId)
              .map((j) => (
                <button
                  key={j.userId}
                  className="bg-slate-700 rounded px-3 py-1"
                  onClick={() => confirmarObjetivo(j.userId)}
                >
                  {j.username}
                </button>
              ))}
          </div>
        </Modal>
      )}

      {espia && (
        <Modal titulo={`Mano de ${espia.objetivoUsername}`} onCerrar={() => setEspia(null)}>
          <div className="flex flex-wrap gap-2">
            {espia.cartas.map((c, i) => (
              <CartaView key={i} carta={c} />
            ))}
          </div>
        </Modal>
      )}

      <Chat mensajes={mensajesChat} onEnviar={(texto) => conexionRef.current?.enviarChat(texto)} />
    </div>
  );
}

function Modal({ titulo, children, onCerrar }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10">
      <div className="bg-slate-800 rounded p-6 flex flex-col gap-4 items-center">
        <p className="font-semibold">{titulo}</p>
        {children}
        {onCerrar && (
          <button className="text-slate-400 text-sm underline" onClick={onCerrar}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
