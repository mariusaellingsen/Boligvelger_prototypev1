import { useState } from 'react';
import { CHANGE_NOTICE, PROJECT, TIMELINE, unitById, mill, type Unit } from '../data';
import { go, useStore } from '../store';

export function MinBoligPage() {
  const s = useStore();
  const [showWhy, setShowWhy] = useState(false);
  const [notify, setNotify] = useState({ epost: true, push: true, sms: false });
  const interests = s.interests.map(unitById).filter(Boolean) as Unit[];
  const bought = s.order ? unitById(s.order.unitId) : null;
  const done = s.salesOpen || bought ? 1 : 0; // salgsstart passert i demoen
  const hasAnything = interests.length > 0 || bought;

  if (!hasAnything)
    return (
      <div className="page narrow"><div className="card empty">
        <h1>Min bolig</h1>
        <p>Her samler vi boligene du har meldt interesse for, forhåndsgodkjenning, dokumenter og nyheter om byggingen.</p>
        <button className="btn primary" onClick={() => go('/bygg')}>Finn en bolig</button>
      </div></div>
    );

  return (
    <div className="page min-bolig">
      <section className="card">
        <h1>Min bolig · {PROJECT.name}</h1>
        {(s.salesOpen || bought) && (
          <div className="notice">
            <strong>Endring {CHANGE_NOTICE.date}: {CHANGE_NOTICE.title}</strong>
            {showWhy ? <p>{CHANGE_NOTICE.body}</p> : <button className="link" onClick={() => setShowWhy(true)}>Hvorfor?</button>}
          </div>
        )}
        <h3>Fremdrift</h3>
        <ol className="timeline">
          {TIMELINE.map((t, i) => (
            <li key={t.name} className={i < done ? 'done' : i === done ? 'current' : ''}>
              <span className="dot" />
              <strong>{t.name}</strong>
              <span className="muted small">{t.name === 'Innflytting' && (s.salesOpen || bought) ? <><s>Q1 2028</s> {t.date}</> : t.date}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="two-col">
        <section className="card">
          {bought ? (
            <>
              <h2>Din bolig: {bought.id}</h2>
              <p>{bought.rooms} rom · {bought.bra} m² · {bought.floor}. etg · reservert</p>
              <h3>Dokumenter</h3>
              <ul className="docs">
                <li><span>Kjøpekontrakt</span><button className="btn primary small">Signer med BankID</button></li>
                <li><span>Leveransebeskrivelse</span><button className="link">Åpne</button></li>
                <li><span>Tilvalg og pris</span><button className="link">Åpne</button></li>
                <li><span>Kvittering depositum</span><button className="link">Åpne</button></li>
              </ul>
            </>
          ) : (
            <>
              <h2>Boliger du har meldt interesse for</h2>
              <div className="fav-list">
                {interests.map((u) => (
                  <div key={u.id} className="fav-item">
                    <div className="fav-main" onClick={() => go(`/leilighet/${u.id}`)}>
                      <strong>{u.id}</strong> · {u.rooms} rom · {u.bra} m² · {mill(u.price)}
                      <div><span className={`status ${u.status}`}>{u.status}</span></div>
                    </div>
                    {s.salesOpen && s.preQual?.approved && u.status === 'ledig' ? (
                      <button className="btn primary small" onClick={() => go(`/kjop/${u.id}`)}>Kjøp</button>
                    ) : (
                      <button className="link" onClick={() => s.removeInterest(u.id)}>Trekk</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="muted small">{s.salesOpen ? 'Salget er åpent.' : `Salget åpner ${PROJECT.salesStart}. Vi varsler deg.`}</p>
            </>
          )}
        </section>

        <section className="card">
          <h2>Klar til salgsstart</h2>
          {s.preQual?.approved ? (
            <div className="note ok">✓ Du er forhåndsgodkjent. Lånebevis: {s.preQual.fileName}</div>
          ) : (
            <>
              <p>Bli forhåndsgodkjent for å kunne kjøpe digitalt med én gang salget åpner. Frivillig.</p>
              <button className="btn primary" onClick={() => go('/forhandsgodkjenning')}>Bli forhåndsgodkjent</button>
            </>
          )}
          <h3>Varsler</h3>
          {(['epost', 'push', 'sms'] as const).map((k) => (
            <label key={k} className="check block">
              <input type="checkbox" checked={notify[k]} onChange={(e) => setNotify({ ...notify, [k]: e.target.checked })} />
              {k === 'epost' ? 'E-post' : k === 'push' ? 'Push-varsel i appen' : 'SMS'} ved salgsstart og endringer i prosjektet
            </label>
          ))}
          <p className="muted small">Har du spørsmål? Alt om boligen skal stå her, men du kan alltid <button className="link small">kontakte selger</button>.</p>
        </section>
      </div>
      <p className="center"><button className="link small" onClick={() => { s.reset(); go('/'); }}>Nullstill demoen</button></p>
    </div>
  );
}
