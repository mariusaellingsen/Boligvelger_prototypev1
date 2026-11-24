import { useMemo, useState } from 'react';
import { UNITS, mill, type Unit, num } from '../data';
import { BuildingFacade, Legend } from '../components/Building';
import { EarthView3D } from '../components/SiteViews';
import { SunSlider } from '../components/SunSlider';
import { sunHours } from '../sun';
import { go, useStore } from '../store';

interface Filter { min: number; max: number; rooms: number[]; dirs: string[]; floorMin: number; sizeMin: number; onlyFree: boolean }
const DEFAULT: Filter = { min: 3, max: 10, rooms: [], dirs: [], floorMin: 1, sizeMin: 40, onlyFree: true };
const DIRS = ['Vest', 'Sør', 'Øst'];

function score(u: Unit) {
  return sunHours(u) * 2 + u.floor + u.bra / 20;
}

export function BuildingPage() {
  const s = useStore();
  const [f, setF] = useState<Filter>(DEFAULT);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [hour, setHour] = useState(15.5);
  const [sel, setSel] = useState<Unit | null>(null);
  const active = JSON.stringify(f) !== JSON.stringify(DEFAULT);

  const matches = useMemo(() => UNITS.filter((u) =>
    (!f.onlyFree || u.status === 'ledig') &&
    u.price >= f.min * 1e6 && u.price <= f.max * 1e6 &&
    (f.rooms.length === 0 || f.rooms.includes(Math.min(u.rooms, 4))) &&
    (f.dirs.length === 0 || f.dirs.includes(u.direction)) &&
    u.floor >= f.floorMin && u.bra >= f.sizeMin), [f]);
  const top3 = useMemo(() => [...matches].sort((a, b) => score(b) - score(a)).slice(0, 3), [matches]);

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="page building-page">
      <aside className="filters card">
        <h3>Hva ser du etter?</h3>
        <label className="field">Pris (mill.)
          <div className="range2">
            <input type="number" min={3} max={10} step={0.5} value={f.min} onChange={(e) => setF({ ...f, min: Number(e.target.value) })} />
            <span>–</span>
            <input type="number" min={3} max={10} step={0.5} value={f.max} onChange={(e) => setF({ ...f, max: Number(e.target.value) })} />
          </div>
        </label>
        <div className="field">Antall rom
          <div className="chips">
            {[2, 3, 4].map((r) => <button key={r} className={f.rooms.includes(r) ? 'chip on' : 'chip'} onClick={() => setF({ ...f, rooms: toggleIn(f.rooms, r) })}>{r}{r === 4 ? '+' : ''}</button>)}
          </div>
        </div>
        <div className="field">Balkong mot
          <div className="chips">
            {DIRS.map((d) => <button key={d} className={f.dirs.includes(d) ? 'chip on' : 'chip'} onClick={() => setF({ ...f, dirs: toggleIn(f.dirs, d) })}>{d}</button>)}
          </div>
        </div>
        <label className="field">Fra etasje: <strong>{f.floorMin}</strong>
          <input type="range" min={1} max={5} value={f.floorMin} onChange={(e) => setF({ ...f, floorMin: Number(e.target.value) })} />
        </label>
        <label className="field">Minst <strong>{f.sizeMin} m²</strong>
          <input type="range" min={40} max={100} step={2} value={f.sizeMin} onChange={(e) => setF({ ...f, sizeMin: Number(e.target.value) })} />
        </label>
        <label className="check"><input type="checkbox" checked={f.onlyFree} onChange={(e) => setF({ ...f, onlyFree: e.target.checked })} /> Bare ledige</label>
        <div className="filter-foot">
          <span><strong>{matches.length}</strong> treff</span>
          {active && <button className="link" onClick={() => setF(DEFAULT)}>Nullstill</button>}
        </div>
        <button className="chip ghost" onClick={() => setF({ ...DEFAULT, min: 4, max: 6, rooms: [2], dirs: ['Vest'] })}>
          Eksempel: 4–6 mill., 2 rom, vest
        </button>
      </aside>

      <section className="card building-main">
        <div className="card-head">
          <div>
            <h2>Hus A · velg en leilighet</h2>
            <p className="muted">Trykk på en leilighet for å se den. Ledige er hvite.</p>
          </div>
          <div className="toggle">
            <button className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}>2D fasade</button>
            <button className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}>3D med sol</button>
          </div>
        </div>
        {mode === '2d' ? (
          <BuildingFacade matches={active ? new Set(matches.map((u) => u.id)) : undefined} top3={active ? top3.map((u) => u.id) : []} selected={sel?.id} onSelect={setSel} />
        ) : (
          <>
            <EarthView3D hour={hour} />
            <SunSlider hour={hour} onChange={setHour} />
          </>
        )}
        {mode === '2d' && <Legend />}
        {sel && mode === '2d' && (
          <div className="quick-card">
            <div>
              <h3>Leilighet {sel.id}</h3>
              <p>{sel.rooms} rom · {sel.bra} m² · {sel.floor}. etg · balkong mot {sel.direction.toLowerCase()} · ☀ {num(sunHours(sel))} t</p>
              <p className="price">{mill(sel.price)} <span className={`status ${sel.status}`}>{sel.status}</span></p>
            </div>
            <div className="quick-actions">
              <button className="icon-btn" onClick={() => s.toggleFavorite(sel.id)} aria-label="Favoritt">{s.favorites.includes(sel.id) ? '♥' : '♡'}</button>
              <button className="btn primary" onClick={() => go(`/leilighet/${sel.id}`)}>Se leilighet</button>
            </div>
          </div>
        )}
      </section>

      <aside className="card top3">
        <h3>{active ? 'Dine 3 beste treff' : 'Bruk filteret'}</h3>
        {!active && <p className="muted">Fortell oss hva du ser etter, så finner vi de tre leilighetene som passer deg best.</p>}
        {active && top3.length === 0 && <p className="muted">Ingen ledige treff. Prøv å utvide prisen eller fjerne et krav.</p>}
        {active && top3.map((u, i) => (
          <div key={u.id} className="top-item" onClick={() => go(`/leilighet/${u.id}`)}>
            <span className="rank">{i + 1}</span>
            <div>
              <strong>{u.id}</strong> · {mill(u.price)}
              <div className="muted small">{u.rooms} rom · {u.bra} m² · {u.floor}. etg · ☀ {num(sunHours(u))} t</div>
            </div>
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); s.toggleFavorite(u.id); }}>{s.favorites.includes(u.id) ? '♥' : '♡'}</button>
          </div>
        ))}
        {active && top3.length >= 2 && (
          <button className="btn secondary full" onClick={() => { s.setCompare(top3.map((u) => u.id)); go('/sammenlign'); }}>
            ⇄ Sammenlign alle {top3.length}
          </button>
        )}
        <p className="muted small">Rangert etter soltimer på balkongen 10. mai, etasje og størrelse.</p>
      </aside>
    </div>
  );
}
