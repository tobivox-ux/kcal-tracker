// Cardiogeräte zeigen fast immer zu viel an. Zwei Gründe:
// 1. Sie rechnen den Grundumsatz mit ein (die Kalorien, die du in der Zeit
//    ohnehin verbrannt hättest — die sind aber schon im TDEE enthalten und
//    würden hier doppelt zählen).
// 2. Ohne eingegebenes Körpergewicht rechnen sie mit einer Standardperson,
//    die meist schwerer ist als der Nutzer.
//
// Statt die Anzeige nur pauschal zu kürzen, wird hier unabhängig über MET
// gerechnet (metabolisches Äquivalent, Compendium of Physical Activities):
//   kcal/min = MET * 3.5 * kg / 200
// Davon wird der Ruheumsatz (1 MET) abgezogen -> "Netto"-Verbrauch, also
// wirklich das, was über das Nichtstun hinausgeht. Die Geräteanzeige dient
// nur noch als Plausibilitätscheck.

export type CardioIntensity = 'easy' | 'moderate' | 'hard';

export interface CardioMachine {
  id: string;
  label: string;
  emoji: string;
  met: Record<CardioIntensity, number>;
}

export const CARDIO_MACHINES: CardioMachine[] = [
  { id: 'treadmill-walk', label: 'Laufband (gehen)', emoji: '🚶', met: { easy: 3.0, moderate: 4.3, hard: 5.3 } },
  { id: 'treadmill-run', label: 'Laufband (laufen)', emoji: '🏃', met: { easy: 7.0, moderate: 9.8, hard: 11.8 } },
  { id: 'bike', label: 'Fahrrad-Ergometer', emoji: '🚴', met: { easy: 5.5, moderate: 7.0, hard: 10.5 } },
  { id: 'crosstrainer', label: 'Crosstrainer', emoji: '🏋️', met: { easy: 4.6, moderate: 5.7, hard: 7.5 } },
  { id: 'rowing', label: 'Rudergerät', emoji: '🚣', met: { easy: 4.8, moderate: 7.0, hard: 8.5 } },
  { id: 'stairmaster', label: 'Stairmaster', emoji: '🪜', met: { easy: 6.0, moderate: 8.0, hard: 9.5 } },
  { id: 'other', label: 'Sonstiges', emoji: '💦', met: { easy: 4.0, moderate: 6.0, hard: 8.0 } },
];

export const INTENSITY_LABELS: Record<CardioIntensity, string> = {
  easy: 'Locker',
  moderate: 'Moderat',
  hard: 'Hart',
};

export interface CardioEstimate {
  netKcal: number;
  displayedKcal: number | null;
  overestimatePct: number | null;
  note: string;
}

export function estimateCardioKcal(
  machineId: string,
  intensity: CardioIntensity,
  durationMin: number,
  bodyWeightKg: number,
  displayedKcal?: number | null
): CardioEstimate {
  const machine = CARDIO_MACHINES.find((m) => m.id === machineId) ?? CARDIO_MACHINES[CARDIO_MACHINES.length - 1];
  const met = machine.met[intensity];

  const grossPerMin = (met * 3.5 * bodyWeightKg) / 200;
  const restingPerMin = (1 * 3.5 * bodyWeightKg) / 200;
  const netKcal = Math.max(0, Math.round((grossPerMin - restingPerMin) * durationMin));

  const shown = displayedKcal && displayedKcal > 0 ? displayedKcal : null;
  const overestimatePct = shown && netKcal > 0 ? Math.round(((shown - netKcal) / netKcal) * 100) : null;

  let note: string;
  if (overestimatePct === null) {
    note = `Netto-Schätzung über MET (${met}) bei ${bodyWeightKg} kg.`;
  } else if (overestimatePct > 15) {
    note = `Das Gerät zeigt ${overestimatePct}% mehr an — typisch, weil es deinen Grundumsatz mitzählt.`;
  } else if (overestimatePct < -15) {
    note = `Das Gerät zeigt ${Math.abs(overestimatePct)}% weniger an als die Schätzung — evtl. war es anstrengender als "${INTENSITY_LABELS[intensity]}".`;
  } else {
    note = 'Geräteanzeige und Schätzung liegen nah beieinander — passt.';
  }

  return { netKcal, displayedKcal: shown, overestimatePct, note };
}
