import { create } from 'zustand';
import { todaysMeals as seedMeals, type DemoMealEntry } from '../lib/demoData';
import type { MealType } from '../types/database';

export interface LoggedEntry extends DemoMealEntry {
  id: string;
}

type EntriesByMeal = Record<MealType, LoggedEntry[]>;

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function emptyEntries(): EntriesByMeal {
  return { breakfast: [], lunch: [], dinner: [], snack: [] };
}

function seedEntries(): EntriesByMeal {
  const entries = emptyEntries();
  seedMeals.forEach((m) => {
    entries[m.meal] = m.entries.map((e, i) => ({ ...e, id: `seed-${m.meal}-${i}` }));
  });
  return entries;
}

function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface NutritionStore {
  dateKey: string;
  entries: EntriesByMeal;
  addEntry: (meal: MealType, entry: DemoMealEntry) => void;
  removeEntry: (meal: MealType, id: string) => void;
  checkMidnightReset: () => void;
}

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  dateKey: dateKey(),
  entries: seedEntries(),

  addEntry: (meal, entry) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [meal]: [...state.entries[meal], { ...entry, id: makeId() }],
      },
    })),

  removeEntry: (meal, id) =>
    set((state) => ({
      entries: { ...state.entries, [meal]: state.entries[meal].filter((e) => e.id !== id) },
    })),

  checkMidnightReset: () => {
    const key = dateKey();
    if (key !== get().dateKey) {
      set({ dateKey: key, entries: emptyEntries() });
    }
  },
}));

export function dailyTotalsFromEntries(entries: EntriesByMeal) {
  const all = MEAL_TYPES.flatMap((m) => entries[m]);
  return {
    caloriesConsumed: all.reduce((sum, e) => sum + e.calories, 0),
    proteinG: all.reduce((sum, e) => sum + e.proteinG, 0),
    carbsG: all.reduce((sum, e) => sum + e.carbsG, 0),
    fatG: all.reduce((sum, e) => sum + e.fatG, 0),
  };
}

// Schedules a check at the next local midnight, then reschedules itself.
// Call once, e.g. from the root layout, so it keeps running app-wide.
// checkMidnightReset() is also called on Nutrition-screen mount to cover
// the case where the app was closed/backgrounded across midnight (a JS
// timer set the previous day wouldn't survive that).
export function scheduleMidnightReset(): () => void {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  const timeout = setTimeout(() => {
    useNutritionStore.getState().checkMidnightReset();
    scheduleMidnightReset();
  }, nextMidnight.getTime() - now.getTime());
  return () => clearTimeout(timeout);
}
