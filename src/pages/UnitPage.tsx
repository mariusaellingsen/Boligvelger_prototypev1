import { useState } from 'react';
import { PROJECT, unitById, nok, num } from '../data';
import { FloorPlan, FURNISHINGS } from '../components/FloorPlan';
import { BalconyView, SunStrip } from '../components/BalconyView';
import { SunSlider } from '../components/SunSlider';
import { fmtHour, sunHours, sunWindow } from '../sun';
import { go, useStore } from '../store';

export function UnitPage({ id }: { id: string }) {
  const u = unitById(id);
  const s = useStore();
  const [tab, setTab] = useState<'plan' | 'sol'>('plan');
  const [variant, setVariant] = useState(0);
  const [hour, setHour] = useState(15.5);
  if (!u) return <div className="page"><p>Fant ikke leiligheten. <a href="#/bygg">Tilbake til bygget</a></p></div>;
  const win = sunWindow(u);
  const interested = s.interests.includes(u.id);
  const canBuy = s.salesOpen && s.preQual?.approved && u.status === 'ledig';
  return (
    <div className="page unit-page">
      <div className="crumbs"><a href="#/bygg">← Tilbake til bygget</a></div>
      <div className="unit-grid">
        <section className="card">
          <div className="card-head">
            <div>
              <h1>Leilighet {u.id}</h1>
              <p className="muted">{u.rooms} rom · {u.bra} m² BRA · {u.floor}. etasje · balkong {u.balcony} m² mot {u.direction.toLowerCase()} · utsikt: {u.view.toLowerCase()}</p>
            </div>
            <div className="toggle">
              <button className={tab === 'plan' ? 'on' : ''} onClick={() => setTab('plan')}>Plantegning</button>
              <button className={tab === 'sol' ? 'on' : ''} onClick={() => setTab('sol')}>Sol og utsikt</button>
            </div>
          </div>
          {tab === 'plan' ? (
            <>
              <FloorPlan unit={u} variant={variant} />
              <div className="furnish">
                <button className="icon-btn" onClick={() => setVariant((variant + 3) % 4)} aria-label="Forrige møblering">◀</button>
                <span>Møblering <strong>{variant + 1} av 4</strong>: {FURNISHINGS[variant]}</span>
                <button className="icon-btn" onClick={() => setVariant((variant + 1) % 4)} aria-label="Neste møblering">▶</button>
              </div>
            </>
          ) : (
            <>
              <BalconyView unit={u} hour={hour} />
              <SunSlider hour={hour} onChange={setHour} />
              <div className="sun-summary">
                <SunStrip unit={u} />
                <p>
                  <strong>{num(sunHours(u))} soltimer</strong> på balkongen 10. mai
                  {win ? <>, fra kl {fmtHour(win.from)} til {fmtHour(win.to)}.</> : '.'}
                </p>
              </div>
            </>
          )}
        </section>

        <aside className="card summary">
          <p className="price-big">{nok(u.price)}</p>
          <span className={`status ${u.status}`}>{u.status === 'ledig' ? 'Ledig' : u.status === 'reservert' ? 'Reservert' : 'Solgt'}</span>
          <dl className="costs">
            <dt>Innskudd</dt><dd>{nok(u.innskudd)}</dd>
            <dt>Fellesgjeld</dt><dd>{nok(u.fellesgjeld)}</dd>
            <dt>Felleskostnader</dt><dd>{nok(u.monthlyCost)} / mnd</dd>
            <dt>Bod</dt><dd>{u.bod} m²</dd>
            <dt>Parkering</dt><dd>{u.parking ? 'Inkludert' : 'Kan kjøpes som tilvalg'}</dd>
            <dt>Pris per m²</dt><dd>{nok(Math.round(u.price / u.bra))}</dd>
          </dl>
          <div className="saving">
            <div><strong>Spart meglergebyr {nok(PROJECT.meglerFeeSaved)}</strong><p>Du kjøper direkte og digitalt, uten megler.</p></div>
          </div>
          <div className="sun-mini">☀ <strong>{num(sunHours(u))} t</strong> sol på balkongen 10. mai · <button className="link" onClick={() => setTab('sol')}>Se sola</button></div>
          <div className="row">
            <button className="btn secondary" onClick={() => s.toggleFavorite(u.id)}>{s.favorites.includes(u.id) ? '♥ Favoritt' : '♡ Favoritt'}</button>
            <button className="btn secondary" onClick={() => s.toggleCompare(u.id)}>{s.compare.includes(u.id) ? '✓ I sammenligning' : '⇄ Legg til i sammenligning'}</button>
          </div>
          {u.status !== 'solgt' && (
            canBuy ? (
              <button className="btn primary full big" onClick={() => go(`/kjop/${u.id}`)}>Kjøp {u.id}</button>
            ) : interested ? (
              <div className="note ok">✓ Du har meldt interesse. {s.salesOpen ? (s.preQual?.approved ? '' : <>Bli <a href="#/forhandsgodkjenning">forhåndsgodkjent</a> for å kjøpe.</>) : `Vi varsler deg ved salgsstart ${PROJECT.salesStart}.`}</div>
            ) : (
              <button className="btn primary full big" onClick={() => { s.addInterests([u.id]); go(`/interesse/${u.id}`); }}>Meld interesse</button>
            )
          )}
          {s.salesOpen && !s.preQual?.approved && u.status === 'ledig' && (
            <p className="muted small">Salget er åpent. Kjøp krever forhåndsgodkjenning.</p>
          )}
          {u.status === 'solgt' && <p className="muted">Denne leiligheten er solgt. <a href="#/bygg">Se ledige</a></p>}
        </aside>
      </div>
    </div>
  );
}
