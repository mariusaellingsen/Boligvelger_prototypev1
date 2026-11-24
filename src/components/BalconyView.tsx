import type { Unit } from '../data';
import { balconySun, fmtHour, sunPos } from '../sun';

const MSG = {
  sol: '☀ Sol på balkongen',
  'skygge-nabo': '⛅ Sola står lavt og skygges av nabobygget',
  'feil-retning': '🌥 Sola står på andre siden av bygget',
  natt: '🌙 Sola har gått ned',
};

/** Utsikt fra balkongen med sola og lysinnslipp, til valgt tid. */
export function BalconyView({ unit, hour }: { unit: Unit; hour: number }) {
  const W = 640, H = 340;
  const p = sunPos(hour);
  const state = balconySun(unit, hour);
  let diff = p.azimuth - unit.azimuth;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const sx = W / 2 + (diff / 70) * (W / 2); // sett utover fra balkongen: lavere azimut (mot sør) til venstre
  const sy = 210 - p.altitude * 4.2;
  const day = p.altitude > 0;
  const sky = !day ? ['#1c2541', '#3a506b'] : p.altitude < 8 ? ['#f3a65f', '#fde3c0'] : ['#5b9bd5', '#d4e9f8'];
  const lit = state === 'sol';
  const viewLow = unit.floor <= 2;
  return (
    <div className="balcony-view">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#bsky)" />
        {day && Math.abs(diff) < 90 && <circle cx={sx} cy={sy} r="18" fill="#fff3a6" stroke="#ffcf33" strokeWidth="5" />}
        {/* Utsikt: lavere etasjer ser mer av nabobygg */}
        <polygon points={`0,${viewLow ? 150 : 205} 110,${viewLow ? 140 : 200} 160,${viewLow ? 160 : 210} 260,${viewLow ? 150 : 205} 340,${viewLow ? 170 : 215} 480,${viewLow ? 145 : 200} 640,${viewLow ? 155 : 208} 640,240 0,240`} fill={day ? '#8fae84' : '#263a2e'} />
        {viewLow && <rect x="360" y="110" width="170" height="130" fill={day ? '#c9ccd1' : '#3d454e'} />}
        {viewLow && [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={372 + c * 40} y={124 + r * 36} width="22" height="20" fill={day ? '#8fb0c9' : '#e8cf86'} />))}
        <rect y="240" width={W} height="100" fill={lit ? '#e9d9b8' : '#cfc6b5'} />
        {lit && <polygon points={`120,340 ${300 + diff * 1.5},240 ${520 + diff * 1.5},240 560,340`} fill="rgba(255,236,160,.55)" />}
        <rect x="0" y="232" width={W} height="10" fill="#6d6f73" />
        {[...Array(17)].map((_, i) => <rect key={i} x={10 + i * 38} y="242" width="4" height="70" fill="#6d6f73" />)}
        <rect x="0" y="306" width={W} height="8" fill="#6d6f73" />
        <rect x="40" y="275" width="90" height="40" rx="6" fill="#a47b52" />
        <rect x="500" y="268" width="70" height="50" rx="6" fill="#a47b52" />
      </svg>
      <div className={`sun-status ${state}`}>
        <strong>{MSG[state]}</strong>
        <span>kl {fmtHour(hour)} · sola i {Math.round(p.azimuth)}° og {Math.max(0, Math.round(p.altitude))}° over horisonten · balkong mot {unit.direction.toLowerCase()}</span>
      </div>
    </div>
  );
}

/** Soltimer gjennom dagen som en enkel stripe. */
export function SunStrip({ unit }: { unit: Unit }) {
  const hours = [];
  for (let h = 4; h < 23; h += 0.5) hours.push(h);
  return (
    <div className="sun-strip" aria-label="Sol på balkongen gjennom dagen">
      {hours.map((h) => (
        <span key={h} className={`cell ${balconySun(unit, h)}`} title={`kl ${fmtHour(h)}`} />
      ))}
      <div className="sun-strip-axis"><span>04</span><span>09</span><span>14</span><span>18</span><span>23</span></div>
    </div>
  );
}
