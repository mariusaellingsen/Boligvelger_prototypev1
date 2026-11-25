import { PROJECT } from '../data';
import { go, useRoute, useStore } from '../store';

const STEPS = [
  { key: 'utforsk', label: 'Utforsk', pages: ['', 'bygg', 'leilighet', 'sammenlign', 'favoritter'] },
  { key: 'interesse', label: 'Meld interesse', pages: ['interesse'] },
  { key: 'klar', label: 'Bli klar til salgsstart', pages: ['forhandsgodkjenning', 'min-bolig'] },
  { key: 'kjop', label: 'Kjøp', pages: ['kjop', 'kvittering'] },
];

export function Header() {
  const s = useStore();
  const { page } = useRoute();
  const stepIdx = Math.max(0, STEPS.findIndex((st) => st.pages.includes(page)));
  return (
    <header className="header">
      <div className="header-top">
        <a className="logo" href="#/">{PROJECT.name}</a>
        <nav className="nav">
          <a href="#/bygg" className={page === 'bygg' ? 'active' : ''}>Velg bolig</a>
          <a href="#/sammenlign" className={page === 'sammenlign' ? 'active' : ''}>
            Sammenlign <span className="badge">{s.compare.length}</span>
          </a>
          <a href="#/favoritter" className={page === 'favoritter' ? 'active' : ''}>
            ♡ Favoritter <span className="badge">{s.favorites.length}</span>
          </a>
          <a href="#/min-bolig" className={page === 'min-bolig' ? 'active' : ''}>
            Min bolig {s.interests.length > 0 && <span className="badge accent">{s.interests.length}</span>}
          </a>
        </nav>
        <label className="demo-switch" title="Kun for testing: simulerer at salget har åpnet">
          <input type="checkbox" checked={s.salesOpen} onChange={(e) => s.setSalesOpen(e.target.checked)} />
          <span className="switch" />
          <span>Demo: {s.salesOpen ? 'salget er åpent' : `salgsstart ${PROJECT.salesStart}`}</span>
        </label>
      </div>
      <ol className="steps">
        {STEPS.map((st, i) => (
          <li key={st.key} className={i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}>
            <span className="dot">{i < stepIdx ? '✓' : i + 1}</span> {st.label}
          </li>
        ))}
      </ol>
      {s.salesOpen && !s.order && page !== 'kjop' && page !== 'kvittering' && (
        <div className="sales-banner">
          Salget har åpnet.{' '}
          {s.preQual?.approved
            ? s.interests.length > 0
              ? <>Du er forhåndsgodkjent og kan kjøpe boligene du har meldt interesse for. <button className="link" onClick={() => go('/min-bolig')}>Gå til Min bolig →</button></>
              : <>Du er forhåndsgodkjent. Velg en bolig og trykk «Kjøp».</>
            : <>For å kjøpe digitalt må du være forhåndsgodkjent. <button className="link" onClick={() => go('/forhandsgodkjenning')}>Bli forhåndsgodkjent →</button></>}
        </div>
      )}
    </header>
  );
}
