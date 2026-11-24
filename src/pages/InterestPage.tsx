import { PROJECT } from '../data';
import { go, useStore } from '../store';

export function InterestPage({ ids }: { ids: string }) {
  const s = useStore();
  const list = ids ? ids.split(',') : s.interests;
  return (
    <div className="page narrow">
      <div className="card center">
        <div className="big-check">✓</div>
        <h1>Interesse registrert for {list.join(', ')}</h1>
        <p className="lead">Salget åpner {PROJECT.salesStart}. Vi varsler deg på e-post og i Min bolig.</p>
        <p>Du forplikter deg ikke til noe ved å melde interesse.</p>
      </div>
      <div className="card">
        <h2>Vil du være klar til å kjøpe med én gang ved salgsstart?</h2>
        <p>
          Blir du forhåndsgodkjent nå, kan du kjøpe digitalt med noen få trykk når salget åpner, før andre rekker å ringe megler.
          Det er <strong>helt frivillig</strong>, og du kan trekke samtykket når som helst.
        </p>
        <ul className="ticks">
          <li>Samtykke til lønnsinfo og kredittsjekk</li>
          <li>Last opp lånebevis (finansieringsbevis) fra banken din</li>
          <li>Tar ca. 2 minutter</li>
        </ul>
        <div className="row">
          {s.preQual?.approved ? (
            <span className="note ok">✓ Du er allerede forhåndsgodkjent.</span>
          ) : (
            <button className="btn primary" onClick={() => go('/forhandsgodkjenning')}>Bli forhåndsgodkjent</button>
          )}
          <button className="btn secondary" onClick={() => go('/min-bolig')}>Gå til Min bolig</button>
          <button className="link" onClick={() => go('/bygg')}>Fortsett å se på boliger</button>
        </div>
      </div>
    </div>
  );
}
