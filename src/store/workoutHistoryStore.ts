import { create } from 'zustand';
import { workoutHistory as seedHistory, type DemoHistorySession } from '../lib/demoData';

// Kürzere Sessions landen nicht im Verlauf — sonst verwässern "App aus
// Versehen geöffnet"-Einträge Volumen, Streak und Wochenstatistik.
export const MIN_TRACKED_SESSION_SECONDS = 5 * 60;

export interface CardioSession {
  id: string;
  date: string;
  machine: string;
  durationMin: number;
  displayedKcal: number;
  estimatedKcal: number;
}

interface WorkoutHistoryStore {
  sessions: DemoHistorySession[];
  cardio: CardioSession[];
  addSession: (session: Omit<DemoHistorySession, 'id' | 'date'>, durationSeconds: number) => boolean;
  addCardio: (session: Omit<CardioSession, 'id' | 'date'>) => void;
  removeCardio: (id: string) => void;
}

function todayLabel(): string {
  return new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useWorkoutHistoryStore = create<WorkoutHistoryStore>((set) => ({
  sessions: seedHistory,
  cardio: [],

  // Gibt zurück, ob die Session tatsächlich gespeichert wurde.
  addSession: (session, durationSeconds) => {
    if (durationSeconds < MIN_TRACKED_SESSION_SECONDS) return false;
    set((state) => ({
      sessions: [{ ...session, id: makeId(), date: todayLabel() }, ...state.sessions],
    }));
    return true;
  },

  addCardio: (session) =>
    set((state) => ({
      cardio: [{ ...session, id: makeId(), date: todayLabel() }, ...state.cardio],
    })),

  removeCardio: (id) => set((state) => ({ cardio: state.cardio.filter((c) => c.id !== id) })),
}));
