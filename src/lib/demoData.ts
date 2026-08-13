// Placeholder / example data used until a Supabase project is connected
// and the user's real training plan + macro targets are entered.
// Split: 4x/week Push-Pull. Phase: Cutting.

import type { MealType, PhaseType } from '../types/database';

// Berechnet mit Mifflin-St Jeor (72kg, 170cm, 17 Jahre, männlich):
// BMR = 10*72 + 6.25*170 - 5*17 + 5 = 1702.5 kcal
// TDEE = BMR * 1.55 (moderate Aktivität: ~7.000 Schritte/Tag + 4x
// Krafttraining/Woche) = 2639 kcal
// Cutting-Defizit bewusst konservativ (15% statt der für Erwachsene
// üblichen 20%), da mit 17 potenziell noch im Wachstum -> 2250 kcal.
// Protein 2.0g/kg (144g), Fett ~26% der Kalorien (65g) für Hormone/
// Wachstum, Rest als Carbs (272g) für Energie/Regeneration.
export const activePhase = {
  name: 'Cutting Phase',
  type: 'cutting' as PhaseType,
  calorieTarget: 2250,
  proteinTargetG: 144,
  carbsTargetG: 272,
  fatTargetG: 65,
};

// Muss zur Summe der Einträge in `todaysMeals` weiter unten passen.
export const today = {
  caloriesConsumed: 1065,
  proteinG: 128,
  carbsG: 88,
  fatG: 34,
};

// Streaks werden aus den Log-Daten abgeleitet (aufeinanderfolgende Tage mit
// Food-Log-Eintrag bzw. aufeinanderfolgende Wochen mit allen geplanten
// Workouts absolviert) statt in einer eigenen Tabelle gespeichert.
export const streaks = {
  trainingWeeks: 5,
  loggingDays: 12,
};

export interface Achievement {
  emoji: string;
  title: string;
  subtitle: string;
}

export const recentAchievements: Achievement[] = [
  { emoji: '🔥', title: '12 Tage Streak', subtitle: 'Täglich geloggt' },
  { emoji: '🏆', title: 'Neuer PR', subtitle: 'Bankdrücken 82,5 kg' },
  { emoji: '💪', title: '20 Workouts', subtitle: 'Seit Phasenstart' },
  { emoji: '🎯', title: 'Protein-Woche', subtitle: '7/7 Tage Ziel erreicht' },
];

export interface DemoExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  lastWeightKg: number;
  done: boolean;
}

export const todaysRoutineDay = {
  routineName: 'Push / Pull (4x/Woche)',
  dayLabel: 'Push A',
  exercises: [
    { name: 'Bankdrücken', targetSets: 4, targetReps: '6-8', lastWeightKg: 80, done: true },
    { name: 'Schulterdrücken', targetSets: 3, targetReps: '8-10', lastWeightKg: 45, done: true },
    { name: 'Schrägbankdrücken Kurzhantel', targetSets: 3, targetReps: '8-12', lastWeightKg: 30, done: false },
    { name: 'Seitheben', targetSets: 3, targetReps: '12-15', lastWeightKg: 10, done: false },
    { name: 'Trizepsdrücken Kabelzug', targetSets: 3, targetReps: '10-12', lastWeightKg: 25, done: false },
  ] satisfies DemoExercise[],
};

export interface DemoMealEntry {
  name: string;
  quantity: string;
  calories: number;
  proteinG: number;
}

export const todaysMeals: { meal: MealType; label: string; entries: DemoMealEntry[] }[] = [
  {
    meal: 'breakfast',
    label: 'Frühstück',
    entries: [
      { name: 'Magerquark', quantity: '250 g', calories: 195, proteinG: 30 },
      { name: 'Haferflocken', quantity: '60 g', calories: 225, proteinG: 8 },
    ],
  },
  {
    meal: 'lunch',
    label: 'Mittagessen',
    entries: [
      { name: 'Hähnchenbrust', quantity: '200 g', calories: 330, proteinG: 62 },
      { name: 'Reis (gekocht)', quantity: '150 g', calories: 195, proteinG: 4 },
    ],
  },
  {
    meal: 'dinner',
    label: 'Abendessen',
    entries: [],
  },
  {
    meal: 'snack',
    label: 'Snacks',
    entries: [{ name: 'Whey Protein', quantity: '1 Scoop', calories: 120, proteinG: 24 }],
  },
];

export const liftProgress = {
  exercise: 'Bankdrücken',
  unit: 'kg',
  isPR: true,
  points: [
    { label: 'KW 1', value: 72.5 },
    { label: 'KW 3', value: 75 },
    { label: 'KW 5', value: 75 },
    { label: 'KW 7', value: 77.5 },
    { label: 'KW 9', value: 80 },
    { label: 'KW 11', value: 80 },
    { label: 'KW 13', value: 82.5 },
  ],
};
