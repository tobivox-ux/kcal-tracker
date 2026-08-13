import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { colors, radius, spacing } from '../../src/theme/colors';
import {
  weeklyTrainingHours,
  monthlyTrainingHours,
  yearlyTrainingHours,
  totalWorkoutsLogged,
  workoutHistory,
} from '../../src/lib/demoData';

type Period = 'week' | 'month' | 'year';

const PERIODS: { id: Period; label: string; subtitle: string; unitLabel: string }[] = [
  { id: 'week', label: 'Woche', subtitle: 'Letzte 8 Wochen', unitLabel: 'diese Woche' },
  { id: 'month', label: 'Monat', subtitle: 'Letzte 6 Monate', unitLabel: 'diesen Monat' },
  { id: 'year', label: 'Jahr', subtitle: 'Letzte Jahre', unitLabel: 'dieses Jahr' },
];

const DATA_BY_PERIOD: Record<Period, { label: string; hours: number }[]> = {
  week: weeklyTrainingHours,
  month: monthlyTrainingHours,
  year: yearlyTrainingHours,
};

export default function WorkoutHistoryScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const data = DATA_BY_PERIOD[period];
  const meta = PERIODS.find((p) => p.id === period)!;
  const currentHours = data[data.length - 1].hours;
  const chartData = data.map((d) => ({ value: d.hours, label: d.label }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>Verlauf</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.totalValue}>{totalWorkoutsLogged}</Text>
          <Text style={styles.totalLabel}>Workouts insgesamt</Text>

          <View style={styles.periodSwitcher}>
            {PERIODS.map((p) => {
              const active = p.id === period;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPeriod(p.id)}
                  style={[styles.periodChip, active && styles.periodChipActive]}
                >
                  <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>
              {currentHours.toFixed(1)} Std. {meta.unitLabel}
            </Text>
            <Text style={styles.chartSubtitle}>{meta.subtitle}</Text>
          </View>

          <LineChart
            data={chartData}
            height={140}
            color={colors.tint}
            thickness={3}
            startFillColor={colors.tint}
            startOpacity={0.22}
            endOpacity={0.02}
            areaChart
            curved
            hideRules
            yAxisTextStyle={{ color: colors.secondaryLabel, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.tertiaryLabel, fontSize: 10 }}
            noOfSections={3}
            spacing={data.length > 6 ? 40 : 60}
            initialSpacing={16}
            dataPointsColor={colors.tint}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            backgroundColor="transparent"
          />
        </View>

        <Text style={styles.sectionTitle}>Sessions</Text>
        {workoutHistory.map((session) => (
          <View key={session.id} style={styles.sessionRow}>
            <View style={[styles.sessionDot, session.dayId === 'push' ? styles.dotPush : styles.dotPull]} />
            <View style={styles.sessionInfo}>
              <View style={styles.sessionTopRow}>
                <Text style={styles.sessionDay}>{session.dayLabel}</Text>
                <Text style={styles.sessionDate}>{session.date}</Text>
              </View>
              <Text style={styles.sessionMeta}>
                {session.durationMin} min · {session.volumeKg.toLocaleString('de-DE')} kg Volumen ·{' '}
                {session.setsCompleted}/{session.setsPlanned} Sätze
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.label },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  totalValue: { fontSize: 32, fontWeight: '700', color: colors.label },
  totalLabel: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 2 },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.full,
    padding: 3,
    marginTop: spacing.md,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  periodChipActive: { backgroundColor: colors.tint },
  periodChipText: { fontSize: 12.5, fontWeight: '700', color: colors.secondaryLabel },
  periodChipTextActive: { color: colors.background },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: colors.label },
  chartSubtitle: { fontSize: 11, color: colors.secondaryLabel },
  sectionTitle: { fontSize: 15.5, fontWeight: '700', color: colors.label, marginBottom: spacing.sm },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionDot: { width: 9, height: 9, borderRadius: 5, marginRight: spacing.sm + 2 },
  dotPush: { backgroundColor: colors.tint },
  dotPull: { backgroundColor: colors.fat },
  sessionInfo: { flex: 1 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionDay: { fontSize: 15, fontWeight: '700', color: colors.label },
  sessionDate: { fontSize: 12.5, color: colors.secondaryLabel },
  sessionMeta: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 3 },
});
