import { unitById, mill, type Unit, num } from '../data';
import { sunHours } from '../sun';
import { go, useStore } from '../store';

export function FavoritesPage() {
  const s = useStore();
  const units = s.favorites.map(unitById).filter(Boolean) as Unit[];
  return (
    <div className="page">
      <div className="card">
        <h1>Favoritter</h1>
        {units.length === 0 ? (
          <p className="muted">Trykk ♡ på en leilighet for å lagre den her.</p>
        ) : (
          <>
            <div className="fav-list">
              {units.map((u) => (
                <div key={u.id} className="fav-item">
                  <div onClick={() => go(`/leilighet/${u.id}`)} className="fav-main">
                    <strong>{u.id}</strong> · {u.rooms} rom · {u.bra} m² · {u.floor}. etg · ☀ {num(sunHours(u))} t
                    <div className="price">{mill(u.price)} <span className={`status ${u.status}`}>{u.status}</span></div>
                  </div>
                  <label className="check"><input type="checkbox" checked={s.compare.includes(u.id)} onChange={() => s.toggleCompare(u.id)} /> Sammenlign</label>
                  <button className="link" onClick={() => s.toggleFavorite(u.id)}>Fjern</button>
                </div>
              ))}
            </div>
            <div className="row">
              <button className="btn secondary" onClick={() => go('/sammenlign')} disabled={s.compare.length === 0}>⇄ Sammenlign valgte ({s.compare.length})</button>
              <button className="btn primary" onClick={() => { const ids = units.filter((u) => u.status !== 'solgt').map((u) => u.id); s.addInterests(ids); go(`/interesse/${ids.join(',')}`); }}>
                Meld interesse for alle favoritter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
