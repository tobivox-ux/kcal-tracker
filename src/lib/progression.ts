import type { DemoExercise } from './demoData';

export interface ProgressionSuggestion {
  weightKg: number;
  reason: string;
}

// Kein ML-Modell — eine nachvollziehbare Regel, angewendet auf die zuletzt
// geloggte Session (exercise.sets aus demoData). Sobald echte Historie über
// mehrere Sessions aus Supabase kommt, kann dieselbe Funktion Trends über
// Zeit statt nur "letztes Mal" berücksichtigen (z. B. Deload-Vorschlag bei
// zwei Rückgängen in Folge).
function parseRepRange(targetReps: string): { min: number; max: number } {
  const [minStr, maxStr] = targetReps.split('-').map((s) => s.trim());
  const min = parseInt(minStr, 10);
  const max = maxStr ? parseInt(maxStr, 10) : min;
  return { min: Number.isNaN(min) ? 0 : min, max: Number.isNaN(max) ? min : max };
}

export function suggestNextSession(exercise: DemoExercise): ProgressionSuggestion {
  const { min, max } = parseRepRange(exercise.targetReps);
  const topWeight = Math.max(...exercise.sets.map((s) => s.weightKg));
  const allAtOrAboveMax = exercise.sets.every((s) => s.reps >= max);
  const anyBelowMin = exercise.sets.some((s) => s.reps < min);

  if (topWeight === 0) {
    return allAtOrAboveMax
      ? { weightKg: 0, reason: `Alle Sätze bei ${max}+ Wdh. — heute mehr Wdh. probieren` }
      : { weightKg: 0, reason: 'Gleiche Wdh.-Zahl anpeilen wie zuletzt' };
  }

  if (allAtOrAboveMax) {
    const increment = topWeight >= 40 ? 2.5 : topWeight >= 15 ? 1.25 : 0.5;
    const nextWeight = Math.round((topWeight + increment) * 2) / 2;
    return { weightKg: nextWeight, reason: `Letztes Mal alle Sätze im Zielbereich — ${nextWeight} kg probieren` };
  }
  if (anyBelowMin) {
    return { weightKg: topWeight, reason: `${topWeight} kg halten, Fokus auf ${min}+ Wdh.` };
  }
  return { weightKg: topWeight, reason: `${topWeight} kg halten, Wdh. weiter Richtung ${max} steigern` };
}
