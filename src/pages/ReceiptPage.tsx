import { PROJECT, unitById, nok } from '../data';
import { go, useStore } from '../store';

export function ReceiptPage() {
  const s = useStore();
  const o = s.order;
  const u = o && unitById(o.unitId);
  if (!o || !u) return <div className="page">Ingen bestilling ennå.</div>;
  return (
    <div className="page narrow">
      <div className="card center">
        <div className="big-check">✓</div>
        <h1>Leilighet {u.id} er reservert til deg</h1>
        <p className="lead">Depositum {nok(PROJECT.deposit)} er betalt med {o.method === 'vipps' ? 'Vipps' : 'kort'}.</p>
        <dl className="costs inline">
          <dt>Totalpris</dt><dd>{nok(o.total)}</dd>
          <dt>Spart meglergebyr</dt><dd className="good">{nok(PROJECT.meglerFeeSaved)}</dd>
          <dt>Estimert innflytting</dt><dd>{PROJECT.moveIn}</dd>
        </dl>
      </div>
      <div className="card">
        <h2>Neste steg</h2>
        <ol className="next">
          <li><strong>Signer kjøpekontrakten med BankID</strong> innen 7 dager. Den ligger i Min bolig.</li>
          <li>Du kan endre tilvalg frem til tilvalgsfristen.</li>
          <li>Vi holder deg oppdatert om byggingen i Min bolig og på e-post.</li>
        </ol>
        <button className="btn primary big" onClick={() => go('/min-bolig')}>Gå til Min bolig</button>
      </div>
    </div>
  );
}
