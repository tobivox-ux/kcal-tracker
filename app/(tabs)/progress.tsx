import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { colors, radius, spacing } from '../../src/theme/colors';
import { weeklySummary, buildWeeklySummaryText } from '../../src/lib/demoData';
import {
  scheduleWeeklySummaryNotification,
  scheduleMorningWeighInReminder,
  scheduleCreatineReminder,
} from '../../src/lib/notifications';
import { useBodyWeightStore } from '../../src/store/bodyWeightStore';
import { fetchHealthSnapshot, requestHealthPermissions, type HealthSnapshot } from '../../src/lib/health';

export default function ProgressScreen() {
  const bodyWeightHistory = useBodyWeightStore((s) => s.entries);
  const addWeightEntry = useBodyWeightStore((s) => s.addEntry);
  const [entering, setEntering] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const { width } = useWindowDimensions();
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  // Kartenbreite minus Innenabstand und Y-Achsen-Beschriftung — sonst läuft
  // das Diagramm bei vielen Einträgen rechts aus dem Bildschirm.
  const chartWidth = width - spacing.md * 2 - spacing.md * 2 - 32;

  useEffect(() => {
    scheduleWeeklySummaryNotification(buildWeeklySummaryText()).catch(() => {});
    scheduleMorningWeighInReminder().catch(() => {});
    scheduleCreatineReminder().catch(() => {});
    fetchHealthSnapshot().then(setHealth).catch(() => {});
  }, []);

  async function connectHealth() {
    const granted = await requestHealthPermissions();
    if (granted) setHealth(await fetchHealthSnapshot());
  }

  function confirmWeight() {
    const value = parseFloat(weightInput.replace(',', '.'));
    if (value > 0) addWeightEntry(value);
    setWeightInput('');
    setEntering(false);
  }

  const chartData = bodyWeightHistory.map((p) => ({ value: p.weightKg, label: p.label }));
  const first = bodyWeightHistory[0].weightKg;
  const last = bodyWeightHistory[bodyWeightHistory.length - 1].weightKg;
  const change = +(last - first).toFixed(1);
  const changePct = ((change / first) * 100).toFixed(1);
  const w = weeklySummary;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            <View style={styles.headerRightRow}>
              <Text style={styles.change}>
                {change} kg ({changePct}%)
              </Text>
              <Pressable style={styles.addWeightBtn} onPress={() => setEntering((e) => !e)} hitSlop={8}>
                <Ionicons name={entering ? 'close' : 'add'} size={16} color={colors.tint} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.currentValue}>
            {last} <Text style={styles.unit}>kg</Text>
          </Text>
          <Text style={styles.subtext}>seit Cutting-Start · {bodyWeightHistory.length} Einträge</Text>

          {entering && (
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                keyboardType="decimal-pad"
                placeholder="z. B. 71.8"
                placeholderTextColor={colors.tertiaryLabel}
                value={weightInput}
                onChangeText={setWeightInput}
                autoFocus
                onSubmitEditing={confirmWeight}
              />
              <Text style={styles.weightInputUnit}>kg</Text>
              <Pressable style={styles.weightConfirmBtn} onPress={confirmWeight}>
                <Text style={styles.weightConfirmText}>Eintragen</Text>
              </Pressable>
            </View>
          )}

          <LineChart
            data={chartData}
            width={chartWidth}
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
            spacing={Math.max(24, chartWidth / Math.max(1, chartData.length))}
            initialSpacing={12}
            dataPointsColor={colors.success}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            backgroundColor="transparent"
          />
        </View>

        {health && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.exerciseName}>Schritte & Schlaf</Text>
              {!health.connected && (
                <Pressable onPress={connectHealth} hitSlop={8}>
                  <Text style={styles.connectLink}>Health verbinden</Text>
                </Pressable>
              )}
            </View>

            {!health.connected && (
              <Text style={styles.demoNotice}>
                Noch nicht verbunden — die Werte unten sind Beispieldaten. Auf einem echten iPhone/Android-Gerät
                holt die App hier deine Schritte und Schlafdaten (inkl. Uhr) aus Apple Health bzw. Health Connect.
              </Text>
            )}

            <Text style={styles.currentValue}>
              {health.stepsToday.toLocaleString('de-DE')} <Text style={styles.unit}>Schritte heute</Text>
            </Text>
            <View style={styles.stepTrack}>
              <View
                style={[
                  styles.stepFill,
                  { width: `${Math.min(100, Math.round((health.stepsToday / health.stepGoal) * 100))}%` },
                ]}
              />
            </View>
            <Text style={styles.subtext}>Ziel: {health.stepGoal.toLocaleString('de-DE')} Schritte</Text>

            <View style={styles.miniChartRow}>
              {health.weeklySteps.map((d) => {
                const max = Math.max(...health.weeklySteps.map((x) => x.steps));
                return (
                  <View key={d.label} style={styles.miniBarCol}>
                    <View style={styles.miniBarTrack}>
                      <View style={[styles.miniBar, { height: `${(d.steps / max) * 100}%` }]} />
                    </View>
                    <Text style={styles.miniBarLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>😴 Schlaf Ø</Text>
              <Text style={styles.sleepValue}>
                {(health.weeklySleep.reduce((s2, d) => s2 + d.hours, 0) / health.weeklySleep.length).toFixed(1)} Std.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>🔔 Aktive Erinnerungen</Text>
          <Text style={styles.tipText}>
            Sonntags 18 Uhr Wochenrückblick · morgens 7:30 Uhr wiegen · 9 Uhr Kreatin · 3× täglich trinken —
            plus "Pause vorbei" beim Training und ein Tracking-Reminder abends.
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  headerRightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  change: { fontSize: 13, fontWeight: '700', color: colors.success },
  addWeightBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: `${colors.tint}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValue: { fontSize: 34, fontWeight: '700', color: colors.label, marginTop: spacing.xs },
  unit: { fontSize: 16, color: colors.secondaryLabel, fontWeight: '600' },
  subtext: { fontSize: 12, color: colors.secondaryLabel, marginBottom: spacing.md },
  weightInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  weightInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.label,
  },
  weightInputUnit: { fontSize: 13, color: colors.secondaryLabel, flexShrink: 0 },
  weightConfirmBtn: {
    backgroundColor: colors.tint,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 0,
  },
  weightConfirmText: { fontSize: 13, fontWeight: '700', color: colors.background },
  tipCard: {
    backgroundColor: 'rgba(255,90,54,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,90,54,0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  connectLink: { fontSize: 12.5, fontWeight: '700', color: colors.tint },
  demoNotice: {
    fontSize: 11.5,
    color: colors.warning,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  stepTrack: { height: 8, borderRadius: 4, backgroundColor: colors.cardAlt, overflow: 'hidden', marginTop: 8 },
  stepFill: { height: '100%', backgroundColor: colors.tint, borderRadius: 4 },
  miniChartRow: { flexDirection: 'row', gap: 6, height: 54, marginBottom: spacing.sm },
  miniBarCol: { flex: 1, alignItems: 'center' },
  miniBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  miniBar: { width: '100%', borderRadius: 3, backgroundColor: colors.cardAlt, minHeight: 3 },
  miniBarLabel: { fontSize: 9.5, color: colors.tertiaryLabel, marginTop: 3 },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sleepLabel: { fontSize: 13, color: colors.secondaryLabel, fontWeight: '600' },
  sleepValue: { fontSize: 15, fontWeight: '700', color: colors.label },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.label, marginBottom: 4 },
  tipText: { fontSize: 13, color: colors.secondaryLabel, lineHeight: 18 },
});
