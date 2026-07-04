import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  entrarComoInvitado,
  crearSala,
  unirseASala,
  setSesion,
  haySesion,
  esInvitado,
  getUsername,
  cerrarSesion,
} from "../api/client.js";

export default function Landing() {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const sesionActiva = haySesion();

  async function asegurarSesion() {
    if (sesionActiva) return;
    if (!nombre.trim()) throw new Error("Ingresa tu nombre para jugar");
    const auth = await entrarComoInvitado(nombre.trim());
    setSesion({ token: auth.token, username: auth.username, esInvitado: true });
  }

  async function handleCrearSala() {
    setError(null);
    setCargando(true);
    try {
      await asegurarSesion();
      const sala = await crearSala(false);
      navigate(`/sala/${sala.codigo}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleUnirse() {
    setError(null);
    setCargando(true);
    try {
      await asegurarSesion();
      const sala = await unirseASala(codigo.trim().toUpperCase());
      navigate(`/sala/${sala.codigo}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 px-4">
      <h1 className="text-4xl font-bold text-yellow-400">UNO Power-Ups Arena</h1>
      <p className="text-slate-300 max-w-md text-center">
        Juega UNO en tiempo real con power-ups dinamicos. Sin descargas, sin registro obligatorio.
      </p>

      {sesionActiva ? (
        <div className="text-center">
          <p className="text-slate-300">
            Jugando como <span className="text-yellow-400 font-semibold">{getUsername()}</span>
            {esInvitado() && <span className="text-slate-500 text-sm"> (invitado)</span>}
          </p>
          <div className="flex gap-4 justify-center mt-1 text-sm">
            {!esInvitado() && (
              <Link to="/stats" className="text-yellow-400 hover:underline">
                Ver mis estadisticas
              </Link>
            )}
            <button
              className="text-slate-400 hover:underline"
              onClick={() => {
                cerrarSesion();
                navigate(0);
              }}
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            className="w-full max-w-xs rounded px-3 py-2 text-black"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Link to="/cuenta" className="text-yellow-400 text-sm hover:underline -mt-3">
            Tengo cuenta / quiero crear una (HU-06)
          </Link>
        </>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          className="bg-yellow-400 text-slate-900 font-semibold rounded py-2 disabled:opacity-50"
          disabled={cargando}
          onClick={handleCrearSala}
        >
          Crear sala
        </button>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded px-3 py-2 text-black uppercase"
            placeholder="Codigo (6 caracteres)"
            maxLength={6}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <button
            className="bg-slate-700 rounded px-4 disabled:opacity-50"
            disabled={cargando || codigo.length !== 6}
            onClick={handleUnirse}
          >
            Unirse
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
