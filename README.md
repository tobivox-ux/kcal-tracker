# kcal-tracker

Ein persönlicher Fitness- & Ernährungs-Tracker: Workout-Logging für einen
Push/Pull-Split, Makro-Tracking mit Fokus auf hohem Protein, und Phasen
(Cutting/Bulking/Maintenance), die die Tagesziele automatisch umstellen.

## Tech-Stack

- **Frontend:** [Expo](https://expo.dev) (React Native + TypeScript), [Expo Router](https://docs.expo.dev/router/introduction/) für dateibasierte Navigation
- **Backend:** [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- **State/Data:** [TanStack Query](https://tanstack.com/query) für Server-State, [Zustand](https://zustand-demo.pmnd.rs/) für lokalen UI-State
- **Charts:** [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) + eigene SVG-Ring-/Balken-Komponenten

Warum diese Kombination: Expo deckt iOS/Android/Web aus einer Codebasis ab,
ohne dass native Xcode/Android-Studio-Toolchains nötig sind. Supabase liefert
eine echte relationale Postgres-DB (wichtig für die vielen verknüpften
Tabellen: Routinen → Tage → Übungen → Sessions → Sets) inklusive Auth und
Row-Level-Security, ohne einen eigenen Server betreiben zu müssen.

## Projektstruktur

```
app/                          Expo-Router-Screens (dateibasiertes Routing)
  _layout.tsx                  Root-Layout (Providers, Stack)
  (tabs)/
    _layout.tsx                 Tab-Navigator
    index.tsx                    Dashboard (Phase, Kalorien-Ring, Makros, Streaks, Erfolge)
    workouts.tsx                  Umschalter Push/Pull + Übungsübersicht
    nutrition.tsx                  Essensprotokoll nach Mahlzeit + Foto-Scan-Einstieg
    progress.tsx                    Wochenrückblick + Körpergewichts-Kurve
  workout/
    session.tsx                  Aktives Workout: Satz-Logging, Pausentimer, PR-Erkennung
    history.tsx                   Trainings-Verlauf: Wochen-Dauer-Chart + Sessions
  nutrition/
    add-food.tsx                Lebensmittelsuche + Mengenauswahl
    scan.tsx                     Foto-Scan-Flow (Kamera/Galerie -> KI-Schätzung)
src/
  components/                  Wiederverwendbare UI-Bausteine
  lib/
    supabase.ts                 Supabase-Client
    demoData.ts                  Trainingsplan (echt, aus Hevy) + Ernährungs-/Phasen-Platzhalter
    progression.ts                Regelbasierter Gewicht-/Wdh.-Vorschlag pro Übung
    notifications.ts             Sonntags-Benachrichtigung mit Wochenrückblick
  theme/                        Farb-/Spacing-Tokens (dunkles Theme, kräftiger Akzent)
  types/database.ts            TypeScript-Typen passend zum SQL-Schema
supabase/
  migrations/0001_init.sql     Vollständiges DB-Schema inkl. Row Level Security
```

## Datenbank-Schema

Kern-Tabellen (siehe `supabase/migrations/0001_init.sql` für Details, Constraints & RLS-Policies):

| Tabelle | Zweck |
|---|---|
| `profiles` | Nutzerprofil (Name, Größe, Geburtsdatum, Geschlecht — für Kalorienberechnung) |
| `phases` | Cutting/Bulking/Maintenance mit eigenen Kalorien-/Makrozielen; genau eine Phase ist `is_active` pro Nutzer (per Trigger erzwungen) |
| `routines` / `routine_days` / `routine_day_exercises` | Mehrtägige Splits (z. B. Push/Pull) mit geplanten Sätzen/Wdh. pro Übung |
| `exercises` | Übungs-Bibliothek (global + eigene) |
| `workout_sessions` / `workout_sets` | Tatsächlich geloggte Trainings mit Gewicht/Wdh./RPE pro Satz |
| `foods` | Lebensmittel-Bibliothek (global + eigene), Makros pro 100 g |
| `food_logs` | Geloggte Mahlzeiten mit Makro-Snapshot zum Logzeitpunkt |
| `body_weight_logs` | Körpergewichts-Verlauf (z. B. um den Cut zu visualisieren) |

Aktiviert man eine neue Phase, deaktiviert ein Datenbank-Trigger automatisch
die vorherige — dadurch stellt die App die Tagesziele beim Phasenwechsel ohne
zusätzlichen App-Code um.

## Setup

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Supabase-Projekt anlegen (supabase.com -> New Project), dann:
cp .env.example .env
# .env mit Project URL + anon key aus den Supabase-Projekteinstellungen befüllen

# 3. Schema in Supabase ausrollen (SQL-Editor im Supabase-Dashboard,
#    oder mit der Supabase CLI):
supabase link --project-ref <dein-projekt-ref>
supabase db push

# 4. App starten
npm start        # Metro-Bundler, dann per Expo Go auf dem Handy scannen
npm run ios       # iOS-Simulator (nur macOS)
npm run android   # Android-Emulator
npm run web       # Browser
```

## Features im aktuellen Stand

- **Workout-Logging:** Push (7 Übungen) und Pull (9 Übungen) — echter Trainingsplan aus Hevy, je 2x/Woche trainiert, umschaltbar; aktive Session mit editierbarem Gewicht/Wdh. pro Satz, Sätze abhaken oder hinzufügen
- **Pausentimer & Session-Stoppuhr:** startet automatisch beim Abhaken eines Satzes (Dauer pro Übung aus Hevy übernommen), mit +15s/-15s/Skip; Gesamt-Session-Zeit läuft im Header mit
- **PR-Erkennung:** kleine Animation (💪) direkt am Satz, wenn Gewicht oder Wdh. die letzte Session übertreffen
- **Progressions-Vorschlag:** `src/lib/progression.ts` — regelbasierte (keine ML-Blackbox) Logik, die aus der letzten Session pro Übung ein Gewicht/Wdh.-Ziel für heute vorschlägt; auf dem Workouts-Screen und in der aktiven Session sichtbar
- **Trainings-Verlauf:** eigener Screen (`workout/history.tsx`) mit Wochen-Dauer-Chart der letzten 8 Wochen und einer Liste vergangener Sessions (Datum, Dauer, Volumen, Sätze) — Zugang über "Verlauf" oben im Workouts-Tab
- **Ernährung:** Tagesprotokoll nach Mahlzeit, Lebensmittelsuche mit Mengen-/Makro-Vorschau, Foto-Scan-Flow (echter Kamera-/Galerie-Zugriff über `expo-image-picker`; die Erkennung selbst ist aktuell eine Mock-Antwort — für echte Ergebnisse braucht es eine Supabase Edge Function, die das Foto an ein Vision-Modell schickt)
- **Phasen:** Cutting/Bulking/Maintenance mit automatisch angepassten Kalorien-/Makrozielen (DB-Trigger)
- **Motivation:** Trainings- & Log-Streak, PR-Badges, Achievement-Chips, wöchentliche Sonntags-Benachrichtigung (`expo-notifications`, lokal geplant — für zuverlässige Zustellung in Produktion empfiehlt sich ein Dev-Build statt Expo Go)

Der Trainingsplan (`routineDays` in `src/lib/demoData.ts`) ist bereits echt —
1:1 aus Hevy-Screenshots übernommen (Übung, Sätze, Wdh., Gewicht der letzten
Session). Offen dabei: die genauen Routine-Namen aus Hevy, und dass beide
Routinen aktuell keinen Bein-Reiz enthalten (reines Oberkörper-Setup — falls
gewollt, passt das so; falls nicht, fehlt noch ein Beintag).

Ernährungs-/Phasen-Zahlen sowie alle Screens laufen weiterhin mit
Beispieldaten aus `src/lib/demoData.ts`, bis ein Supabase-Projekt verbunden
ist. Als Nächstes: Supabase-Queries/-Mutationen an die Screens anbinden
(Auth, Live-Daten statt Demo-Daten).
