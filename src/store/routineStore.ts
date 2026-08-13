import { create } from 'zustand';
import { routineDays as seedRoutineDays, type DemoRoutineDay, type DemoExercise } from '../lib/demoData';

export interface NewExerciseInput {
  name: string;
  targetSets: number;
  targetReps: string;
  startWeightKg: number;
  restSeconds: number;
}

function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `routine-${Date.now()}`;
}

interface RoutineStore {
  routines: DemoRoutineDay[];
  addExercise: (routineId: string, input: NewExerciseInput) => void;
  removeExercise: (routineId: string, exerciseName: string) => void;
  addRoutine: (label: string) => string;
  removeRoutine: (routineId: string) => void;
  renameRoutine: (routineId: string, label: string) => void;
}

export const useRoutineStore = create<RoutineStore>((set, get) => ({
  routines: seedRoutineDays,

  addExercise: (routineId, input) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id !== routineId
          ? r
          : {
              ...r,
              exercises: [
                ...r.exercises,
                {
                  name: input.name,
                  targetSets: input.targetSets,
                  targetReps: input.targetReps,
                  lastWeightKg: input.startWeightKg,
                  restSeconds: input.restSeconds,
                  sets: Array.from({ length: input.targetSets }, () => ({
                    weightKg: input.startWeightKg,
                    reps: 0,
                    done: false,
                  })),
                } satisfies DemoExercise,
              ],
            }
      ),
    })),

  removeExercise: (routineId, exerciseName) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id !== routineId ? r : { ...r, exercises: r.exercises.filter((e) => e.name !== exerciseName) }
      ),
    })),

  addRoutine: (label) => {
    const id = slugify(label);
    set((state) => ({ routines: [...state.routines, { id, label, exercises: [] }] }));
    return id;
  },

  removeRoutine: (routineId) => {
    if (get().routines.length <= 1) return;
    set((state) => ({ routines: state.routines.filter((r) => r.id !== routineId) }));
  },

  renameRoutine: (routineId, label) =>
    set((state) => ({
      routines: state.routines.map((r) => (r.id !== routineId ? r : { ...r, label })),
    })),
}));
