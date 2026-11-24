import { FACILITIES, PROJECT } from '../data';
import { fmtHour, sunPos } from '../sun';

const ICON: Record<string, string> = { 'T-bane': 'Ⓣ', Skole: '🏫', Barnehage: '🧸', Butikk: '🛒', Park: '🌳', Trening: '🏋' };

/** 2D: kart ovenfra (Google Maps-stil) med fasiliteter i nærområdet. */
export function MapView2D() {
  return (
    <div className="siteview">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="map2d">
        <rect width="100" height="100" fill="#eef0e8" />
        <rect x="4" y="34" width="26" height="30" rx="2" fill="#cfe5c3" />
        <path d="M0 14 L100 18" stroke="#fff" strokeWidth="3.2" />
        <path d="M0 14 L100 18" stroke="#f6d77b" strokeWidth="1.4" />
        <path d="M60 0 L56 100" stroke="#fff" strokeWidth="2.6" />
        <path d="M0 84 L100 80" stroke="#fff" strokeWidth="2.2" />
        <path d="M30 18 L32 84" stroke="#fff" strokeWidth="1.6" />
        <path d="M74 18 L100 40" stroke="#8a9bb0" strokeWidth="1" strokeDasharray="2 1.2" />
        {[[38, 24, 12, 8], [64, 52, 14, 9], [40, 66, 10, 10], [80, 64, 12, 8], [12, 72, 12, 7], [70, 30, 10, 12]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#dcdcd6" stroke="#c8c8c0" strokeWidth=".3" />
        ))}
        <rect x="40" y="40" width="14" height="16" fill="#2f6f5e" stroke="#1d4d40" strokeWidth=".5" />
        <text x="47" y="62" textAnchor="middle" className="map-label strong">{PROJECT.name}</text>
        <circle cx="47" cy="48" r="20" fill="none" stroke="#2f6f5e" strokeWidth=".3" strokeDasharray="1 1" />
        {FACILITIES.map((f) => (
          <g key={f.name}>
            <circle cx={f.x} cy={f.y} r="3.4" fill="#fff" stroke="#2f6f5e" strokeWidth=".5" />
            <text x={f.x} y={f.y + 1.3} textAnchor="middle" fontSize="3.6">{ICON[f.type]}</text>
            <text x={f.x} y={f.y + 7} textAnchor="middle" className="map-label">{f.name}</text>
            <text x={f.x} y={f.y + 10.2} textAnchor="middle" className="map-label muted">{f.minutes} min gange</text>
          </g>
        ))}
        <g transform="translate(92 8)">
          <circle r="4" fill="#fff" stroke="#999" strokeWidth=".3" />
          <path d="M0 -3 L1.2 0 L-1.2 0 Z" fill="#c0392b" />
          <text y="-4.8" textAnchor="middle" fontSize="2.6">N</text>
        </g>
      </svg>
    </div>
  );
}

/** 3D: Google Earth-aktig visning med sollinje på himmelen. Bildet er forenklet (v1). */
export function EarthView3D({ hour }: { hour: number }) {
  const W = 800, H = 380, horizon = 230;
  const x = (az: number) => W / 2 + ((180 - az) / 120) * (W / 2) * 0.9; // kamera ser mot nord fra sør
  const y = (alt: number) => horizon - alt * 3.6;
  const path: string[] = [];
  for (let h = 3; h <= 23; h += 0.25) {
    const p = sunPos(h);
    if (p.altitude > -2) path.push(`${path.length ? 'L' : 'M'}${x(p.azimuth).toFixed(1)} ${y(p.altitude).toFixed(1)}`);
  }
  const now = sunPos(hour);
  const up = now.altitude > 0;
  const shadowDx = up ? Math.max(-260, Math.min(260, (x(now.azimuth) - W / 2) * -0.35 / Math.max(0.25, now.altitude / 20))) : 0;
  const sky = up ? (now.altitude < 8 ? ['#f6b26b', '#fde3c0'] : ['#5b9bd5', '#cfe6f7']) : ['#1c2541', '#3a506b'];
  return (
    <div className="siteview">
      <svg viewBox={`0 0 ${W} ${H}`} className="earth3d">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        <path d={path.join(' ')} fill="none" stroke="#ffd34d" strokeWidth="2.5" strokeDasharray="6 5" opacity=".9" />
        {[6, 12, 18, 21].map((h) => {
          const p = sunPos(h);
          return p.altitude > -1 ? <text key={h} x={x(p.azimuth)} y={y(p.altitude) - 10} textAnchor="middle" className="sky-label">kl {h}</text> : null;
        })}
        {up && <circle cx={x(now.azimuth)} cy={y(now.altitude)} r="16" fill="#fff3a6" stroke="#ffcf33" strokeWidth="4" />}
        <polygon points={`0,${horizon} ${W},${horizon} ${W},${H} 0,${H}`} fill={up ? '#9cc58a' : '#2e4636'} />
        <polygon points={`40,${horizon + 30} 220,${horizon + 18} 260,${horizon + 60} 60,${horizon + 80}`} fill={up ? '#8bb879' : '#284030'} />
        {[[90, 200, 70, 40], [560, 205, 90, 35], [660, 214, 70, 22], [140, 212, 50, 26]].map(([bx, by, bw, bh], i) => (
          <rect key={i} x={bx} y={by} width={bw} height={bh} fill={up ? '#cfd3d8' : '#45505c'} />
        ))}
        {up && <polygon points={`330,300 470,300 ${470 + shadowDx},${300 + 24} ${330 + shadowDx},${300 + 24}`} fill="rgba(0,0,0,.22)" />}
        <polygon points="330,150 470,150 500,135 360,135" fill={up ? '#e7e3dc' : '#59636d'} />
        <polygon points="470,150 500,135 500,285 470,300" fill={up ? '#bfb9ae' : '#3d454e'} />
        <rect x="330" y="150" width="140" height="150" fill={up ? '#f3efe8' : '#4c5661'} />
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2, 3, 4].map((c) => (
            <rect key={`${r}${c}`} x={338 + c * 26.5} y={158 + r * 28} width="18" height="18" fill={up ? '#7fa6c4' : '#f0d58a'} opacity=".9" />
          )),
        )}
        <text x="400" y="128" textAnchor="middle" className="sky-label strong">{PROJECT.name}</text>
        <text x="16" y={H - 14} className="sky-label">Illustrasjon. 10. mai, kl {fmtHour(hour)}. Den stiplede linjen viser solbanen gjennom dagen.</text>
      </svg>
    </div>
  );
}
