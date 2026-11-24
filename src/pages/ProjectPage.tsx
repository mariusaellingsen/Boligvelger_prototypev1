import { useState } from 'react';
import { FACILITIES, PROJECT, UNITS, mill, nok } from '../data';
import { EarthView3D, MapView2D } from '../components/SiteViews';
import { SunSlider } from '../components/SunSlider';
import { go } from '../store';

export function ProjectPage() {
  const [mode, setMode] = useState<'2d' | '3d'>('3d');
  const [hour, setHour] = useState(15.5);
  const free = UNITS.filter((u) => u.status === 'ledig');
  const from = Math.min(...free.map((u) => u.price));
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Nytt prosjekt · {PROJECT.area}</p>
          <h1>{PROJECT.name}</h1>
          <p className="lead">{PROJECT.description}</p>
          <ul className="facts">
            <li><strong>{PROJECT.units}</strong> leiligheter</li>
            <li><strong>{free.length}</strong> ledige</li>
            <li><strong>2–4</strong> rom</li>
            <li>Fra <strong>{mill(from)}</strong></li>
            <li>Innflytting <strong>{PROJECT.moveIn}</strong></li>
          </ul>
          <div className="cta-row">
            <button className="btn primary big" onClick={() => go('/bygg')}>Velg bolig</button>
            <span className="muted">Salgsstart {PROJECT.salesStart}. Meld interesse nå, så er du klar.</span>
          </div>
        </div>
        <div className="usp">
          <div><span>☀</span><strong>Se sola på din balkong</strong><p>Til alle tider av døgnet, for hver leilighet.</p></div>
          <div><span>💰</span><strong>Kjøp digitalt, spar meglergebyr</strong><p>Alt du trenger for å bestemme deg, uten å ringe megler. Du sparer {nok(PROJECT.meglerFeeSaved)}.</p></div>
          <div><span>⇄</span><strong>Sammenlign favorittene</strong><p>Side om side, med forskjellene markert.</p></div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Området</h2>
          <div className="toggle" role="tablist">
            <button className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}>2D kart</button>
            <button className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}>3D med sol</button>
          </div>
        </div>
        {mode === '2d' ? (
          <div className="split">
            <MapView2D />
            <ul className="facility-list">
              {FACILITIES.map((f) => (
                <li key={f.name}><span>{f.name}</span><span className="muted">{f.type} · {f.minutes} min</span></li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <EarthView3D hour={hour} />
            <SunSlider hour={hour} onChange={setHour} />
          </>
        )}
      </section>
    </div>
  );
}
