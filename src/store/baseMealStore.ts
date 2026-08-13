import { create } from 'zustand';
import { baseMeals as seedBaseMeals, type BaseMeal } from '../lib/demoData';

export type NewBaseMeal = Omit<BaseMeal, 'id'>;

interface BaseMealStore {
  meals: BaseMeal[];
  addMeal: (meal: NewBaseMeal) => void;
  removeMeal: (id: string) => void;
}

export const useBaseMealStore = create<BaseMealStore>((set) => ({
  meals: seedBaseMeals,

  addMeal: (meal) =>
    set((state) => ({
      meals: [...state.meals, { ...meal, id: `base-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
    })),

  removeMeal: (id) => set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
}));
