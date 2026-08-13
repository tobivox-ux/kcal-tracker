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
