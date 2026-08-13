// Trainingsplan (routineDays weiter unten) 1:1 aus Hevy übernommen.
// Ernährungs-/Phasen-Zahlen sind weiterhin Platzhalter, bis das echte
// Supabase-Backend angebunden ist. Split: Push/Pull, je 2x/Woche.

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
  { emoji: '🏆', title: 'Neuer PR', subtitle: 'Latzug 86 kg' },
  { emoji: '💪', title: '20 Workouts', subtitle: 'Seit Phasenstart' },
  { emoji: '🎯', title: 'Protein-Woche', subtitle: '7/7 Tage Ziel erreicht' },
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

// Für den Lebensmittelsuche-Screen (Makros pro 100 g).
export interface DemoFood {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export const foodDatabase: DemoFood[] = [
  { name: 'Hähnchenbrust', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: 'Magerquark', caloriesPer100g: 78, proteinPer100g: 12, carbsPer100g: 3.6, fatPer100g: 0.2 },
  { name: 'Reis (gekocht)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: 'Haferflocken', caloriesPer100g: 375, proteinPer100g: 13, carbsPer100g: 60, fatPer100g: 7 },
  { name: 'Whey Protein', brand: 'ESN Designer Whey', caloriesPer100g: 390, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 6 },
  { name: 'Eier', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
  { name: 'Banane', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  { name: 'Vollkornbrot', caloriesPer100g: 247, proteinPer100g: 9, carbsPer100g: 41, fatPer100g: 3.4 },
  { name: 'Erdnussbutter', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { name: 'Lachs', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
];

// Körpergewichts-Verlauf (kg) für die Gewichtskurve auf dem Fortschritts-Screen.
export const bodyWeightHistory: { label: string; weightKg: number }[] = [
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
