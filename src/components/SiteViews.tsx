import { PROJECT } from '../data';
import { fmtHour, sunPos } from '../sun';


/** 2D: plassholder for kartet (low-fi). Fasilitetene står i listen ved siden av. */
export function MapView2D() {
  return (
    <div className="placeholder" role="img" aria-label="Plassholder for 2D-kart">
      <svg viewBox="0 0 100 56" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="56" stroke="#222" strokeWidth=".2" />
        <line x1="100" y1="0" x2="0" y2="56" stroke="#222" strokeWidth=".2" />
      </svg>
      <span>[2D-kart ovenfra: bygget og fasiliteter i nærområdet]</span>
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
