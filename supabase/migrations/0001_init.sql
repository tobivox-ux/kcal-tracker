-- Fitness & Nutrition Tracker — initial schema
-- Target: Supabase (Postgres + Auth + RLS)

create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES
-- One row per authenticated user (mirrors auth.users)
-- =========================================================
create type biological_sex as enum ('male', 'female');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  height_cm numeric(5, 1),
  date_of_birth date,
  sex biological_sex,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PHASES
-- Cutting / Bulking / Maintenance — each phase carries its own
-- calorie + macro targets. Exactly one phase is_active per user.
-- =========================================================
create type phase_type as enum ('cutting', 'bulking', 'maintenance');

create table phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  type phase_type not null,
  calorie_target int not null check (calorie_target > 0),
  protein_target_g int not null check (protein_target_g >= 0),
  carbs_target_g int not null check (carbs_target_g >= 0),
  fat_target_g int not null check (fat_target_g >= 0),
  is_active boolean not null default false,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now()
);

-- Enforce a single active phase per user
create unique index one_active_phase_per_user
  on phases (user_id)
  where (is_active);

-- =========================================================
-- ROUTINES  (e.g. "Push/Pull/Legs", "Upper/Lower")
-- =========================================================
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- A routine's days, e.g. "Day 1 - Push", "Day 2 - Pull"
create table routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines (id) on delete cascade,
  label text not null,
  day_order int not null,
  created_at timestamptz not null default now(),
  unique (routine_id, day_order)
);

-- =========================================================
-- EXERCISES  (global library + user-created custom exercises)
-- =========================================================
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  name text not null,
  category text,           -- e.g. 'push', 'pull', 'legs', 'core'
  muscle_group text,       -- e.g. 'chest', 'quads', 'lats'
  equipment text,          -- e.g. 'barbell', 'dumbbell', 'machine', 'bodyweight'
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- Planned exercises for a given routine day, with target sets/reps
create table routine_day_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references routine_days (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  order_index int not null default 0,
  target_sets int not null default 3,
  target_reps_min int,
  target_reps_max int,
  notes text
);

-- =========================================================
-- WORKOUT SESSIONS  (an actual gym visit)
-- =========================================================
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  routine_day_id uuid references routine_days (id) on delete set null,
  session_date date not null default current_date,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Individual logged sets within a session
create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  set_number int not null,
  weight_kg numeric(6, 2) not null default 0,
  reps int not null default 0,
  rpe numeric(3, 1),
  is_warmup boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FOODS  (global library + user-created custom foods)
-- Macro values are stored per 100 g for consistent scaling.
-- =========================================================
create table foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  name text not null,
  brand text,
  barcode text,
  calories_per_100g numeric(7, 2) not null,
  protein_g_per_100g numeric(6, 2) not null default 0,
  carbs_g_per_100g numeric(6, 2) not null default 0,
  fat_g_per_100g numeric(6, 2) not null default 0,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- FOOD LOGS  (a logged food entry for a given day/meal)
-- Macro snapshot columns are computed at insert time from
-- foods.*_per_100g * quantity_g, so historical logs stay
-- correct even if a food's nutrition data is edited later.
-- =========================================================
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  food_id uuid not null references foods (id) on delete restrict,
  log_date date not null default current_date,
  meal_type meal_type not null default 'snack',
  quantity_g numeric(7, 2) not null check (quantity_g > 0),
  calories numeric(7, 2) not null,
  protein_g numeric(6, 2) not null,
  carbs_g numeric(6, 2) not null,
  fat_g numeric(6, 2) not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- BODY WEIGHT LOGS  (bodyweight trend, e.g. to visualize a cut)
-- =========================================================
create table body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  log_date date not null default current_date,
  weight_kg numeric(5, 2) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index food_logs_user_date_idx on food_logs (user_id, log_date);
create index body_weight_logs_user_date_idx on body_weight_logs (user_id, log_date);
create index workout_sessions_user_date_idx on workout_sessions (user_id, session_date);
create index workout_sets_session_idx on workout_sets (session_id);
create index phases_user_idx on phases (user_id);

-- =========================================================
-- Row Level Security — every user only ever sees their own rows.
-- Library rows (exercises/foods with user_id is null) are
-- readable by everyone but not writable by regular users.
-- =========================================================
alter table profiles enable row level security;
alter table phases enable row level security;
alter table routines enable row level security;
alter table routine_days enable row level security;
alter table exercises enable row level security;
alter table routine_day_exercises enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;
alter table foods enable row level security;
alter table food_logs enable row level security;
alter table body_weight_logs enable row level security;

create policy "profiles: self read/write" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "phases: owner read/write" on phases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "routines: owner read/write" on routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "routine_days: owner read/write" on routine_days
  for all using (
    exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
  );

create policy "exercises: read library + own" on exercises
  for select using (user_id is null or user_id = auth.uid());
create policy "exercises: write own only" on exercises
  for insert with check (user_id = auth.uid());
create policy "exercises: update own only" on exercises
  for update using (user_id = auth.uid());
create policy "exercises: delete own only" on exercises
  for delete using (user_id = auth.uid());

create policy "routine_day_exercises: owner read/write" on routine_day_exercises
  for all using (
    exists (
      select 1 from routine_days rd
      join routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from routine_days rd
      join routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );

create policy "workout_sessions: owner read/write" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_sets: owner read/write" on workout_sets
  for all using (
    exists (select 1 from workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from workout_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

create policy "foods: read library + own" on foods
  for select using (user_id is null or user_id = auth.uid());
create policy "foods: write own only" on foods
  for insert with check (user_id = auth.uid());
create policy "foods: update own only" on foods
  for update using (user_id = auth.uid());
create policy "foods: delete own only" on foods
  for delete using (user_id = auth.uid());

create policy "food_logs: owner read/write" on food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_weight_logs: owner read/write" on body_weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- Keep only one active phase per user: activating a new phase
-- automatically deactivates the previously active one, which is
-- how the app "auto-adjusts" today's calorie/macro targets.
-- =========================================================
create or replace function deactivate_other_phases()
returns trigger as $$
begin
  if new.is_active then
    update phases
    set is_active = false
    where user_id = new.user_id
      and id <> new.id
      and is_active;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_deactivate_other_phases
  before insert or update of is_active on phases
  for each row
  when (new.is_active)
  execute function deactivate_other_phases();
