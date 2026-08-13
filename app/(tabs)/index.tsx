import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { colors, radius, spacing } from '../../src/theme/colors';
import { ProgressRing } from '../../src/components/ProgressRing';
import { MacroBar } from '../../src/components/MacroBar';
import { PhaseBadge } from '../../src/components/PhaseBadge';
import { StreakBar } from '../../src/components/StreakBar';
import { AchievementChips } from '../../src/components/AchievementChips';
import { todaysRoutineDayId, streaks, recentAchievements, getQuoteOfTheDay } from '../../src/lib/demoData';
import { useNutritionStore, dailyTotalsFromEntries } from '../../src/store/nutritionStore';
import { useActivePhase } from '../../src/store/phaseStore';
import { useRoutineStore } from '../../src/store/routineStore';

export default function DashboardScreen() {
  const activePhase = useActivePhase();
  const routineDays = useRoutineStore((s) => s.routines);
  const entries = useNutritionStore((s) => s.entries);
  const checkMidnightReset = useNutritionStore((s) => s.checkMidnightReset);
  useEffect(() => {
    checkMidnightReset();
  }, [checkMidnightReset]);
  const today = dailyTotalsFromEntries(entries);
  const quote = getQuoteOfTheDay();
  const caloriesRemaining = activePhase.calorieTarget - today.caloriesConsumed;
  const todaysRoutineDay = routineDays.find((d) => d.id === todaysRoutineDayId) ?? routineDays[0];
  const isExerciseDone = (ex: (typeof todaysRoutineDay.exercises)[number]) =>
    ex.sets.every((s) => s.done);
  const doneCount = todaysRoutineDay.exercises.filter(isExerciseDone).length;
  const nextExercise = todaysRoutineDay.exercises.find((e) => !isExerciseDone(e));

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

        <StreakBar trainingWeeks={streaks.trainingWeeks} loggingDays={streaks.loggingDays} />

        <View style={styles.card}>
          <View style={styles.ringRow}>
            <ProgressRing
              progress={today.caloriesConsumed / activePhase.calorieTarget}
              gradientColors={[colors.tint, colors.celebrate]}
              value={`${caloriesRemaining}`}
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

        <AchievementChips items={recentAchievements} />

        <Link href="/workouts" asChild>
          <View style={styles.card}>
            <View style={styles.workoutHeaderRow}>
              <Text style={styles.cardTitle}>Heutiges Workout</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
            <Text style={styles.workoutDayLabel}>{todaysRoutineDay.label}</Text>
            <Text style={styles.workoutSubtext}>
              {doneCount} / {todaysRoutineDay.exercises.length} Übungen erledigt
              {nextExercise ? ` · als nächstes: ${nextExercise.name}` : ''}
            </Text>
          </View>
        </Link>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>„{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
});
