import { getPosition } from 'suncalc';
import { PROJECT, type Unit } from './data';

// Standarddato fra storyboardet: 10. mai.
export const DEFAULT_DATE = { month: 4, day: 10 };

export function dateAt(hour: number, month = DEFAULT_DATE.month, day = DEFAULT_DATE.day) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  // Norsk tid uavhengig av nettleserens tidssone (sommertid april–oktober).
  const offset = month >= 3 && month <= 9 ? 2 : 1;
  return new Date(Date.UTC(2027, month, day, h - offset, m));
}

export function sunPos(hour: number, month?: number, day?: number) {
  const p = getPosition(dateAt(hour, month, day), PROJECT.lat, PROJECT.lng);
  // suncalc v2 gir grader, og azimut som kompassretning (0 = nord).
  return { altitude: p.altitude, azimuth: (p.azimuth + 360) % 360 };
}

function angleDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export type SunState = 'sol' | 'skygge-nabo' | 'feil-retning' | 'natt';

/** Er det sol på balkongen? Lave etasjer skygges av nabobygg når sola står lavt. */
export function balconySun(unit: Unit, hour: number, month?: number, day?: number): SunState {
  const { altitude, azimuth } = sunPos(hour, month, day);
  if (altitude <= 0.5) return 'natt';
  if (angleDiff(azimuth, unit.azimuth) > 80) return 'feil-retning';
  const blockAngle = [0, 16, 12, 8, 5, 2][unit.floor] ?? 2;
  if (altitude < blockAngle) return 'skygge-nabo';
  return 'sol';
}

export function sunHours(unit: Unit, month?: number, day?: number) {
  let n = 0;
  for (let h = 3; h < 23; h += 0.25) if (balconySun(unit, h, month, day) === 'sol') n += 0.25;
  return n;
}

export function sunWindow(unit: Unit, month?: number, day?: number) {
  let first: number | null = null;
  let last: number | null = null;
  for (let h = 3; h < 23; h += 0.25) {
    if (balconySun(unit, h, month, day) === 'sol') {
      if (first === null) first = h;
      last = h + 0.25;
    }
  }
  return first === null ? null : { from: first, to: last! };
}

export const fmtHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};
