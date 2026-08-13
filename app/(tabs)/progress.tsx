import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { colors, radius, spacing } from '../../src/theme/colors';
import { bodyWeightHistory, weeklySummary, buildWeeklySummaryText } from '../../src/lib/demoData';
import { scheduleWeeklySummaryNotification } from '../../src/lib/notifications';

export default function ProgressScreen() {
  useEffect(() => {
    scheduleWeeklySummaryNotification(buildWeeklySummaryText()).catch(() => {});
  }, []);

  const chartData = bodyWeightHistory.map((p) => ({ value: p.weightKg, label: p.label }));
  const first = bodyWeightHistory[0].weightKg;
  const last = bodyWeightHistory[bodyWeightHistory.length - 1].weightKg;
  const change = +(last - first).toFixed(1);
  const changePct = ((change / first) * 100).toFixed(1);
  const w = weeklySummary;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Fortschritt</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diese Woche</Text>
          <View style={styles.summaryGrid}>
            <SummaryStat label="Workouts" value={`${w.workoutsCompleted}/${w.workoutsPlanned}`} good />
            <SummaryStat label="Volumen" value={`+${w.volumeChangePct}%`} good />
            <SummaryStat label="Gewicht" value={`${w.weightChangeKg} kg`} good />
            <SummaryStat label="Protein-Tage" value={`${w.avgProteinAdherencePct}%`} good />
          </View>
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{w.streakWeeks} Wochen in Folge alle Workouts geschafft</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.exerciseName}>Körpergewicht</Text>
            <Text style={styles.change}>
              {change} kg ({changePct}%)
            </Text>
          </View>
          <Text style={styles.currentValue}>
            {last} <Text style={styles.unit}>kg</Text>
          </Text>
          <Text style={styles.subtext}>seit Cutting-Start · 8 Wochen</Text>

          <LineChart
            data={chartData}
            height={180}
            color={colors.success}
            thickness={3}
            startFillColor={colors.success}
            startOpacity={0.22}
            endOpacity={0.02}
            areaChart
            curved
            hideRules
            hideDataPoints={false}
            yAxisTextStyle={{ color: colors.secondaryLabel, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.secondaryLabel, fontSize: 10 }}
            noOfSections={4}
            spacing={38}
            initialSpacing={16}
            dataPointsColor={colors.success}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            backgroundColor="transparent"
          />
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📬 Jeden Sonntag</Text>
          <Text style={styles.tipText}>
            Du bekommst eine Benachrichtigung mit genau dieser Wochenzusammenfassung — Workouts, Volumen,
            Gewichtstrend und Protein-Adhärenz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryStat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, good && { color: colors.success }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: colors.label, marginBottom: spacing.sm },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryStat: { width: '50%', marginBottom: spacing.sm },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.label },
  summaryLabel: { fontSize: 12, color: colors.secondaryLabel, marginTop: 2 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  streakEmoji: { fontSize: 16 },
  streakText: { fontSize: 12.5, color: colors.secondaryLabel, flex: 1 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseName: { fontSize: 16, fontWeight: '700', color: colors.label },
  change: { fontSize: 13, fontWeight: '700', color: colors.success },
  currentValue: { fontSize: 34, fontWeight: '700', color: colors.label, marginTop: spacing.xs },
  unit: { fontSize: 16, color: colors.secondaryLabel, fontWeight: '600' },
  subtext: { fontSize: 12, color: colors.secondaryLabel, marginBottom: spacing.md },
  tipCard: {
    backgroundColor: 'rgba(255,90,54,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,90,54,0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.label, marginBottom: 4 },
  tipText: { fontSize: 13, color: colors.secondaryLabel, lineHeight: 18 },
});
