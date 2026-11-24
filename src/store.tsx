import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface PreQual {
  consentSalary: boolean;
  consentCredit: boolean;
  fileName: string | null;
  approved: boolean;
}

export interface Order {
  unitId: string;
  tilvalg: Record<string, string[]>;
  total: number;
  method: 'vipps' | 'kort';
  at: string;
}

interface State {
  favorites: string[];
  compare: string[];
  interests: string[];
  preQual: PreQual | null;
  salesOpen: boolean;
  order: Order | null;
}

const EMPTY: State = { favorites: [], compare: [], interests: [], preQual: null, salesOpen: false, order: null };
const KEY = 'boligvelger-prototype-v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

function useStoreValue() {
  const [s, set] = useState<State>(load);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(s)), [s]);
  return {
    ...s,
    toggleFavorite: (id: string) => set((p) => ({ ...p, favorites: toggle(p.favorites, id) })),
    toggleCompare: (id: string) =>
      set((p) => ({ ...p, compare: p.compare.includes(id) ? p.compare.filter((x) => x !== id) : [...p.compare, id].slice(-3) })),
    setCompare: (ids: string[]) => set((p) => ({ ...p, compare: ids.slice(0, 3) })),
    addInterests: (ids: string[]) => set((p) => ({ ...p, interests: Array.from(new Set([...p.interests, ...ids])) })),
    removeInterest: (id: string) => set((p) => ({ ...p, interests: p.interests.filter((x) => x !== id) })),
    setPreQual: (q: PreQual) => set((p) => ({ ...p, preQual: q })),
    setSalesOpen: (v: boolean) => set((p) => ({ ...p, salesOpen: v })),
    placeOrder: (o: Order) => set((p) => ({ ...p, order: o })),
    reset: () => set(EMPTY),
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider mangler');
  return v;
}

// Enkel hash-ruter: #/bygg, #/leilighet/4C, ...
export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] ?? '', param: parts[1] };
}

export const go = (path: string) => {
  window.location.hash = path;
};
