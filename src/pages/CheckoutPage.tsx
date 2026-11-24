import { Fragment, useState } from 'react';
import { PROJECT, TILVALG, unitById, nok } from '../data';
import { go, useStore } from '../store';

export function CheckoutPage({ id }: { id: string }) {
  const u = unitById(id);
  const s = useStore();
  const [sel, setSel] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(TILVALG.map((g) => [g.id, g.multi ? [] : [g.options[0].name]])));
  const [paying, setPaying] = useState<null | 'vipps' | 'kort'>(null);
  if (!u) return <div className="page">Fant ikke leiligheten.</div>;
  if (!s.salesOpen || !s.preQual?.approved)
    return (
      <div className="page narrow"><div className="card">
        <h1>Kjøp er ikke åpent ennå</h1>
        <p>{!s.salesOpen ? `Salget åpner ${PROJECT.salesStart}.` : 'Du må være forhåndsgodkjent for å kjøpe digitalt.'}</p>
        <button className="btn primary" onClick={() => go(s.salesOpen ? '/forhandsgodkjenning' : `/leilighet/${u.id}`)}>{s.salesOpen ? 'Bli forhåndsgodkjent' : 'Tilbake'}</button>
      </div></div>
    );

  const lines = TILVALG.flatMap((g) => sel[g.id].map((name) => ({ group: g.name, ...g.options.find((o) => o.name === name)! })));
  const extra = lines.reduce((a, l) => a + l.price, 0);
  const total = u.price + extra;

  const pick = (gid: string, name: string, multi?: boolean) =>
    setSel((p) => ({ ...p, [gid]: multi ? (p[gid].includes(name) ? p[gid].filter((x) => x !== name) : [...p[gid], name]) : [name] }));

  const pay = (method: 'vipps' | 'kort') => {
    setPaying(method);
    setTimeout(() => {
      s.placeOrder({ unitId: u.id, tilvalg: sel, total, method, at: new Date().toISOString() });
      go('/kvittering');
    }, 1800);
  };

  return (
    <div className="page checkout">
      <section className="card">
        <div className="crumbs"><a href={`#/leilighet/${u.id}`}>← Leilighet {u.id}</a></div>
        <h1>Tilpass leilighet {u.id}</h1>
        <p className="muted">Velg tilvalg nå, eller senere i Min bolig frem til tilvalgsfristen.</p>
        {TILVALG.map((g) => (
          <div key={g.id} className="tv-group">
            <h3>{g.name}{g.multi && <span className="muted small"> · velg flere</span>}</h3>
            <div className="tv-options">
              {g.options.map((o) => {
                const on = sel[g.id].includes(o.name);
                const disabled = o.name.startsWith('Parkering') && u.parking;
                return (
                  <button key={o.name} disabled={disabled} className={`tv-option ${on ? 'on' : ''}`} onClick={() => pick(g.id, o.name, g.multi)}>
                    <span>{o.name}</span>
                    <span className="muted">{disabled ? 'Inkludert' : o.price ? `+ ${nok(o.price)}` : 'Inkludert'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <aside className="card order-summary">
        <h2>Oppsummering</h2>
        <dl className="costs">
          <dt>Leilighet {u.id}</dt><dd>{nok(u.price)}</dd>
          {lines.filter((l) => l.price > 0).map((l) => (<Fragment key={l.name}><dt>{l.group}: {l.name}</dt><dd>+ {nok(l.price)}</dd></Fragment>))}
          <dt className="total">Totalpris</dt><dd className="total">{nok(total)}</dd>
          <dt>herav innskudd</dt><dd>{nok(u.innskudd + extra)}</dd>
          <dt>herav fellesgjeld</dt><dd>{nok(u.fellesgjeld)}</dd>
          <dt className="good">Spart meglergebyr</dt><dd className="good">{nok(PROJECT.meglerFeeSaved)}</dd>
        </dl>
        <div className="due">
          <span>Til forfall i dag (depositum)</span>
          <strong>{nok(PROJECT.deposit)}</strong>
        </div>
        <p className="muted small">Estimert innflytting {PROJECT.moveIn}. Depositumet trekkes fra innskuddet. Du signerer kontrakten med BankID innen 7 dager, og kan angre uten kostnad til da.</p>
        <button className="btn vipps full big" disabled={!!paying} onClick={() => pay('vipps')}>{paying === 'vipps' ? 'Venter på Vipps …' : 'Bestill med Vipps'}</button>
        <button className="btn secondary full" disabled={!!paying} onClick={() => pay('kort')}>{paying === 'kort' ? 'Behandler kort …' : 'Bestill med kort'}</button>
        <p className="muted small center">Prototype: ingen betaling skjer.</p>
      </aside>
    </div>
  );
}
