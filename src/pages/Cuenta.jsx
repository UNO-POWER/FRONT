import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarUsuario, iniciarSesion, setSesion } from "../api/client.js";

export default function Cuenta() {
  const [modo, setModo] = useState("login"); // login | registro
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const auth =
        modo === "login" ? await iniciarSesion(username, password) : await registrarUsuario(username, password);
      setSesion({ token: auth.token, username: auth.username, esInvitado: false });
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 px-4">
      <h1 className="text-2xl font-bold text-yellow-400">
        {modo === "login" ? "Iniciar sesion" : "Crear cuenta"}
      </h1>
      <p className="text-slate-400 text-sm max-w-xs text-center">
        HU-06: tus partidas jugadas, ganadas y racha quedan guardadas entre sesiones.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
        <input
          className="rounded px-3 py-2 text-black"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          required
        />
        <input
          className="rounded px-3 py-2 text-black"
          placeholder="Contrasena"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="submit"
          className="bg-yellow-400 text-slate-900 font-semibold rounded py-2 disabled:opacity-50"
          disabled={cargando}
        >
          {modo === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>

      <button
        className="text-slate-400 text-sm hover:underline"
        onClick={() => setModo(modo === "login" ? "registro" : "login")}
      >
        {modo === "login" ? "No tengo cuenta, quiero registrarme" : "Ya tengo cuenta, iniciar sesion"}
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
