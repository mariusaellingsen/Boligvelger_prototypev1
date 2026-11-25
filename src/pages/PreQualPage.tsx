import { useState } from 'react';
import { go, useStore } from '../store';

export function PreQualPage() {
  const s = useStore();
  const [salary, setSalary] = useState(s.preQual?.consentSalary ?? false);
  const [credit, setCredit] = useState(s.preQual?.consentCredit ?? false);
  const [file, setFile] = useState<string | null>(s.preQual?.fileName ?? null);
  const [checking, setChecking] = useState(false);
  const ready = salary && credit && file;

  const submit = () => {
    setChecking(true);
    setTimeout(() => {
      s.setPreQual({ consentSalary: salary, consentCredit: credit, fileName: file, approved: true });
      go('/min-bolig');
    }, 1400);
  };

  return (
    <div className="page narrow">
      <div className="card">
        <p className="eyebrow">Frivillig · tar ca. 2 minutter</p>
        <h1>Bli forhåndsgodkjent</h1>
        <p>Når du er forhåndsgodkjent kan du kjøpe digitalt med én gang salget åpner. Opplysningene brukes bare til dette, og deles ikke med megler.</p>

        <h3>1. Samtykke</h3>
        <label className="check block"><input type="checkbox" checked={salary} onChange={(e) => setSalary(e.target.checked)} /> Jeg samtykker til at Boligvelgeren henter lønnsinformasjon fra Skatteetaten.</label>
        <label className="check block"><input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} /> Jeg samtykker til en kredittsjekk.</label>

        <h3>2. Lånebevis</h3>
        <label className="upload">
          <input type="file" accept=".pdf,.png,.jpg" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
          {file ? <span>{file} ✓</span> : <span>Last opp finansieringsbevis fra banken (PDF eller bilde)</span>}
        </label>
        <button className="link small" onClick={() => setFile('finansieringsbevis-eksempel.pdf')}>Bruk eksempelfil</button>
        <p className="muted small">Prototype: ingenting sendes noe sted, og filen forlater ikke nettleseren. Bare filnavnet lagres.</p>

        <div className="row">
          <button className="btn primary big" disabled={!ready || checking} onClick={submit}>
            {checking ? 'Sjekker …' : 'Send inn og bli forhåndsgodkjent'}
          </button>
          <button className="link" onClick={() => go('/min-bolig')}>Ikke nå</button>
        </div>
      </div>
    </div>
  );
}
