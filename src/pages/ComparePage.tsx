import { PROJECT, UNITS, unitById, mill, nok, type Unit, num } from '../data';
import { FloorPlan } from '../components/FloorPlan';
import { sunHours } from '../sun';
import { go, useStore } from '../store';

type Row = { label: string; value: (u: Unit) => number | string; best?: 'min' | 'max'; fmt?: (v: number) => string };
const ROWS: Row[] = [
  { label: 'Pris', value: (u) => u.price, best: 'min', fmt: mill },
  { label: 'Størrelse', value: (u) => u.bra, best: 'max', fmt: (v) => `${v} m²` },
  { label: 'Pris per m²', value: (u) => Math.round(u.price / u.bra), best: 'min', fmt: nok },
  { label: 'Soltimer på balkongen', value: (u) => sunHours(u), best: 'max', fmt: (v) => `${num(v)} t` },
  { label: 'Etasje', value: (u) => u.floor, best: 'max', fmt: (v) => `${v}.` },
  { label: 'Utsikt', value: (u) => u.view },
  { label: 'Balkong', value: (u) => u.balcony, best: 'max', fmt: (v) => `${v} m²` },
  { label: 'Felleskostnader', value: (u) => u.monthlyCost, best: 'min', fmt: (v) => `${nok(v)}/mnd` },
  { label: 'Innskudd', value: (u) => u.innskudd, best: 'min', fmt: nok },
  { label: 'Bod', value: (u) => u.bod, best: 'max', fmt: (v) => `${v} m²` },
];

function verdict(units: Unit[]) {
  if (units.length < 2) return null;
  const [a, b] = [...units].sort((x, y) => y.price - x.price);
  const dSun = sunHours(a) - sunHours(b);
  const dPrice = a.price - b.price;
  const parts = [];
  if (dSun > 0) parts.push(`${num(dSun)} t mer sol per dag`);
  if (a.bra > b.bra) parts.push(`${a.bra - b.bra} m² mer`);
  if (a.floor > b.floor) parts.push(`${a.floor - b.floor} etasje${a.floor - b.floor > 1 ? 'r' : ''} høyere`);
  return parts.length ? `${a.id} gir ${parts.join(', ')} for ${nok(dPrice)} mer enn ${b.id}.` : `${b.id} er billigst, og ${a.id} gir ikke mer for prisen.`;
}

export function ComparePage() {
  const s = useStore();
  const units = s.compare.map(unitById).filter(Boolean) as Unit[];
  const free = UNITS.filter((u) => u.status === 'ledig' && !s.compare.includes(u.id));
  if (units.length === 0)
    return (
      <div className="page"><div className="card empty">
        <h2>Ingen leiligheter å sammenligne ennå</h2>
        <p>Trykk «Legg til i sammenligning» på en leilighet, eller bruk filteret og «Sammenlign alle 3».</p>
        <button className="btn primary" onClick={() => go('/bygg')}>Gå til bygget</button>
      </div></div>
    );
  const v = verdict(units);
  return (
    <div className="page">
      <div className="card">
        <div className="card-head">
          <h1>Sammenlign</h1>
          {units.length < 3 && (
            <select onChange={(e) => e.target.value && s.toggleCompare(e.target.value)} value="">
              <option value="">+ Legg til ledig leilighet</option>
              {free.map((u) => <option key={u.id} value={u.id}>{u.id} · {u.rooms} rom · {mill(u.price)}</option>)}
            </select>
          )}
        </div>
        {v && <div className="verdict">💡 {v}</div>}
        <table className="compare">
          <thead>
            <tr>
              <th />
              {units.map((u) => (
                <th key={u.id}>
                  <div className="cmp-head">
                    <a href={`#/leilighet/${u.id}`}>{u.id}</a>
                    <button className="link small" onClick={() => s.toggleCompare(u.id)}>Fjern</button>
                  </div>
                  <div className="cmp-plan"><FloorPlan unit={u} variant={0} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const vals = units.map(r.value);
              const nums = vals.filter((x): x is number => typeof x === 'number');
              const best = r.best && nums.length === vals.length ? (r.best === 'min' ? Math.min(...nums) : Math.max(...nums)) : null;
              const allSame = nums.length === vals.length && nums.every((n) => n === nums[0]);
              return (
                <tr key={r.label}>
                  <th>{r.label}</th>
                  {vals.map((val, i) => (
                    <td key={i} className={best !== null && val === best && !allSame ? 'best' : ''}>
                      {typeof val === 'number' && r.fmt ? r.fmt(val) : val}
                      {best !== null && val === best && !allSame && <span className="tick"> ✓</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th>Spart meglergebyr</th>
              {units.map((u) => <td key={u.id}>{nok(PROJECT.meglerFeeSaved)}</td>)}
            </tr>
            <tr className="actions">
              <th />
              {units.map((u) => (
                <td key={u.id}>
                  <button className="btn secondary small" onClick={() => s.toggleFavorite(u.id)}>{s.favorites.includes(u.id) ? '♥' : '♡'} Favoritt</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="cmp-foot">
          <p className="muted">Liker du flere? Du kan melde interesse for alle samtidig.</p>
          <button className="btn primary big" onClick={() => { s.addInterests(units.map((u) => u.id)); go(`/interesse/${units.map((u) => u.id).join(',')}`); }}>
            Meld interesse for {units.map((u) => u.id).join(', ')}
          </button>
        </div>
      </div>
    </div>
  );
}
