import { UNITS, type Unit } from '../data';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const W = 92, H = 62, GAP = 6, X0 = 70, Y0 = 40;

interface Props {
  matches?: Set<string>;
  top3?: string[];
  selected?: string | null;
  onSelect: (u: Unit) => void;
}

/** Fasade der hver leilighet er en trykkbar flate (kino-mønsteret). */
export function BuildingFacade({ matches, top3 = [], selected, onSelect }: Props) {
  const width = X0 + LETTERS.length * (W + GAP) + 20;
  const height = Y0 + 5 * (H + GAP) + 40;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="facade" role="img" aria-label="Fasade med alle leiligheter">
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#ffffff" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#bbbbbb" strokeWidth="2" />
        </pattern>
      </defs>
      <polygon points={`${X0 - 14},${Y0 - 4} ${width / 2 + 25},${6} ${width - 6},${Y0 - 4}`} fill="#e3e3e3" />
      <rect x={X0 - 14} y={Y0 - 4} width={width - X0 + 8} height={height - Y0 - 22} fill="#f3f3f3" stroke="#bbbbbb" />
      {[5, 4, 3, 2, 1].map((floor, row) => (
        <text key={floor} x={X0 - 22} y={Y0 + row * (H + GAP) + H / 2 + 5} textAnchor="end" className="floor-label">
          {floor}. etg
        </text>
      ))}
      {UNITS.map((u) => {
        const col = LETTERS.indexOf(u.letter);
        const row = 5 - u.floor;
        const x = X0 + col * (W + GAP);
        const y = Y0 + row * (H + GAP);
        const isMatch = matches ? matches.has(u.id) : u.status === 'ledig';
        const rank = top3.indexOf(u.id);
        const dim = matches && !isMatch;
        const cls = ['unit', `unit-${u.status}`, dim ? 'dim' : '', rank >= 0 ? 'top' : '', selected === u.id ? 'selected' : ''].join(' ');
        return (
          <g key={u.id} className={cls} onClick={() => onSelect(u)} tabIndex={0} role="button"
             aria-label={`Leilighet ${u.id}, ${u.status}`}
             onKeyDown={(e) => (e.key === 'Enter' ? onSelect(u) : null)}>
            <rect x={x} y={y} width={W} height={H} />
            <text x={x + 10} y={y + 22} className="unit-id">{u.id}</text>
            <text x={x + 10} y={y + 42} className="unit-meta">{u.status === 'solgt' ? 'Solgt' : u.status === 'reservert' ? 'Reservert' : `${u.rooms} rom · ${u.bra} m²`}</text>
            {rank >= 0 && (
              <g>
                <circle cx={x + W - 14} cy={y + 14} r={10} className="rank-dot" />
                <text x={x + W - 14} y={y + 18} textAnchor="middle" className="rank-text">{rank + 1}</text>
              </g>
            )}
          </g>
        );
      })}
      <rect x={X0 - 14} y={height - 26} width={width - X0 + 8} height={8} fill="#999999" />
    </svg>
  );
}

export function Legend() {
  return (
    <div className="legend">
      <span><i className="sw sw-ledig" /> Ledig</span>
      <span><i className="sw sw-reservert" /> Reservert</span>
      <span><i className="sw sw-solgt" /> Solgt</span>
      <span><i className="sw sw-top" /> Dine beste treff</span>
    </div>
  );
}
