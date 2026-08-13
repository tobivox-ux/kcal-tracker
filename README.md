# kcal-tracker

Ein persönlicher Fitness- & Ernährungs-Tracker: Workout-Logging für einen
Push/Pull-Split, Makro-Tracking mit Fokus auf hohem Protein, und Phasen
(Cutting/Bulking/Maintenance), die die Tagesziele automatisch umstellen.

## Tech-Stack

- **Frontend:** [Expo](https://expo.dev) (React Native + TypeScript), [Expo Router](https://docs.expo.dev/router/introduction/) für dateibasierte Navigation
- **Backend:** [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security)
- **State/Data:** [TanStack Query](https://tanstack.com/query) für späteren Server-State, [Zustand](https://zustand-demo.pmnd.rs/) für den lokalen App-State (Ernährung, Trainingsplan, Phase, Körpergewicht — siehe `src/store/`)
- **Charts:** [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) + eigene SVG-Ring-Komponente
- **Sonstiges:** `expo-notifications` (lokale Benachrichtigungen), `expo-image-picker` (Kamera/Galerie), `expo-linear-gradient` (Gradient-Buttons)

Warum diese Kombination: Expo deckt iOS/Android/Web aus einer Codebasis ab,
ohne dass native Xcode/Android-Studio-Toolchains nötig sind. Supabase liefert
eine echte relationale Postgres-DB (wichtig für die vielen verknüpften
Tabellen: Routinen → Tage → Übungen → Sessions → Sets) inklusive Auth und
Row-Level-Security, ohne einen eigenen Server betreiben zu müssen.

## Projektstruktur

```
app/                          Expo-Router-Screens (dateibasiertes Routing)
  _layout.tsx                  Root-Layout (Providers, Stack, Mitternachts-Reset-Timer)
  phase-select.tsx              Phase wechseln (Cutting/Bulking/Maintenance)
  (tabs)/
    _layout.tsx                 Tab-Navigator
    index.tsx                    Dashboard (Phase, Kalorien-Ring, Makros, Streaks, Erfolge, Zitat des Tages)
    workouts.tsx                  Umschalter Push/Pull + Übungsübersicht + Zugang zu Verlauf/Bearbeiten
    nutrition.tsx                  Essensprotokoll nach Mahlzeit, Basis-Mahlzeiten, Foto-Scan-Einstieg
    progress.tsx                    Wochenrückblick + Körpergewichts-Kurve (mit Eintrage-Funktion)
  workout/
    session.tsx                  Aktives Workout: Satz-Logging, Pausentimer, PR-Erkennung
    history.tsx                   Trainings-Verlauf: Woche/Monat/Jahr-Liniendiagramm + Sessions
    edit.tsx                      Trainingsplan bearbeiten: Übungen/Routinen hinzufügen & entfernen
  nutrition/
    add-food.tsx                Lebensmittelsuche + Mengenauswahl
    scan.tsx                     Foto-Scan-Flow (Kamera/Galerie -> KI-Schätzung) + Mahlzeit-Auswahl
src/
  components/                  Wiederverwendbare UI-Bausteine (u.a. GradientButton, ProgressRing)
  store/                        Zustand-Stores für den App-State (siehe unten)
  lib/
    supabase.ts                 Supabase-Client
    demoData.ts                  Trainingsplan (echt, aus Hevy) + Ernährungs-/Phasen-/Zitate-Seeds
    progression.ts                Regelbasierter Gewicht-/Wdh.-Vorschlag pro Übung
    notifications.ts             Alle lokalen Benachrichtigungen (siehe unten)
  theme/                        Farb-/Spacing-Tokens (dunkles Theme, kräftiger Akzent)
  types/database.ts            TypeScript-Typen passend zum SQL-Schema
supabase/
  migrations/0001_init.sql     Vollständiges DB-Schema inkl. Row Level Security
```

### State-Stores (`src/store/`)

Bis das Supabase-Backend angebunden ist, hält Zustand den tatsächlichen
App-Zustand (nicht nur Anzeige-Demo-Daten) — Hinzufügen/Löschen/Bearbeiten
wirkt sich wirklich aus und spiegelt sich sofort in allen Screens, die
denselben Store lesen:

| Store | Zweck |
|---|---|
| `nutritionStore.ts` | Geloggte Mahlzeiten pro Tag; `addEntry`/`removeEntry`; setzt sich automatisch um Mitternacht zurück |
| `phaseStore.ts` | Aktive Phase (Cutting/Bulking/Maintenance); steuert Kalorien-/Makroziele auf Dashboard & Ernährung |
| `routineStore.ts` | Trainingsplan (Routinen + Übungen); Übungen/Routinen hinzufügen oder entfernen |
| `bodyWeightStore.ts` | Körpergewichts-Verlauf für die Kurve im Fortschritts-Screen |

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
zusätzlichen App-Code um. Die Zustand-Stores oben bilden dieses Verhalten
lokal nach, bis die App wirklich gegen Supabase läuft.

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

**Workout**
- Push (7 Übungen) und Pull (9 Übungen) — echter Trainingsplan aus Hevy, je 2x/Woche trainiert, umschaltbar; bewusst ohne Bein-Tag (mit dem Nutzer abgestimmt)
- Aktive Session mit editierbarem Gewicht/Wdh. pro Satz, Sätze abhaken oder hinzufügen
- Pausentimer & Session-Stoppuhr: startet automatisch beim Abhaken eines Satzes (Dauer pro Übung aus Hevy übernommen), mit +15s/-15s/Skip
- PR-Erkennung: kleine Animation (💪) direkt am Satz, wenn Gewicht oder Wdh. die letzte Session übertreffen
- Progressions-Vorschlag (`src/lib/progression.ts`): regelbasierte (keine ML-Blackbox) Logik, die aus der letzten Session pro Übung ein Gewicht/Wdh.-Ziel für heute vorschlägt
- Trainings-Verlauf (`workout/history.tsx`): Woche/Monat/Jahr umschaltbares Liniendiagramm der Trainingsdauer + Liste vergangener Sessions (Datum, Dauer, Volumen, Sätze)
- Trainingsplan bearbeiten (`workout/edit.tsx`): neue Übungen zu einer Routine hinzufügen oder entfernen, komplett neue Routine anlegen (z. B. bei einem Split-Wechsel) oder eine löschen

**Ernährung**
- Tagesprotokoll nach Mahlzeit, Einträge lassen sich wieder löschen; die Tagestotale (Dashboard-Ring, Makro-Leisten) sind aus den echten Einträgen abgeleitet, nicht mehr fest verdrahtet
- Setzt sich automatisch um Mitternacht zurück (`nutritionStore.scheduleMidnightReset`)
- Basis-Mahlzeiten: 4 vordefinierte Kombis (z. B. "Hähnchen & Reis"), ein Tap loggt sie direkt zur passenden Tageszeit
- Lebensmittelsuche mit Mengen-/Makro-Vorschau
- Foto-Scan-Flow (echter Kamera-/Galerie-Zugriff über `expo-image-picker`, Mahlzeit-Auswahl vor dem Bestätigen; die Erkennung selbst ist aktuell eine Mock-Antwort — für echte Ergebnisse braucht es eine Supabase Edge Function, die das Foto an ein Vision-Modell schickt)

**Phasen**
- Cutting (2.250 kcal), Bulking bewusst als **lean** ausgelegt (~+8% über TDEE statt eines klassischen dirty bulk, 2.850 kcal) und Maintenance (2.650 kcal) — Protein bleibt in allen drei Phasen bei 144 g
- Phase wechseln über Tap auf das Phase-Badge auf dem Dashboard (`app/phase-select.tsx`); Kalorien-/Makroziele passen sich sofort überall an

**Fortschritt & Motivation**
- Körpergewicht eintragen direkt im Fortschritts-Screen, neuer Wert erscheint sofort in der Kurve
- Trainings- & Log-Streak, farbig hinterlegte Achievement-Chips, Gradient-CTAs (`GradientButton`, `expo-linear-gradient`) statt flacher Buttons, Gradient-Stroke im Kalorien-Ring
- Zitat des Tages auf dem Dashboard: kuratierte, mit Quelle versehene Liste (`demoData.dailyQuotes`), rotiert deterministisch pro Kalendertag — bewusst kein generisches Motivationsposter

**Benachrichtigungen** (`src/lib/notifications.ts`, `expo-notifications`)
- Wöchentlicher Sonntags-Rückblick, 18 Uhr
- Morgendliche Wiege-Erinnerung, 7:30 Uhr
- Kreatin-Erinnerung, 9 Uhr
- "Pause vorbei" — feuert auch im Hintergrund, sobald der Pausentimer abläuft; wird bei Skip/±15s neu geplant bzw. storniert
- Täglicher Tracking-Reminder, 20 Uhr

Alle Uhrzeiten sind aktuell feste Zeitpunkte. Lokale Benachrichtigungen
funktionieren zum Testen in Expo Go; für zuverlässige Zustellung in
Produktion empfiehlt sich ein Dev-Build.

## Als Nächstes

Alles oben läuft lokal über Zustand-Stores und Beispieldaten
(`src/lib/demoData.ts`). Der nächste große Schritt ist, die Stores durch
echte Supabase-Queries/-Mutationen zu ersetzen (Auth, Live-Daten, Sync
zwischen Geräten), plus:

- Foto-Scan an ein echtes Vision-Modell anbinden (Supabase Edge Function)
- Tracking-Reminder intelligent machen (nur erinnern, wenn wirklich noch nichts geloggt wurde)
- Die genauen Routine-Namen aus Hevy übernehmen (aktuell generische Labels "Push"/"Pull")
