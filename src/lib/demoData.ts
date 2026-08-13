// Trainingsplan (routineDays weiter unten) 1:1 aus Hevy übernommen.
// Ernährungs-/Phasen-Zahlen sind weiterhin Platzhalter, bis das echte
// Supabase-Backend angebunden ist. Split: Push/Pull, je 2x/Woche.

import type { MealType, PhaseType } from '../types/database';
import { colors } from '../theme/colors';

// Berechnet mit Mifflin-St Jeor (72kg, 170cm, 17 Jahre, männlich):
// BMR = 10*72 + 6.25*170 - 5*17 + 5 = 1702.5 kcal
// TDEE = BMR * 1.55 (moderate Aktivität: ~7.000 Schritte/Tag + 4x
// Krafttraining/Woche) = 2639 kcal
//
// Protein bleibt über alle drei Phasen bei ~2,0 g/kg (144 g) konstant — das
// war die zentrale Anforderung ("hoher Protein-Fokus"), unabhängig vom Ziel.
// Nur Kalorien/Fett/Carbs verschieben sich mit der Phase:
// - Cutting: bewusst konservatives Defizit (15% statt der für Erwachsene
//   üblichen 20%), da mit 17 potenziell noch im Wachstum -> 2250 kcal.
// - Bulking: bewusst "lean" gehalten (~+8% über TDEE statt eines klassischen
//   dirty-bulk-Überschusses von 15-20%+), um den Fettaufbau gering zu
//   halten -> 2850 kcal.
// - Maintenance: TDEE selbst, aufgerundet -> 2650 kcal.
export interface PhaseConfig {
  type: PhaseType;
  name: string;
  description: string;
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

export const phaseOptions: PhaseConfig[] = [
  {
    type: 'cutting',
    name: 'Cutting Phase',
    description: 'Konservatives Defizit (~15%), um Muskelmasse beim Abnehmen zu erhalten.',
    calorieTarget: 2250,
    proteinTargetG: 144,
    carbsTargetG: 272,
    fatTargetG: 65,
  },
  {
    type: 'bulking',
    name: 'Bulking Phase (Lean)',
    description: 'Moderater Überschuss (~+8%) statt dirty bulk, damit der Fettaufbau minimal bleibt.',
    calorieTarget: 2850,
    proteinTargetG: 144,
    carbsTargetG: 389,
    fatTargetG: 80,
  },
  {
    type: 'maintenance',
    name: 'Maintenance Phase',
    description: 'Kalorien auf TDEE-Niveau — Gewicht halten, Kraft/Technik in den Fokus stellen.',
    calorieTarget: 2650,
    proteinTargetG: 144,
    carbsTargetG: 361,
    fatTargetG: 70,
  },
];

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
  color: string;
}

export const recentAchievements: Achievement[] = [
  { emoji: '🔥', title: '12 Tage Streak', subtitle: 'Täglich geloggt', color: colors.tint },
  { emoji: '🏆', title: 'Neuer PR', subtitle: 'Latzug 86 kg', color: colors.carbs },
  { emoji: '💪', title: '20 Workouts', subtitle: 'Seit Phasenstart', color: colors.fat },
  { emoji: '🎯', title: 'Protein-Woche', subtitle: '7/7 Tage Ziel erreicht', color: colors.protein },
];

export interface DemoSet {
  weightKg: number;
  reps: number;
  done: boolean;
}

export interface DemoExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  lastWeightKg: number;
  restSeconds: number;
  sets: DemoSet[];
}

export interface DemoRoutineDay {
  id: string;
  label: string;
  exercises: DemoExercise[];
}

// Aus deinen Hevy-Screenshots übernommen (Stand: letzte geloggte Session je
// Übung). Jede der zwei Routinen wird 2x/Woche trainiert (4 Sessions/Woche
// gesamt) — keine separaten A/B-Varianten. targetReps ohne explizite Range
// im Screenshot wurde aus der tatsächlich geloggten Wdh.-Spanne abgeleitet.
// Auffällig: kein einziger Bein-/Unterkörper-Reiz in beiden Routinen — falls
// das Absicht ist (reines Oberkörper-Ziel), passt das; falls nicht, sag
// Bescheid, dann bau ich einen Beintag mit ein.
export const routineName = 'Push / Pull (je 2x/Woche)';

export const routineDays: DemoRoutineDay[] = [
  {
    id: 'push',
    label: 'Push',
    exercises: [
      {
        name: 'Brustpresse (Maschine)',
        targetSets: 3,
        targetReps: '3-6',
        lastWeightKg: 65,
        restSeconds: 120,
        sets: [
          { weightKg: 65, reps: 6, done: false },
          { weightKg: 65, reps: 3, done: false },
          { weightKg: 60, reps: 4, done: false },
        ],
      },
      {
        name: 'Schrägbankdrücken (Kurzhantel)',
        targetSets: 3,
        targetReps: '8-12',
        lastWeightKg: 28,
        restSeconds: 120,
        sets: [
          { weightKg: 28, reps: 5, done: false },
          { weightKg: 26, reps: 6, done: false },
          { weightKg: 26, reps: 7, done: false },
        ],
      },
      {
        name: 'Schulterpresse (Kurzhantel)',
        targetSets: 3,
        targetReps: '8-12',
        lastWeightKg: 20,
        restSeconds: 120,
        sets: [
          { weightKg: 20, reps: 9, done: false },
          { weightKg: 20, reps: 9, done: false },
          { weightKg: 20, reps: 7, done: false },
        ],
      },
      {
        name: 'Cable Crossovers',
        targetSets: 2,
        targetReps: '10-15',
        lastWeightKg: 32,
        restSeconds: 120,
        sets: [
          { weightKg: 32, reps: 10, done: false },
          { weightKg: 36, reps: 7, done: false },
        ],
      },
      {
        name: 'Einarmiges Trizepsdrücken (Kabel)',
        targetSets: 3,
        targetReps: '7-9',
        lastWeightKg: 23,
        restSeconds: 120,
        sets: [
          { weightKg: 23, reps: 9, done: false },
          { weightKg: 23, reps: 7, done: false },
          { weightKg: 23, reps: 7, done: false },
        ],
      },
      {
        name: 'Überkopf-Trizepsstrecken (Kabelzug)',
        targetSets: 3,
        targetReps: '10-15',
        lastWeightKg: 36,
        restSeconds: 120,
        sets: [
          { weightKg: 36, reps: 8, done: false },
          { weightKg: 36, reps: 7, done: false },
          { weightKg: 36, reps: 5, done: false },
        ],
      },
      {
        name: 'Seitheben (Maschine)',
        targetSets: 3,
        targetReps: '12-20',
        lastWeightKg: 14,
        restSeconds: 120,
        sets: [
          { weightKg: 14, reps: 7, done: false },
          { weightKg: 14, reps: 7, done: false },
          { weightKg: 14, reps: 7, done: false },
        ],
      },
    ],
  },
  {
    id: 'pull',
    label: 'Pull',
    exercises: [
      {
        name: 'Bizepscurl (EZ-Hantel)',
        targetSets: 3,
        targetReps: '5-7',
        lastWeightKg: 20,
        restSeconds: 120,
        sets: [
          { weightKg: 20, reps: 6, done: false },
          { weightKg: 20, reps: 7, done: false },
          { weightKg: 20, reps: 5, done: false },
        ],
      },
      {
        name: 'Hammer Curl (Kabel)',
        targetSets: 3,
        targetReps: '6-8',
        lastWeightKg: 41,
        restSeconds: 120,
        sets: [
          { weightKg: 41, reps: 8, done: false },
          { weightKg: 41, reps: 6, done: false },
          { weightKg: 41, reps: 6, done: false },
        ],
      },
      {
        name: 'Spidercurls',
        targetSets: 2,
        targetReps: '8',
        lastWeightKg: 19.5,
        restSeconds: 120,
        sets: [
          { weightKg: 19.5, reps: 8, done: false },
          { weightKg: 19.5, reps: 8, done: false },
        ],
      },
      {
        name: 'Face Pull',
        targetSets: 2,
        targetReps: '10',
        lastWeightKg: 91,
        restSeconds: 120,
        sets: [
          { weightKg: 91, reps: 10, done: false },
          { weightKg: 91, reps: 10, done: false },
        ],
      },
      {
        name: 'Latzug (Maschine)',
        targetSets: 3,
        targetReps: '6-8',
        lastWeightKg: 86,
        restSeconds: 120,
        sets: [
          { weightKg: 86, reps: 8, done: false },
          { weightKg: 86, reps: 7, done: false },
          { weightKg: 86, reps: 6, done: false },
        ],
      },
      {
        name: 'Gerader Lat-Pulldown (Kabel)',
        targetSets: 3,
        targetReps: '5-8',
        lastWeightKg: 50,
        restSeconds: 120,
        sets: [
          { weightKg: 50, reps: 8, done: false },
          { weightKg: 50, reps: 6, done: false },
          { weightKg: 50, reps: 5, done: false },
        ],
      },
      {
        name: 'Rudern am Kabel sitzend',
        targetSets: 3,
        targetReps: '7-9',
        lastWeightKg: 55,
        restSeconds: 120,
        sets: [
          { weightKg: 55, reps: 9, done: false },
          { weightKg: 59, reps: 8, done: false },
          { weightKg: 56, reps: 7, done: false },
        ],
      },
      {
        name: 'Crunch (Maschine)',
        targetSets: 2,
        targetReps: '6-8',
        lastWeightKg: 43,
        restSeconds: 120,
        sets: [
          { weightKg: 43, reps: 8, done: false },
          { weightKg: 43, reps: 6, done: false },
        ],
      },
      {
        name: 'Wrist Curl (Handflächen oben, sitzend)',
        targetSets: 3,
        targetReps: '8-15',
        lastWeightKg: 59,
        restSeconds: 105,
        sets: [
          { weightKg: 59, reps: 8, done: false },
          { weightKg: 59, reps: 10, done: false },
          { weightKg: 59, reps: 15, done: false },
        ],
      },
    ],
  },
];

export const todaysRoutineDayId = 'push';

export interface DemoMealEntry {
  name: string;
  quantity: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// Mahlzeiten-Reihenfolge + Labels, geteilt zwischen Nutrition-Screen und
// Lebensmittelsuche.
export const MEAL_SECTIONS: { meal: MealType; label: string }[] = [
  { meal: 'breakfast', label: 'Frühstück' },
  { meal: 'lunch', label: 'Mittagessen' },
  { meal: 'dinner', label: 'Abendessen' },
  { meal: 'snack', label: 'Snacks' },
];

// Seed für den Ernährungs-Store (src/store/nutritionStore.ts) — der Store
// hält den tatsächlichen Tagesstand (hinzufügen/löschen/Mitternachts-Reset),
// das hier ist nur der Ausgangszustand.
export const todaysMeals: { meal: MealType; label: string; entries: DemoMealEntry[] }[] = [
  {
    meal: 'breakfast',
    label: 'Frühstück',
    entries: [
      { name: 'Magerquark', quantity: '250 g', calories: 195, proteinG: 30, carbsG: 9, fatG: 1 },
      { name: 'Haferflocken', quantity: '60 g', calories: 225, proteinG: 8, carbsG: 35, fatG: 4 },
    ],
  },
  {
    meal: 'lunch',
    label: 'Mittagessen',
    entries: [
      { name: 'Hähnchenbrust', quantity: '200 g', calories: 330, proteinG: 62, carbsG: 0, fatG: 7 },
      { name: 'Reis (gekocht)', quantity: '150 g', calories: 195, proteinG: 4, carbsG: 42, fatG: 1 },
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
    entries: [{ name: 'Whey Protein', quantity: '1 Scoop', calories: 120, proteinG: 24, carbsG: 2, fatG: 2 }],
  },
];

// Basis-Mahlzeiten zum Ein-Tap-Hinzufügen (immer gleiche Kombis, die oft
// gegessen werden). defaultMeal ist die Mahlzeit, zu der ein Tap auf der
// Übersicht sie hinzufügt.
export interface BaseMeal {
  id: string;
  emoji: string;
  name: string;
  quantity: string;
  defaultMeal: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export const baseMeals: BaseMeal[] = [
  {
    id: 'base-quark-oats',
    emoji: '🥣',
    name: 'Magerquark & Haferflocken',
    quantity: '250 g + 60 g',
    defaultMeal: 'breakfast',
    calories: 420,
    proteinG: 38,
    carbsG: 44,
    fatG: 5,
  },
  {
    id: 'base-chicken-rice',
    emoji: '🍗',
    name: 'Hähnchen & Reis',
    quantity: '200 g + 150 g',
    defaultMeal: 'lunch',
    calories: 525,
    proteinG: 66,
    carbsG: 42,
    fatG: 8,
  },
  {
    id: 'base-whey',
    emoji: '🥤',
    name: 'Whey Shake',
    quantity: '1 Scoop',
    defaultMeal: 'snack',
    calories: 120,
    proteinG: 24,
    carbsG: 2,
    fatG: 2,
  },
  {
    id: 'base-eggs-bread',
    emoji: '🍳',
    name: 'Eier & Vollkornbrot',
    quantity: '2 Eier + 60 g',
    defaultMeal: 'breakfast',
    calories: 330,
    proteinG: 21,
    carbsG: 26,
    fatG: 15,
  },
];

// Für den Lebensmittelsuche-Screen (Makros pro 100 g).
export interface DemoFood {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

// Offline-Grundstock an Lebensmitteln (Werte pro 100 g bzw. 100 ml, gerundete
// Durchschnittswerte). Deckt die üblichen Verdächtigen ab; für "wirklich jedes
// Produkt inkl. Barcode" braucht es später eine echte Datenbank-Anbindung
// (z. B. Open Food Facts) über das Supabase-Backend.
export const foodDatabase: DemoFood[] = [
  // Fleisch & Fisch
  { name: 'Hähnchenbrust', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: 'Hähnchenschenkel', caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11 },
  { name: 'Putenbrust', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1 },
  { name: 'Rinderhack (5% Fett)', caloriesPer100g: 137, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 5 },
  { name: 'Rinderhack (20% Fett)', caloriesPer100g: 254, proteinPer100g: 17, carbsPer100g: 0, fatPer100g: 20 },
  { name: 'Rindersteak', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 16 },
  { name: 'Schweineschnitzel', caloriesPer100g: 143, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 6 },
  { name: 'Hackfleisch gemischt', caloriesPer100g: 227, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 17 },
  { name: 'Salami', caloriesPer100g: 380, proteinPer100g: 21, carbsPer100g: 1.5, fatPer100g: 32 },
  { name: 'Kochschinken', caloriesPer100g: 107, proteinPer100g: 18, carbsPer100g: 1, fatPer100g: 3.5 },
  { name: 'Bacon', caloriesPer100g: 541, proteinPer100g: 37, carbsPer100g: 1.4, fatPer100g: 42 },
  { name: 'Bratwurst', caloriesPer100g: 297, proteinPer100g: 13, carbsPer100g: 2, fatPer100g: 26 },
  { name: 'Lachs', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
  { name: 'Thunfisch (Wasser)', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
  { name: 'Thunfisch (Öl)', caloriesPer100g: 198, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 8 },
  { name: 'Kabeljau', caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7 },
  { name: 'Garnelen', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
  { name: 'Fischstäbchen', caloriesPer100g: 200, proteinPer100g: 12, carbsPer100g: 18, fatPer100g: 9 },

  // Milchprodukte & Eier
  { name: 'Magerquark', caloriesPer100g: 78, proteinPer100g: 12, carbsPer100g: 3.6, fatPer100g: 0.2 },
  { name: 'Speisequark 20%', caloriesPer100g: 109, proteinPer100g: 12, carbsPer100g: 3, fatPer100g: 5 },
  { name: 'Skyr', caloriesPer100g: 63, proteinPer100g: 11, carbsPer100g: 4, fatPer100g: 0.2 },
  { name: 'Griechischer Joghurt 10%', caloriesPer100g: 133, proteinPer100g: 6, carbsPer100g: 4, fatPer100g: 10 },
  { name: 'Naturjoghurt 3,5%', caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3 },
  { name: 'Hüttenkäse', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
  { name: 'Milch 3,5%', caloriesPer100g: 64, proteinPer100g: 3.3, carbsPer100g: 4.8, fatPer100g: 3.5 },
  { name: 'Milch 1,5%', caloriesPer100g: 47, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 1.5 },
  { name: 'Hafermilch', caloriesPer100g: 45, proteinPer100g: 0.8, carbsPer100g: 7, fatPer100g: 1.5 },
  { name: 'Mandelmilch (ungesüßt)', caloriesPer100g: 15, proteinPer100g: 0.5, carbsPer100g: 0.3, fatPer100g: 1.2 },
  { name: 'Gouda', caloriesPer100g: 356, proteinPer100g: 25, carbsPer100g: 2.2, fatPer100g: 27 },
  { name: 'Mozzarella', caloriesPer100g: 280, proteinPer100g: 22, carbsPer100g: 2.2, fatPer100g: 20 },
  { name: 'Harzer Käse', caloriesPer100g: 125, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 0.5 },
  { name: 'Frischkäse', caloriesPer100g: 253, proteinPer100g: 6, carbsPer100g: 3.5, fatPer100g: 24 },
  { name: 'Parmesan', caloriesPer100g: 402, proteinPer100g: 36, carbsPer100g: 3.2, fatPer100g: 27 },
  { name: 'Butter', caloriesPer100g: 741, proteinPer100g: 0.7, carbsPer100g: 0.6, fatPer100g: 82 },
  { name: 'Eier', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: 'Eiweiß (Ei)', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2 },

  // Kohlenhydrate & Beilagen
  { name: 'Reis (gekocht)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: 'Reis (roh)', caloriesPer100g: 360, proteinPer100g: 7, carbsPer100g: 78, fatPer100g: 0.9 },
  { name: 'Basmatireis (gekocht)', caloriesPer100g: 121, proteinPer100g: 3, carbsPer100g: 25, fatPer100g: 0.4 },
  { name: 'Nudeln (gekocht)', caloriesPer100g: 158, proteinPer100g: 6, carbsPer100g: 31, fatPer100g: 0.9 },
  { name: 'Vollkornnudeln (gekocht)', caloriesPer100g: 124, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1 },
  { name: 'Kartoffeln (gekocht)', caloriesPer100g: 87, proteinPer100g: 2, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: 'Süßkartoffel', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
  { name: 'Pommes frites', caloriesPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15 },
  { name: 'Haferflocken', caloriesPer100g: 375, proteinPer100g: 13, carbsPer100g: 60, fatPer100g: 7 },
  { name: 'Couscous (gekocht)', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2 },
  { name: 'Quinoa (gekocht)', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9 },
  { name: 'Vollkornbrot', caloriesPer100g: 247, proteinPer100g: 9, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: 'Toastbrot', caloriesPer100g: 273, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 4 },
  { name: 'Brötchen', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 52, fatPer100g: 1.5 },
  { name: 'Knäckebrot', caloriesPer100g: 350, proteinPer100g: 10, carbsPer100g: 66, fatPer100g: 2 },
  { name: 'Cornflakes', caloriesPer100g: 378, proteinPer100g: 7, carbsPer100g: 84, fatPer100g: 0.9 },
  { name: 'Müsli', caloriesPer100g: 367, proteinPer100g: 10, carbsPer100g: 60, fatPer100g: 9 },

  // Hülsenfrüchte & vegetarische Proteine
  { name: 'Linsen (gekocht)', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4 },
  { name: 'Kichererbsen (gekocht)', caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6 },
  { name: 'Bohnen (Dose)', caloriesPer100g: 91, proteinPer100g: 6, carbsPer100g: 13, fatPer100g: 0.5 },
  { name: 'Tofu', caloriesPer100g: 144, proteinPer100g: 15, carbsPer100g: 2.8, fatPer100g: 9 },
  { name: 'Tempeh', caloriesPer100g: 193, proteinPer100g: 19, carbsPer100g: 9, fatPer100g: 11 },
  { name: 'Sojaschnetzel (trocken)', caloriesPer100g: 345, proteinPer100g: 50, carbsPer100g: 20, fatPer100g: 1.5 },
  { name: 'Erbsen', caloriesPer100g: 81, proteinPer100g: 5, carbsPer100g: 14, fatPer100g: 0.4 },

  // Gemüse
  { name: 'Brokkoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
  { name: 'Karotten', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: 'Tomaten', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
  { name: 'Gurke', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
  { name: 'Paprika', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3 },
  { name: 'Zwiebel', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1 },
  { name: 'Spinat', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
  { name: 'Zucchini', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3 },
  { name: 'Champignons', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3 },
  { name: 'Salat (Eisberg)', caloriesPer100g: 14, proteinPer100g: 0.9, carbsPer100g: 3, fatPer100g: 0.1 },
  { name: 'Mais (Dose)', caloriesPer100g: 86, proteinPer100g: 3.2, carbsPer100g: 19, fatPer100g: 1.2 },
  { name: 'Blumenkohl', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3 },
  { name: 'Avocado', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },

  // Obst
  { name: 'Banane', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: 'Apfel', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
  { name: 'Orange', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1 },
  { name: 'Erdbeeren', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 8, fatPer100g: 0.3 },
  { name: 'Blaubeeren', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3 },
  { name: 'Weintrauben', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2 },
  { name: 'Ananas', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1 },
  { name: 'Mango', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
  { name: 'Wassermelone', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2 },
  { name: 'Kiwi', caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 15, fatPer100g: 0.5 },
  { name: 'Datteln', caloriesPer100g: 282, proteinPer100g: 2.5, carbsPer100g: 75, fatPer100g: 0.4 },

  // Nüsse, Fette & Öle
  { name: 'Erdnussbutter', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { name: 'Mandeln', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
  { name: 'Walnüsse', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65 },
  { name: 'Cashewkerne', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44 },
  { name: 'Haselnüsse', caloriesPer100g: 628, proteinPer100g: 15, carbsPer100g: 17, fatPer100g: 61 },
  { name: 'Olivenöl', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Rapsöl', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
  { name: 'Leinsamen', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42 },
  { name: 'Chiasamen', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31 },

  // Supplements & Fitness
  { name: 'Whey Protein', brand: 'ESN Designer Whey', caloriesPer100g: 390, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 6 },
  { name: 'Casein Protein', caloriesPer100g: 366, proteinPer100g: 78, carbsPer100g: 6, fatPer100g: 2 },
  { name: 'Proteinriegel', caloriesPer100g: 350, proteinPer100g: 33, carbsPer100g: 30, fatPer100g: 10 },
  { name: 'Proteinpudding', caloriesPer100g: 73, proteinPer100g: 10, carbsPer100g: 4.5, fatPer100g: 1.5 },
  { name: 'Kreatin Monohydrat', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },

  // Fertiggerichte & Fast Food
  { name: 'Pizza Margherita', caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10 },
  { name: 'Pizza Salami', caloriesPer100g: 298, proteinPer100g: 12, carbsPer100g: 31, fatPer100g: 14 },
  { name: 'Döner Kebab', caloriesPer100g: 215, proteinPer100g: 15, carbsPer100g: 17, fatPer100g: 10 },
  { name: 'Burger (Fastfood)', caloriesPer100g: 250, proteinPer100g: 13, carbsPer100g: 23, fatPer100g: 12 },
  { name: 'Chicken Nuggets', caloriesPer100g: 296, proteinPer100g: 15, carbsPer100g: 18, fatPer100g: 19 },
  { name: 'Lasagne', caloriesPer100g: 132, proteinPer100g: 8, carbsPer100g: 11, fatPer100g: 6 },
  { name: 'Sushi (Maki)', caloriesPer100g: 143, proteinPer100g: 5, carbsPer100g: 27, fatPer100g: 1.5 },

  // Süßes & Snacks
  { name: 'Schokolade (Vollmilch)', caloriesPer100g: 535, proteinPer100g: 7.7, carbsPer100g: 59, fatPer100g: 30 },
  { name: 'Zartbitterschokolade', caloriesPer100g: 546, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 31 },
  { name: 'Gummibärchen', caloriesPer100g: 343, proteinPer100g: 6.9, carbsPer100g: 77, fatPer100g: 0.2 },
  { name: 'Chips', caloriesPer100g: 536, proteinPer100g: 7, carbsPer100g: 53, fatPer100g: 34 },
  { name: 'Kekse', caloriesPer100g: 480, proteinPer100g: 6, carbsPer100g: 65, fatPer100g: 21 },
  { name: 'Eiscreme', caloriesPer100g: 207, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 11 },
  { name: 'Nutella', caloriesPer100g: 539, proteinPer100g: 6, carbsPer100g: 57, fatPer100g: 31 },
  { name: 'Honig', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0 },
  { name: 'Marmelade', caloriesPer100g: 278, proteinPer100g: 0.4, carbsPer100g: 69, fatPer100g: 0.1 },

  // Getränke (pro 100 ml)
  { name: 'Cola', caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 10.6, fatPer100g: 0 },
  { name: 'Cola Zero', caloriesPer100g: 0.3, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
  { name: 'Monster Energy', caloriesPer100g: 47, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 },
  { name: 'Monster Ultra (Zero)', caloriesPer100g: 3, proteinPer100g: 0, carbsPer100g: 0.6, fatPer100g: 0 },
  { name: 'Red Bull', caloriesPer100g: 45, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0 },
  { name: 'Apfelsaft', caloriesPer100g: 46, proteinPer100g: 0.1, carbsPer100g: 11, fatPer100g: 0.1 },
  { name: 'Orangensaft', caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2 },
  { name: 'Bier', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 3.6, fatPer100g: 0 },
  { name: 'Kaffee (schwarz)', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0 },
  { name: 'Wasser', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },

  // Saucen & Sonstiges
  { name: 'Ketchup', caloriesPer100g: 112, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.2 },
  { name: 'Mayonnaise', caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 1.5, fatPer100g: 75 },
  { name: 'Senf', caloriesPer100g: 66, proteinPer100g: 4, carbsPer100g: 5, fatPer100g: 3.5 },
  { name: 'Tomatensauce', caloriesPer100g: 35, proteinPer100g: 1.6, carbsPer100g: 6, fatPer100g: 0.5 },
  { name: 'Sojasauce', caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 4.9, fatPer100g: 0.1 },
];

// Körpergewichts-Verlauf (kg) für die Gewichtskurve auf dem Fortschritts-Screen.
// Seed für src/store/bodyWeightStore.ts, das neue Einträge verwaltet.
export interface DemoWeightEntry {
  label: string;
  weightKg: number;
}

export const bodyWeightHistory: DemoWeightEntry[] = [
  { label: 'KW 1', weightKg: 74.8 },
  { label: 'KW 2', weightKg: 74.5 },
  { label: 'KW 3', weightKg: 74.1 },
  { label: 'KW 4', weightKg: 73.9 },
  { label: 'KW 5', weightKg: 73.4 },
  { label: 'KW 6', weightKg: 73.2 },
  { label: 'KW 7', weightKg: 72.6 },
  { label: 'KW 8', weightKg: 72.0 },
];

// Wird sowohl für die Wochenrückblick-Karte im Fortschritts-Screen als auch
// als Inhalt der Sonntags-Benachrichtigung verwendet (siehe src/lib/notifications.ts).
export const weeklySummary = {
  workoutsCompleted: 4,
  workoutsPlanned: 4,
  totalVolumeKg: 14280,
  volumeChangePct: 6,
  weightChangeKg: -0.6,
  avgProteinAdherencePct: 92,
  streakWeeks: streaks.trainingWeeks,
};

export function buildWeeklySummaryText(): string {
  const w = weeklySummary;
  const sign = w.weightChangeKg <= 0 ? '' : '+';
  return `${w.workoutsCompleted}/${w.workoutsPlanned} Workouts erledigt · Volumen ${sign}${w.volumeChangePct}% ggü. letzter Woche · Gewicht ${sign}${w.weightChangeKg.toFixed(1)} kg · Protein-Ziel an ${w.avgProteinAdherencePct}% der Tage erreicht. Weiter so! 🔥`;
}

// Trainingsdauer für den Verlauf-Screen, in drei Granularitäten (Woche/
// Monat/Jahr umschaltbar) — analog zur "Letzte 3 Monate"-Grafik im
// Hevy-Profil, nur als Liniendiagramm statt Balken.
export const weeklyTrainingHours: { label: string; hours: number }[] = [
  { label: 'KW 1', hours: 3.6 },
  { label: 'KW 2', hours: 4.0 },
  { label: 'KW 3', hours: 3.3 },
  { label: 'KW 4', hours: 4.2 },
  { label: 'KW 5', hours: 3.8 },
  { label: 'KW 6', hours: 4.1 },
  { label: 'KW 7', hours: 3.5 },
  { label: 'KW 8', hours: 4.0 },
];

export const monthlyTrainingHours: { label: string; hours: number }[] = [
  { label: 'Mär', hours: 15.2 },
  { label: 'Apr', hours: 16.8 },
  { label: 'Mai', hours: 17.5 },
  { label: 'Jun', hours: 15.9 },
  { label: 'Jul', hours: 18.2 },
  { label: 'Aug', hours: 16.4 },
];

export const yearlyTrainingHours: { label: string; hours: number }[] = [
  { label: '2025', hours: 187 },
  { label: '2026', hours: 142 },
];

// Aus deinem echten Hevy-Profil: 72 geloggte Workouts insgesamt.
export const totalWorkoutsLogged = 72;

export interface DemoHistorySession {
  id: string;
  date: string;
  dayId: string;
  dayLabel: string;
  durationMin: number;
  volumeKg: number;
  setsCompleted: number;
  setsPlanned: number;
}

// Letzte Sessions für den Verlauf-Screen (neueste zuerst).
export const workoutHistory: DemoHistorySession[] = [
  { id: 'h1', date: 'Di, 11. Aug', dayId: 'pull', dayLabel: 'Pull', durationMin: 62, volumeKg: 3480, setsCompleted: 24, setsPlanned: 24 },
  { id: 'h2', date: 'Mo, 10. Aug', dayId: 'push', dayLabel: 'Push', durationMin: 55, volumeKg: 3120, setsCompleted: 19, setsPlanned: 19 },
  { id: 'h3', date: 'Sa, 8. Aug', dayId: 'pull', dayLabel: 'Pull', durationMin: 64, volumeKg: 3410, setsCompleted: 23, setsPlanned: 24 },
  { id: 'h4', date: 'Fr, 7. Aug', dayId: 'push', dayLabel: 'Push', durationMin: 58, volumeKg: 3050, setsCompleted: 19, setsPlanned: 19 },
  { id: 'h5', date: 'Di, 4. Aug', dayId: 'pull', dayLabel: 'Pull', durationMin: 60, volumeKg: 3350, setsCompleted: 24, setsPlanned: 24 },
  { id: 'h6', date: 'Mo, 3. Aug', dayId: 'push', dayLabel: 'Push', durationMin: 53, volumeKg: 2980, setsCompleted: 18, setsPlanned: 19 },
  { id: 'h7', date: 'Sa, 1. Aug', dayId: 'pull', dayLabel: 'Pull', durationMin: 65, volumeKg: 3300, setsCompleted: 23, setsPlanned: 24 },
  { id: 'h8', date: 'Fr, 31. Jul', dayId: 'push', dayLabel: 'Push', durationMin: 57, volumeKg: 3100, setsCompleted: 19, setsPlanned: 19 },
];

// Zitat des Tages fürs Dashboard — bewusst kuratiert und mit Quelle statt
// generischer Motivationsposter-Sprüche. Rotiert deterministisch über den
// Kalendertag (siehe getQuoteOfTheDay), damit es pro Tag stabil ist.
export interface Quote {
  text: string;
  author: string;
}

export const dailyQuotes: Quote[] = [
  { text: 'Man wird nicht das, was man sich wünscht, sondern das, was man wiederholt tut.', author: 'Aristoteles' },
  { text: 'Du wirst es nicht immer wollen. Deshalb heißt es Disziplin und nicht Motivation.', author: 'unbekannt, Gym-Weisheit' },
  { text: 'Amateure trainieren, bis sie es richtig machen. Profis, bis sie es nicht mehr falsch machen können.', author: 'zugeschrieben' },
  { text: 'Vergleich ist der Dieb der Freude.', author: 'Theodore Roosevelt' },
  { text: 'Motivation bringt dich in Gang. Gewohnheit hält dich in Bewegung.', author: 'Jim Ryun' },
  { text: 'Es gibt keine Abkürzung zu einem Ort, der sich zu erreichen lohnt.', author: 'Beverly Sills' },
  { text: 'Der einzige Weg raus ist durch.', author: 'unbekannt' },
  { text: 'Was heute schwer ist, macht dich für das stark, was morgen kommt.', author: 'unbekannt' },
  { text: 'Konsistenz schlägt Intensität — fast immer.', author: 'unbekannt, Trainingsprinzip' },
  { text: 'Niemand sieht die Wiederholung Nummer eins. Alle sehen Wiederholung Nummer hundert.', author: 'unbekannt' },
];

export function getQuoteOfTheDay(date: Date = new Date()): Quote {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
