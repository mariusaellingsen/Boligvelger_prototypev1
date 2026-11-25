import type { Unit } from '../data';

export const FURNISHINGS = ['Standard', 'Stor spisestue (8 pers.)', 'Hjemmekontor', 'Stor TV-stue'];

const S = 58; // px per meter

interface Room { name: string; x: number; y: number; w: number; h: number }

function layout(u: Unit) {
  const depth = 6.4;
  const width = Math.round((u.bra / depth) * 10) / 10;
  const livingW = Math.round(width * (u.bedrooms >= 2 ? 0.46 : 0.56) * 10) / 10;
  const restW = width - livingW;
  const bedH = 3.6;
  const rooms: Room[] = [{ name: 'Stue / kjøkken', x: 0, y: 0, w: livingW, h: depth }];
  const bw = restW / u.bedrooms;
  for (let i = 0; i < u.bedrooms; i++) {
    rooms.push({ name: i === 0 ? 'Soverom' : `Soverom ${i + 1}`, x: livingW + i * bw, y: 0, w: bw, h: bedH });
  }
  const lowH = depth - bedH;
  const badW = Math.min(2.4, restW * 0.45);
  rooms.push({ name: 'Bad', x: livingW, y: bedH, w: badW, h: lowH });
  rooms.push({ name: 'Bod', x: livingW + badW, y: bedH, w: 1.2, h: lowH });
  rooms.push({ name: 'Entré', x: livingW + badW + 1.2, y: bedH, w: restW - badW - 1.2, h: lowH });
  return { width, depth, livingW, rooms };
}

function F({ x, y, w, h, label, round }: { x: number; y: number; w: number; h: number; label?: string; round?: boolean }) {
  return (
    <g className="furn">
      {round ? <ellipse cx={(x + w / 2) * S} cy={(y + h / 2) * S} rx={(w / 2) * S} ry={(h / 2) * S} /> : <rect x={x * S} y={y * S} width={w * S} height={h * S} />}
      {label && <text x={(x + w / 2) * S} y={(y + h / 2) * S + 4} textAnchor="middle">{label}</text>}
    </g>
  );
}

function Chairs({ x, y, w, h, n }: { x: number; y: number; w: number; h: number; n: number }) {
  const per = Math.ceil(n / 2);
  const out = [];
  for (let i = 0; i < per; i++) {
    const cx = x + ((i + 0.5) * w) / per - 0.22;
    out.push(<rect key={`t${i}`} className="chair" x={cx * S} y={(y - 0.55) * S} width={0.44 * S} height={0.44 * S} />);
    if (i < n - per) out.push(<rect key={`b${i}`} className="chair" x={cx * S} y={(y + h + 0.11) * S} width={0.44 * S} height={0.44 * S} />);
  }
  return <>{out}</>;
}

function Furniture({ v, livingW, depth, bed }: { v: number; livingW: number; depth: number; bed: Room }) {
  const L = livingW;
  const items = [];
  // Kjøkken langs veggen øverst
  items.push(<F key="k" x={0.15} y={0.15} w={Math.min(3.2, L - 0.4)} h={0.65} label="Kjøkken" />);
  if (v === 0) {
    items.push(<F key="s" x={0.3} y={depth - 1.3} w={2.2} h={0.9} label="Sofa" />);
    items.push(<F key="b" x={0.9} y={depth - 2.3} w={1} h={0.6} round />);
    items.push(<F key="d" x={L - 2.2} y={2.1} w={1.6} h={0.9} label="Spisebord" />, <Chairs key="dc" x={L - 2.2} y={2.1} w={1.6} h={0.9} n={4} />);
  } else if (v === 1) {
    items.push(<F key="d" x={0.5} y={2.3} w={2.6} h={1} label="Spisebord 8" />, <Chairs key="dc" x={0.5} y={2.3} w={2.6} h={1} n={8} />);
    items.push(<F key="s" x={0.3} y={depth - 1.0} w={1.6} h={0.75} label="Sofa" />);
  } else if (v === 2) {
    items.push(<F key="s" x={0.3} y={depth - 1.3} w={2} h={0.9} label="Sofa" />);
    items.push(<F key="d" x={L - 1.9} y={2.0} w={1.2} h={0.8} label="Bord" />, <Chairs key="dc" x={L - 1.9} y={2.0} w={1.2} h={0.8} n={4} />);
    items.push(<F key="w" x={bed.x + 0.15} y={bed.y + bed.h - 0.75} w={1.3} h={0.6} label="Skrivebord" />);
  } else {
    items.push(<F key="s" x={0.25} y={depth - 2.4} w={0.9} h={2.1} label="" />, <F key="s2" x={0.25} y={depth - 1.15} w={2.8} h={0.9} label="Hjørnesofa" />);
    items.push(<F key="tv" x={L - 0.45} y={depth - 2.7} w={0.25} h={1.8} />);
    items.push(<F key="d" x={L - 1.6} y={1.4} w={0.9} h={0.9} label="Bord" round />, <Chairs key="dc" x={L - 1.6} y={1.4} w={0.9} h={0.9} n={2} />);
  }
  // Seng
  const bw = Math.min(1.6, bed.w - 0.5);
  items.push(<F key="bed" x={bed.x + (bed.w - bw) / 2} y={bed.y + 0.2} w={bw} h={2.0} label="Seng" />);
  return <>{items}</>;
}

export function FloorPlan({ unit, variant }: { unit: Unit; variant: number }) {
  const { width, depth, livingW, rooms } = layout(unit);
  const pad = 46;
  const balW = unit.balcony / depth;
  return (
    <svg viewBox={`${-pad - balW * S} ${-pad} ${width * S + pad * 2 + balW * S} ${depth * S + pad * 2}`} className="floorplan" role="img" aria-label={`Plantegning ${unit.id}`}>
      <rect x={-balW * S} y={0} width={balW * S} height={depth * S} className="balcony" />
      <text x={(-balW * S) / 2} y={(depth * S) / 2} textAnchor="middle" className="room-label" transform={`rotate(-90 ${(-balW * S) / 2} ${(depth * S) / 2})`}>
        Balkong {unit.balcony} m² · {unit.direction}
      </text>
      {rooms.map((r) => <rect key={r.name} x={r.x * S} y={r.y * S} width={r.w * S} height={r.h * S} className="room" />)}
      <Furniture v={variant} livingW={livingW} depth={depth} bed={rooms[1]} />
      {rooms.map((r) => (
        <g key={r.name}>
                    <text x={(r.x + r.w / 2) * S} y={(r.y + r.h / 2) * S + (r.name.startsWith('Stue') ? -40 : r.name.startsWith('Sov') ? 70 : 4)} textAnchor="middle" className="room-label">
            {r.name}
          </text>
          {r.w > 1.7 && <text x={(r.x + r.w / 2) * S} y={(r.y + r.h / 2) * S + (r.name.startsWith('Stue') ? -24 : r.name.startsWith('Sov') ? 86 : 20)} textAnchor="middle" className="room-area">{(r.w * r.h).toFixed(1).replace('.', ',')} m²</text>}
        </g>
      ))}
      <rect x={0} y={0} width={width * S} height={depth * S} className="outer" />
      {/* Mål langs veggene */}
      <g className="dim">
        <line x1={0} y1={-22} x2={width * S} y2={-22} />
        <text x={(width * S) / 2} y={-28} textAnchor="middle">{width.toFixed(1).replace('.', ',')} m</text>
        <line x1={width * S + 22} y1={0} x2={width * S + 22} y2={depth * S} />
        <text x={width * S + 30} y={(depth * S) / 2} transform={`rotate(90 ${width * S + 30} ${(depth * S) / 2})`} textAnchor="middle">{depth.toFixed(1).replace('.', ',')} m</text>
        <line x1={0} y1={depth * S + 22} x2={livingW * S} y2={depth * S + 22} />
        <text x={(livingW * S) / 2} y={depth * S + 38} textAnchor="middle">{livingW.toFixed(1).replace('.', ',')} m</text>
      </g>
      <g transform={`translate(${width * S - 10} ${depth * S + 34})`}>
        <g transform={`rotate(${270 - unit.azimuth})`}>
          <path d="M0 -12 L5 2 L-5 2 Z" fill="#5f5f5f" />
          <text y={-15} textAnchor="middle" fontSize="11">N</text>
        </g>
      </g>
    </svg>
  );
}
