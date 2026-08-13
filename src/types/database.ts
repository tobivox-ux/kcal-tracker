// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Once the Supabase project exists, these can be replaced by generated
// types via: npx supabase gen types typescript --project-id <id>

export type PhaseType = 'cutting' | 'bulking' | 'maintenance';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type BiologicalSex = 'male' | 'female';

export interface Profile {
  id: string;
  display_name: string | null;
  height_cm: number | null;
  date_of_birth: string | null;
  sex: BiologicalSex | null;
  created_at: string;
  updated_at: string;
}

export interface BodyWeightLog {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  created_at: string;
}

export interface Phase {
  id: string;
  user_id: string;
  name: string;
  type: PhaseType;
  calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  label: string;
  day_order: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  category: string | null;
  muscle_group: string | null;
  equipment: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface RoutineDayExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_day_id: string | null;
  session_date: string;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  created_at: string;
}

export interface Food {
  id: string;
  user_id: string | null;
  name: string;
  brand: string | null;
  barcode: string | null;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  is_custom: boolean;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  log_date: string;
  meal_type: MealType;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      phases: { Row: Phase; Insert: Partial<Phase>; Update: Partial<Phase> };
      routines: { Row: Routine; Insert: Partial<Routine>; Update: Partial<Routine> };
      routine_days: { Row: RoutineDay; Insert: Partial<RoutineDay>; Update: Partial<RoutineDay> };
      exercises: { Row: Exercise; Insert: Partial<Exercise>; Update: Partial<Exercise> };
      routine_day_exercises: {
        Row: RoutineDayExercise;
        Insert: Partial<RoutineDayExercise>;
        Update: Partial<RoutineDayExercise>;
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Partial<WorkoutSession>;
        Update: Partial<WorkoutSession>;
      };
      workout_sets: { Row: WorkoutSet; Insert: Partial<WorkoutSet>; Update: Partial<WorkoutSet> };
      foods: { Row: Food; Insert: Partial<Food>; Update: Partial<Food> };
      food_logs: { Row: FoodLog; Insert: Partial<FoodLog>; Update: Partial<FoodLog> };
      body_weight_logs: {
        Row: BodyWeightLog;
        Insert: Partial<BodyWeightLog>;
        Update: Partial<BodyWeightLog>;
      };
    };
  };
}
