// "Kalorien-Knast": wer über sein Tagesziel kommt, zieht eine Strafe.
// Bewusst als Spaß-Mechanik gebaut, nicht als Bestrafung im moralischen
// Sinn — die Aufgaben sind machbar, der Ton ist frech statt beschämend.
// Ein einzelner Tag über dem Ziel ruiniert nichts; das sagt die App auch.

export type PunishmentTier = 'clean' | 'slip' | 'over' | 'chaos';

export interface Punishment {
  id: string;
  emoji: string;
  task: string;
}

export interface PunishmentVerdict {
  tier: PunishmentTier;
  overBy: number;
  title: string;
  verdict: string;
  color: 'success' | 'warning' | 'calories' | 'celebrate';
  pool: Punishment[];
}

// Ab wie vielen kcal über dem Ziel es welche Stufe gibt. Bis 100 kcal
// drüber passiert nichts — das ist innerhalb der Messungenauigkeit von
// Waage, Nährwertangaben und Portionsschätzung.
const SLIP_THRESHOLD = 100;
const OVER_THRESHOLD = 350;
const CHAOS_THRESHOLD = 800;

const SLIP_POOL: Punishment[] = [
  { id: 'slip-plank', emoji: '🧘', task: '60 Sekunden Plank. Jetzt. Auf dem Boden, wo du stehst.' },
  { id: 'slip-squats', emoji: '🦵', task: '25 Bodyweight-Squats — ja, auch ohne Beintag.' },
  { id: 'slip-walk', emoji: '🚶', task: '10 Minuten spazieren. Handy bleibt in der Tasche.' },
  { id: 'slip-water', emoji: '💧', task: 'Einen halben Liter Wasser trinken, bevor du noch was isst.' },
  { id: 'slip-pushups', emoji: '💪', task: '20 Liegestütze. Sauber, nicht so halbe Sachen.' },
];

const OVER_POOL: Punishment[] = [
  { id: 'over-burpees', emoji: '🔥', task: '40 Burpees. Aufteilen erlaubt, drücken nicht.' },
  { id: 'over-stairs', emoji: '🪜', task: '10 Minuten Treppen. Der Aufzug ist heute kaputt.' },
  { id: 'over-cardio', emoji: '🏃', task: '20 Minuten Cardio extra — und ehrlich eintragen.' },
  { id: 'over-pushups', emoji: '🫡', task: '100 Liegestütze über den Tag verteilt.' },
  { id: 'over-cook', emoji: '🍳', task: 'Morgen wird gekocht statt bestellt. Keine Ausreden.' },
];

const CHAOS_POOL: Punishment[] = [
  { id: 'chaos-legday', emoji: '🦵', task: 'Beintag. Du hast keinen im Plan — genau deshalb.' },
  { id: 'chaos-burpees', emoji: '☠️', task: '100 Burpees. Viel Erfolg dabei.' },
  { id: 'chaos-nodelivery', emoji: '📵', task: 'Diese Woche kein Lieferdienst. Null. Nada.' },
  { id: 'chaos-run', emoji: '🏃‍♂️', task: '5 km laufen. Draußen, nicht auf dem Laufband.' },
  { id: 'chaos-earlybird', emoji: '⏰', task: 'Morgen 6 Uhr Gym. Der Wecker ist bereits schuldig gesprochen.' },
];

export function judgeDay(consumedKcal: number, targetKcal: number): PunishmentVerdict {
  const overBy = Math.max(0, Math.round(consumedKcal - targetKcal));

  if (overBy < SLIP_THRESHOLD) {
    return {
      tier: 'clean',
      overBy,
      title: 'Freispruch',
      verdict:
        overBy === 0
          ? 'Im Ziel geblieben. Keine Anklage, kein Verfahren.'
          : `Nur ${overBy} kcal drüber — das ist Messrauschen, kein Vergehen.`,
      color: 'success',
      pool: [],
    };
  }

  if (overBy < OVER_THRESHOLD) {
    return {
      tier: 'slip',
      overBy,
      title: 'Kleiner Ausrutscher',
      verdict: `${overBy} kcal über dem Ziel. Kein Drama — aber es gibt trotzdem was zu tun.`,
      color: 'warning',
      pool: SLIP_POOL,
    };
  }

  if (overBy < CHAOS_THRESHOLD) {
    return {
      tier: 'over',
      overBy,
      title: 'Schuldig',
      verdict: `${overBy} kcal drüber. Das war kein Versehen, das war eine Entscheidung.`,
      color: 'calories',
      pool: OVER_POOL,
    };
  }

  return {
    tier: 'chaos',
    overBy,
    title: 'Totalschaden',
    verdict: `${overBy} kcal über dem Ziel. Respekt für die Konsequenz, ehrlich.`,
    color: 'celebrate',
    pool: CHAOS_POOL,
  };
}

// Deterministisch pro Tag + Stufe: der gleiche Tag zieht nicht bei jedem
// Neuöffnen eine neue Strafe, sonst könnte man einfach durchwürfeln, bis
// eine bequeme kommt.
export function drawPunishment(verdict: PunishmentVerdict, date: Date = new Date()): Punishment | null {
  if (verdict.pool.length === 0) return null;
  const seed = date.getFullYear() * 1000 + date.getMonth() * 40 + date.getDate() + verdict.tier.length;
  return verdict.pool[seed % verdict.pool.length];
}
