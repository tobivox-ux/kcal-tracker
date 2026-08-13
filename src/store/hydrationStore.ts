import { create } from 'zustand';

export interface DrinkOption {
  id: string;
  label: string;
  emoji: string;
  defaultMl: number;
  // Zählt zur Flüssigkeitsbilanz. Kalorien werden separat über den
  // Ernährungs-Store geloggt (Cola/Monster stehen dort in der Lebensmittel-DB),
  // damit sie nicht doppelt in der Tagesbilanz landen.
  kcalPer100ml: number;
}

export const DRINK_OPTIONS: DrinkOption[] = [
  { id: 'water', label: 'Wasser', emoji: '💧', defaultMl: 250, kcalPer100ml: 0 },
  { id: 'water-bottle', label: 'Flasche', emoji: '🍶', defaultMl: 500, kcalPer100ml: 0 },
  { id: 'coffee', label: 'Kaffee', emoji: '☕', defaultMl: 200, kcalPer100ml: 2 },
  { id: 'cola', label: 'Cola', emoji: '🥤', defaultMl: 330, kcalPer100ml: 42 },
  { id: 'cola-zero', label: 'Cola Zero', emoji: '🖤', defaultMl: 330, kcalPer100ml: 0.3 },
  { id: 'monster', label: 'Monster', emoji: '⚡', defaultMl: 500, kcalPer100ml: 47 },
  { id: 'monster-ultra', label: 'Monster Ultra', emoji: '🤍', defaultMl: 500, kcalPer100ml: 3 },
  { id: 'juice', label: 'Saft', emoji: '🧃', defaultMl: 250, kcalPer100ml: 46 },
];

export interface DrinkEntry {
  id: string;
  drinkId: string;
  label: string;
  emoji: string;
  ml: number;
  kcal: number;
}

// 35 ml pro kg Körpergewicht ist die gängige Faustregel; bei 72 kg sind das
// gut 2,5 l. Trainingstage brauchen eher mehr — deshalb bewusst nicht zu
// niedrig angesetzt.
export const DAILY_HYDRATION_TARGET_ML = 3000;

function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface HydrationStore {
  dateKey: string;
  entries: DrinkEntry[];
  addDrink: (drinkId: string, ml?: number) => void;
  removeDrink: (id: string) => void;
  checkMidnightReset: () => void;
}

export const useHydrationStore = create<HydrationStore>((set, get) => ({
  dateKey: dateKey(),
  entries: [],

  addDrink: (drinkId, ml) => {
    const drink = DRINK_OPTIONS.find((d) => d.id === drinkId);
    if (!drink) return;
    const amount = ml ?? drink.defaultMl;
    set((state) => ({
      entries: [
        ...state.entries,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          drinkId,
          label: drink.label,
          emoji: drink.emoji,
          ml: amount,
          kcal: Math.round((drink.kcalPer100ml * amount) / 100),
        },
      ],
    }));
  },

  removeDrink: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

  checkMidnightReset: () => {
    const key = dateKey();
    if (key !== get().dateKey) set({ dateKey: key, entries: [] });
  },
}));

export function totalMl(entries: DrinkEntry[]): number {
  return entries.reduce((sum, e) => sum + e.ml, 0);
}
