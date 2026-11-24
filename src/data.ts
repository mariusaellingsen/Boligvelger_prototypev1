// Fiktive testdata for prototypen. Ingen ekte EIER-data.

export type Direction = 'Vest' | 'Sør' | 'Øst';
export type Status = 'ledig' | 'reservert' | 'solgt';

export interface Unit {
  id: string; // f.eks. "4C"
  floor: number;
  letter: string;
  rooms: number;
  bedrooms: number;
  bra: number; // m²
  balcony: number; // m²
  direction: Direction;
  azimuth: number; // balkongens kompassretning i grader (0 = nord)
  price: number; // totalpris (innskudd + fellesgjeld)
  innskudd: number;
  fellesgjeld: number;
  monthlyCost: number; // felleskostnader per mnd
  status: Status;
  view: string;
  parking: boolean;
  bod: number; // m²
}

export const PROJECT = {
  name: 'Solhagen borettslag',
  area: 'Ensjø, Oslo',
  lat: 59.913,
  lng: 10.79,
  moveIn: 'Q1 2028',
  salesStart: '15. januar 2027',
  units: 25,
  meglerFeeSaved: 50000,
  deposit: 10000,
  description:
    'Fem etasjer med lyse leiligheter, vestvendte balkonger mot parken og fem minutter til T-banen.',
};

const TYPES: Record<string, Omit<Unit, 'id' | 'floor' | 'letter' | 'price' | 'innskudd' | 'fellesgjeld' | 'monthlyCost' | 'status' | 'view' | 'parking'>> = {
  A: { rooms: 2, bedrooms: 1, bra: 52, balcony: 7, direction: 'Vest', azimuth: 265, bod: 4 },
  B: { rooms: 2, bedrooms: 1, bra: 49, balcony: 6, direction: 'Vest', azimuth: 248, bod: 3 },
  C: { rooms: 2, bedrooms: 1, bra: 54, balcony: 8, direction: 'Vest', azimuth: 275, bod: 4 },
  D: { rooms: 3, bedrooms: 2, bra: 74, balcony: 9, direction: 'Øst', azimuth: 90, bod: 5 },
  E: { rooms: 4, bedrooms: 3, bra: 96, balcony: 12, direction: 'Sør', azimuth: 180, bod: 6 },
};

const STATUS: Record<string, Status> = {
  '1A': 'solgt', '1B': 'solgt', '1C': 'reservert', '1D': 'ledig', '1E': 'solgt',
  '2A': 'solgt', '2B': 'ledig', '2C': 'reservert', '2D': 'solgt', '2E': 'ledig',
  '3A': 'ledig', '3B': 'solgt', '3C': 'solgt', '3D': 'ledig', '3E': 'reservert',
  '4A': 'solgt', '4B': 'reservert', '4C': 'ledig', '4D': 'ledig', '4E': 'solgt',
  '5A': 'solgt', '5B': 'solgt', '5C': 'solgt', '5D': 'reservert', '5E': 'ledig',
};

const VIEWS = ['Gårdsrom', 'Gårdsrom og park', 'Parken', 'Parken og åsen', 'Åpen utsikt over byen'];

function roundTo(n: number, step: number) {
  return Math.round(n / step) * step;
}

export const UNITS: Unit[] = [];
for (let floor = 1; floor <= 5; floor++) {
  for (const letter of ['A', 'B', 'C', 'D', 'E']) {
    const t = TYPES[letter];
    const perM2 = 86000 + floor * 2700 + (t.direction === 'Øst' ? -3000 : 0);
    const price = roundTo(t.bra * perM2, 10000);
    const innskudd = roundTo(price * 0.3, 10000);
    const fellesgjeld = price - innskudd;
    const monthlyCost = roundTo(t.bra * 40 + fellesgjeld * 0.0025, 50);
    UNITS.push({
      ...t,
      id: `${floor}${letter}`,
      floor,
      letter,
      price,
      innskudd,
      fellesgjeld,
      monthlyCost,
      status: STATUS[`${floor}${letter}`],
      view: t.direction === 'Øst' ? 'Gårdsrom' : VIEWS[floor - 1],
      parking: t.rooms >= 3,
    });
  }
}

export const unitById = (id: string) => UNITS.find((u) => u.id === id);

export interface TilvalgOption { name: string; price: number }
export interface TilvalgGroup { id: string; name: string; options: TilvalgOption[]; multi?: boolean }

export const TILVALG: TilvalgGroup[] = [
  { id: 'kjokken', name: 'Kjøkken', options: [
    { name: 'Standard hvit', price: 0 }, { name: 'Eik med kvartsplate', price: 45000 }, { name: 'Mørk grønn', price: 38000 } ] },
  { id: 'gulv', name: 'Gulv', options: [
    { name: 'Lys eik', price: 0 }, { name: 'Mørk eik', price: 18000 }, { name: 'Fiskebein', price: 32000 } ] },
  { id: 'bad', name: 'Bad', options: [
    { name: 'Standard', price: 0 }, { name: 'Storformat flis', price: 22000 } ] },
  { id: 'ekstra', name: 'Ekstra', multi: true, options: [
    { name: 'Parkeringsplass i garasje', price: 350000 }, { name: 'Ekstra sportsbod', price: 60000 }, { name: 'Elbillader', price: 25000 } ] },
];

export const FACILITIES = [
  { name: 'Ensjø T-bane', type: 'T-bane', minutes: 5, x: 78, y: 30 },
  { name: 'Ensjø skole', type: 'Skole', minutes: 7, x: 22, y: 22 },
  { name: 'Barnehage', type: 'Barnehage', minutes: 3, x: 34, y: 70 },
  { name: 'Kiwi', type: 'Butikk', minutes: 4, x: 70, y: 72 },
  { name: 'Ensjøparken', type: 'Park', minutes: 1, x: 18, y: 50 },
  { name: 'Treningssenter', type: 'Trening', minutes: 6, x: 86, y: 56 },
];

export const TIMELINE = [
  { name: 'Salgsstart', date: 'Jan 2027' },
  { name: 'Byggestart', date: 'Apr 2027' },
  { name: 'Råbygg', date: 'Des 2027' },
  { name: 'Tett bygg', date: 'Apr 2028' },
  { name: 'Innflytting', date: 'Q2 2028' },
];

export const CHANGE_NOTICE = {
  date: '12.03.2027',
  title: 'Innflytting flyttet fra Q1 til Q2 2028',
  body: 'Grunnarbeidet tok seks uker lenger enn planlagt på grunn av fjell i grunnen. Ingen endring i pris eller tilvalg. Du kan trekke reservasjonen uten kostnad innen 14 dager.',
};

export const nok = (n: number) => n.toLocaleString('nb-NO') + ' kr';
export const num = (n: number) => n.toLocaleString('nb-NO', { maximumFractionDigits: 2 });
export const mill = (n: number) => (n / 1_000_000).toLocaleString('nb-NO', { maximumFractionDigits: 2 }) + ' mill.';
