import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { colors, radius, spacing } from '../../src/theme/colors';
import { ProgressRing } from '../../src/components/ProgressRing';
import { MacroBar } from '../../src/components/MacroBar';
import { PhaseBadge } from '../../src/components/PhaseBadge';
import { StreakBar } from '../../src/components/StreakBar';
import { AchievementChips } from '../../src/components/AchievementChips';
import { FadeInView } from '../../src/components/FadeInView';
import { todaysRoutineDayId, streaks, recentAchievements, getQuoteOfTheDay } from '../../src/lib/demoData';
import { useNutritionStore, dailyTotalsFromEntries } from '../../src/store/nutritionStore';
import { useWorkoutHistoryStore } from '../../src/store/workoutHistoryStore';
import { useActivePhase } from '../../src/store/phaseStore';
import { useRoutineStore } from '../../src/store/routineStore';

export default function DashboardScreen() {
  const activePhase = useActivePhase();
  const routineDays = useRoutineStore((s) => s.routines);
  const sessions = useWorkoutHistoryStore((s) => s.sessions);
  const entries = useNutritionStore((s) => s.entries);
  const checkMidnightReset = useNutritionStore((s) => s.checkMidnightReset);
  useEffect(() => {
    checkMidnightReset();
  }, [checkMidnightReset]);
  const today = dailyTotalsFromEntries(entries);
  const quote = getQuoteOfTheDay();
  const [streakDetail, setStreakDetail] = useState<'training' | 'logging' | null>(null);
  const caloriesRemaining = activePhase.calorieTarget - today.caloriesConsumed;
  // Es wird nicht täglich trainiert — deshalb zeigt die Karte die nächste
  // fällige Routine (die andere als zuletzt) statt "heutiges Workout".
  const lastSession = sessions[0];
  const nextRoutine =
    routineDays.find((d) => d.id !== lastSession?.dayId) ??
    routineDays.find((d) => d.id === todaysRoutineDayId) ??
    routineDays[0];
  const lastTrainedLabel = lastSession ? `zuletzt: ${lastSession.dayLabel}, ${lastSession.date}` : 'noch kein Training geloggt';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Guten Morgen 👋</Text>
            <Text style={styles.date}>Donnerstag, 13. August</Text>
          </View>
          <Pressable onPress={() => router.push('/phase-select')}>
            <PhaseBadge type={activePhase.type} />
          </Pressable>
        </View>

        <StreakBar
          trainingWeeks={streaks.trainingWeeks}
          loggingDays={streaks.loggingDays}
          onPressTraining={() => setStreakDetail('training')}
          onPressLogging={() => setStreakDetail('logging')}
        />

        <FadeInView delay={60}>
        <View style={styles.card}>
          <View style={styles.ringRow}>
            <ProgressRing
              progress={today.caloriesConsumed / activePhase.calorieTarget}
              gradientColors={[colors.tint, colors.celebrate]}
              value={`${caloriesRemaining}`}
              countTo={caloriesRemaining}
              label="kcal übrig"
            />
            <View style={styles.ringSideStats}>
              <SideStat label="Ziel" value={`${activePhase.calorieTarget} kcal`} />
              <SideStat label="Gegessen" value={`${today.caloriesConsumed} kcal`} />
              <SideStat
                label="Verbleibend"
                value={`${caloriesRemaining} kcal`}
                highlight={caloriesRemaining >= 0}
              />
            </View>
          </View>
        </View>
        </FadeInView>

        <FadeInView delay={140}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Makros heute</Text>
          <MacroBar
            label="Protein 🎯"
            currentG={today.proteinG}
            targetG={activePhase.proteinTargetG}
            color={colors.protein}
            emphasized
          />
          <MacroBar
            label="Carbs"
            currentG={today.carbsG}
            targetG={activePhase.carbsTargetG}
            color={colors.carbs}
          />
          <MacroBar label="Fett" currentG={today.fatG} targetG={activePhase.fatTargetG} color={colors.fat} />
        </View>
        </FadeInView>

        <FadeInView delay={220}>
          <AchievementChips items={recentAchievements} />
        </FadeInView>

        <FadeInView delay={300}>
        <Link href="/workouts" asChild>
          <Pressable style={styles.card}>
            <View style={styles.workoutHeaderRow}>
              <Text style={styles.cardTitle}>Nächstes Workout</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.workoutDayLabel}>{nextRoutine.label}</Text>
            <Text style={styles.workoutSubtext}>
              {nextRoutine.exercises.length} Übungen · {lastTrainedLabel}
            </Text>
          </Pressable>
        </Link>
        </FadeInView>

        <StreakDetailModal
          type={streakDetail}
          onClose={() => setStreakDetail(null)}
          trainingWeeks={streaks.trainingWeeks}
          loggingDays={streaks.loggingDays}
        />

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>„{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StreakDetailModal({
  type,
  onClose,
  trainingWeeks,
  loggingDays,
}: {
  type: 'training' | 'logging' | null;
  onClose: () => void;
  trainingWeeks: number;
  loggingDays: number;
}) {
  const isTraining = type === 'training';
  const detail = isTraining
    ? {
        emoji: '🔥',
        title: `${trainingWeeks} Wochen Trainings-Streak`,
        body: 'Läuft weiter, solange du pro Woche alle geplanten Workouts schaffst. Eine verpasste Woche setzt ihn zurück.',
        stat: `${trainingWeeks * 4} Workouts in dieser Serie`,
        color: colors.tint,
      }
    : {
        emoji: '📝',
        title: `${loggingDays} Tage Log-Streak`,
        body: 'Zählt jeden Tag, an dem du mindestens eine Mahlzeit einträgst. Wird um Mitternacht geprüft.',
        stat: `Längste Serie bisher: ${Math.max(loggingDays, 18)} Tage`,
        color: colors.protein,
      };

  return (
    <Modal visible={type !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalEmoji}>{detail.emoji}</Text>
          <Text style={styles.modalTitle}>{detail.title}</Text>
          <Text style={styles.modalBody}>{detail.body}</Text>
          <View style={[styles.modalStat, { backgroundColor: `${detail.color}1F` }]}>
            <Text style={[styles.modalStatText, { color: detail.color }]}>{detail.stat}</Text>
          </View>
          <Pressable style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Schließen</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SideStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.sideStat}>
      <Text style={styles.sideStatLabel}>{label}</Text>
      <Text style={[styles.sideStatValue, highlight && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.label },
  date: { fontSize: 14, color: colors.secondaryLabel, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.label, marginBottom: spacing.sm },
  ringRow: { flexDirection: 'row', alignItems: 'center' },
  ringSideStats: { flex: 1, marginLeft: spacing.lg },
  sideStat: { marginBottom: spacing.sm },
  sideStatLabel: { fontSize: 12, color: colors.secondaryLabel },
  sideStatValue: { fontSize: 16, fontWeight: '700', color: colors.label, marginTop: 2 },
  workoutHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chevron: { fontSize: 22, color: colors.tertiaryLabel },
  workoutDayLabel: { fontSize: 20, fontWeight: '700', color: colors.label, marginTop: -4 },
  workoutSubtext: { fontSize: 13, color: colors.secondaryLabel, marginTop: 4 },
  quoteCard: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteAuthor: { fontSize: 11.5, color: colors.tertiaryLabel, marginTop: 6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 36, marginBottom: spacing.sm },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.label, textAlign: 'center' },
  modalBody: {
    fontSize: 13,
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  modalStat: { borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, marginTop: spacing.md },
  modalStatText: { fontSize: 12.5, fontWeight: '700' },
  modalClose: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  modalCloseText: { fontSize: 13.5, fontWeight: '700', color: colors.tint },
});
