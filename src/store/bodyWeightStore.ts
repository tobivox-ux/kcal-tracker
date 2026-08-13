import { create } from 'zustand';
import { bodyWeightHistory, type DemoWeightEntry } from '../lib/demoData';

function todayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

interface BodyWeightStore {
  entries: DemoWeightEntry[];
  addEntry: (weightKg: number) => void;
}

export const useBodyWeightStore = create<BodyWeightStore>((set) => ({
  entries: bodyWeightHistory,

  // Ein zweiter Eintrag am selben Tag ersetzt den ersten (z.B. korrigiert),
  // statt die Kurve mit Duplikaten zu verzerren.
  addEntry: (weightKg) =>
    set((state) => {
      const label = todayLabel();
      const withoutToday = state.entries.filter((e) => e.label !== label);
      return { entries: [...withoutToday, { label, weightKg }] };
    }),
}));
