const COLOR_CLASES = {
  ROJO: "bg-red-600",
  AMARILLO: "bg-yellow-400 text-black",
  VERDE: "bg-green-600",
  AZUL: "bg-blue-600",
  COMODIN: "bg-slate-900 border-2 border-yellow-400",
};

const ETIQUETA_TIPO = {
  SALTAR: "⧖",
  REVERSA: "⇄",
  MAS_DOS: "+2",
  COMODIN: "★",
  COMODIN_MAS_CUATRO: "+4",
};

export default function CartaView({ carta, onClick, disabled }) {
  if (!carta) {
    return <div className="w-14 h-20 rounded border-2 border-dashed border-slate-600" />;
  }
  const claseColor = COLOR_CLASES[carta.color] ?? "bg-slate-700";
  const etiqueta = carta.tipo === "NUMERO" ? carta.valor : ETIQUETA_TIPO[carta.tipo];

  return (
    <button
      className={`w-14 h-20 rounded shadow font-bold text-xl flex items-center justify-center ${claseColor} disabled:opacity-40`}
      onClick={onClick}
      disabled={disabled || !onClick}
    >
      {etiqueta}
    </button>
  );
}
