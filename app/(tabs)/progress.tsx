import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { colors, radius, spacing } from '../../src/theme/colors';
import { liftProgress } from '../../src/lib/demoData';

export default function ProgressScreen() {
  const chartData = liftProgress.points.map((p) => ({ value: p.value, label: p.label }));
  const first = liftProgress.points[0].value;
  const last = liftProgress.points[liftProgress.points.length - 1].value;
  const change = last - first;
  const changePct = ((change / first) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Fortschritt</Text>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.exerciseName}>{liftProgress.exercise}</Text>
            <Text style={styles.change}>
              +{change} {liftProgress.unit} ({changePct}%)
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.currentValue}>
              {last} <Text style={styles.unit}>{liftProgress.unit}</Text>
            </Text>
            {liftProgress.isPR && (
              <View style={styles.prBadge}>
                <Text style={styles.prBadgeText}>🏆 Neuer PR</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtext}>aktueller Topsatz · 13 Wochen</Text>

          <LineChart
            data={chartData}
            height={180}
            color={colors.tint}
            thickness={3}
            startFillColor={colors.tint}
            startOpacity={0.25}
            endOpacity={0.02}
            areaChart
            curved
            hideRules
            yAxisTextStyle={{ color: colors.secondaryLabel, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.secondaryLabel, fontSize: 10 }}
            noOfSections={4}
            spacing={44}
            initialSpacing={16}
            dataPointsColor={colors.tint}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Start" value={`${first} kg`} />
          <StatCard label="Aktuell" value={`${last} kg`} />
          <StatCard label="Zuwachs" value={`+${change} kg`} highlight />
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Nächster Schritt</Text>
          <Text style={styles.tipText}>
            Schick mir deinen echten Trainingsplan, dann trackt dieser Screen genau die Übungen, die dir
            wichtig sind, mit echtem Verlauf statt Beispieldaten.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseName: { fontSize: 16, fontWeight: '700', color: colors.label },
  change: { fontSize: 13, fontWeight: '700', color: colors.success },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  currentValue: { fontSize: 34, fontWeight: '700', color: colors.label },
  prBadge: {
    backgroundColor: `${colors.warning}20`,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  prBadgeText: { fontSize: 12, fontWeight: '700', color: colors.warning },
  unit: { fontSize: 16, color: colors.secondaryLabel, fontWeight: '600' },
  subtext: { fontSize: 12, color: colors.secondaryLabel, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: colors.secondaryLabel, fontWeight: '600' },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.label, marginTop: 4 },
  tipCard: {
    backgroundColor: `${colors.tint}12`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.label, marginBottom: 4 },
  tipText: { fontSize: 13, color: colors.secondaryLabel, lineHeight: 18 },
});
