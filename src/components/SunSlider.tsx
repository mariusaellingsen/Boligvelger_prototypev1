import { fmtHour } from '../sun';

export function SunSlider({ hour, onChange }: { hour: number; onChange: (h: number) => void }) {
  return (
    <div className="sun-slider">
      <span>☀ Tid på døgnet</span>
      <input type="range" min={4} max={23} step={0.25} value={hour} onChange={(e) => onChange(Number(e.target.value))} aria-label="Tid på døgnet" />
      <strong>kl {fmtHour(hour)}</strong>
      <div className="presets">
        {[6, 9, 12, 15.5, 18, 21].map((h) => (
          <button key={h} className={hour === h ? 'chip on' : 'chip'} onClick={() => onChange(h)}>{fmtHour(h)}</button>
        ))}
      </div>
    </div>
  );
}
