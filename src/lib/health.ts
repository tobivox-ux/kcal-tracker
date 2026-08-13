import { Platform } from 'react-native';

// Anbindung an Apple Health (iOS) bzw. Health Connect (Android) für Schritte
// und Schlaf — inklusive Daten von einer gekoppelten Uhr, da die dort landen.
//
// WICHTIG: Der eigentliche Datenzugriff braucht native Module, die nur in
// einem echten Dev-Build laufen, nicht in Expo Go und nicht im Web:
//   npx expo install @kingstinct/react-native-healthkit   # iOS
//   npx expo install react-native-health-connect          # Android
// Dazu in app.json die HealthKit-Entitlements/Permissions ergänzen.
//
// Bis das native Modul eingebunden ist, liefert diese Datei bewusst
// gekennzeichnete Demo-Werte, damit die UI schon fertig gebaut und
// gestaltet werden kann. `isHealthAvailable` sagt der UI ehrlich, ob die
// angezeigten Zahlen echt sind.

export interface StepEntry {
  label: string;
  steps: number;
}

export interface SleepEntry {
  label: string;
  hours: number;
}

export interface HealthSnapshot {
  connected: boolean;
  stepsToday: number;
  stepGoal: number;
  weeklySteps: StepEntry[];
  weeklySleep: SleepEntry[];
}

export function isHealthAvailable(): boolean {
  // Sobald das native Modul eingebunden ist, hier auf dessen
  // isAvailable()-Funktion umstellen.
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

const DEMO_SNAPSHOT: HealthSnapshot = {
  connected: false,
  stepsToday: 7420,
  stepGoal: 10000,
  weeklySteps: [
    { label: 'Mo', steps: 8210 },
    { label: 'Di', steps: 6890 },
    { label: 'Mi', steps: 9450 },
    { label: 'Do', steps: 7420 },
    { label: 'Fr', steps: 10230 },
    { label: 'Sa', steps: 5600 },
    { label: 'So', steps: 4870 },
  ],
  weeklySleep: [
    { label: 'Mo', hours: 7.2 },
    { label: 'Di', hours: 6.5 },
    { label: 'Mi', hours: 7.8 },
    { label: 'Do', hours: 7.1 },
    { label: 'Fr', hours: 6.9 },
    { label: 'Sa', hours: 8.4 },
    { label: 'So', hours: 8.0 },
  ],
};

export async function requestHealthPermissions(): Promise<boolean> {
  // Mit nativem Modul:
  //   return HealthKit.requestAuthorization([StepCount, SleepAnalysis]);
  return false;
}

export async function fetchHealthSnapshot(): Promise<HealthSnapshot> {
  // Mit nativem Modul: Schritte pro Tag der letzten 7 Tage und
  // SleepAnalysis-Samples abfragen und in dieses Format bringen.
  return DEMO_SNAPSHOT;
}
