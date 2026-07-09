interface LogoProps {
  className?: string;
  title?: string;
}

/** Carta de UNO estilizada: fondo de color, ovalo blanco diagonal y numero. */
function Carta({ color, num, rot }: { color: string; num: string; rot: number }) {
  return (
    <g transform={`rotate(${rot})`}>
      <g transform="translate(0 -15)">
        <rect x="-10" y="-15" width="20" height="30" rx="3.4" fill={color} stroke="#0A0D14" strokeWidth="1.1" />
        <ellipse cx="0" cy="0" rx="6.2" ry="13" fill="#ffffff" transform="rotate(22)" />
        <text
          x="0"
          y="0.5"
          fill={color}
          fontSize="13"
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Space Grotesk Variable', system-ui, sans-serif"
        >
          {num}
        </text>
        <text x="-6.8" y="-9" fill="#ffffff" fontSize="4.6" fontWeight="700" textAnchor="middle">
          {num}
        </text>
        <text
          x="6.8"
          y="12.4"
          fill="#ffffff"
          fontSize="4.6"
          fontWeight="700"
          textAnchor="middle"
          transform="rotate(180 6.8 11)"
        >
          {num}
        </text>
      </g>
    </g>
  );
}

/** Marca de UNO Power-Ups Arena: tres cartas en abanico. */
export function Logo({ className, title = "UNO Power-Ups Arena" }: LogoProps) {
  return (
    <svg viewBox="0 0 60 48" className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      <g transform="translate(30 42)">
        <Carta color="#F43F5E" num="7" rot={-24} />
        <Carta color="#3B82F6" num="4" rot={24} />
        <Carta color="#F59E0B" num="1" rot={0} />
      </g>
    </svg>
  );
}
