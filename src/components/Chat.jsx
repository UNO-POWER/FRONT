import { useState } from "react";

/** HU-05: chat en tiempo real por sala. */
export default function Chat({ mensajes, onEnviar }) {
  const [texto, setTexto] = useState("");

  function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    onEnviar(texto.trim());
    setTexto("");
  }

  return (
    <div className="bg-slate-800 rounded p-3 w-full max-w-sm flex flex-col gap-2">
      <p className="text-slate-400 text-xs uppercase tracking-wide">Chat de la sala</p>
      <div className="h-40 overflow-y-auto flex flex-col gap-1 text-sm">
        {mensajes.map((m, i) => (
          <p key={i}>
            <span className="text-yellow-400">{m.autorUsername}:</span> {m.texto}
          </p>
        ))}
      </div>
      <form onSubmit={enviar} className="flex gap-2">
        <input
          className="flex-1 rounded px-2 py-1 text-black text-sm"
          placeholder="Escribe un mensaje..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button className="bg-yellow-400 text-slate-900 text-sm rounded px-3" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
