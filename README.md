# Boligvelgeren – prototype

Klikkbar desktop-prototype av boligvelgeren for casen **Boligvelgeren (EIER AS)** i PRO203 Smidig prosjekt. Bygget fra storyboardet i designsprinten. Dokumentasjon, beslutninger og omfang ligger i [kremflote/Borettslaget](https://github.com/kremflote/Borettslaget) under `docs/design-sprint/`.

Alle data er fiktive. Ingen betaling, kredittsjekk eller opplasting skjer.

## Kjør lokalt

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # statisk bygg i dist/
```

Laget for desktop (1440 px). Mobil kommer senere.

## Flyt (storyboardet)

1. **Prosjektside**: nøkkelinfo og området i 2D (kart med fasiliteter) eller 3D (sollinje på himmelen, tidsslider).
2. **Byggvisning**: fasaden som et kinosalkart (ledig/reservert/solgt), filter og «Dine 3 beste treff». Eksempelfilteret gir 4C, 3A og 2B.
3. **Leilighet**: plantegning med mål og 4 faste møbleringer, sol og utsikt fra balkongen med tidsslider, kostnader og spart meglergebyr.
4. **Sammenlign**: opptil 3 side om side, beste verdi markert.
5. **Meld interesse**, deretter frivillig **forhåndsgodkjenning** (samtykke og lånebevis).
6. **Salgsstart** (demobryter øverst til høyre) → **quick checkout** med tilvalg og depositum (Vipps/kort) → kvittering.
7. **Min bolig**: interesser, forhåndsgodkjenning, dokumenter, fremdrift og endringsvarsel.

«Nullstill demoen» nederst i Min bolig tømmer lagret tilstand (localStorage).

## Teknisk

React 19 + TypeScript + Vite. Solposisjon beregnes med [`suncalc`](https://github.com/mourner/suncalc) for Ensjø, Oslo, 10. mai, i norsk tid. Balkongsol: sola må stå innenfor ±80° av balkongens retning, og lave etasjer skygges av nabobygg når sola står lavt (forenkling).

| Fil | Innhold |
| --- | --- |
| `src/data.ts` | Prosjekt, 25 leiligheter, tilvalg, fasiliteter, fremdrift |
| `src/sun.ts` | Solmodell |
| `src/store.tsx` | Tilstand (favoritter, sammenligning, interesser, forhåndsgodkjenning, ordre) og hash-ruter |
| `src/components/` | Fasade, 2D/3D-visning, plantegning, balkongvisning, tidsslider, toppmeny |
| `src/pages/` | Én fil per skjerm |
