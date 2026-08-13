import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { weeklyTrainingHours, totalWorkoutsLogged, workoutHistory } from '../../src/lib/demoData';

export default function WorkoutHistoryScreen() {
  const maxHours = Math.max(...weeklyTrainingHours.map((w) => w.hours));
  const thisWeekHours = weeklyTrainingHours[weeklyTrainingHours.length - 1].hours;

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

          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>{thisWeekHours.toFixed(1)} Std. diese Woche</Text>
            <Text style={styles.chartSubtitle}>Letzte 8 Wochen</Text>
          </View>
          <View style={styles.chart}>
            {weeklyTrainingHours.map((w, i) => (
              <View key={w.label} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(w.hours / maxHours) * 100}%`,
                        backgroundColor: i === weeklyTrainingHours.length - 1 ? colors.tint : colors.cardAlt,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{w.label.replace('KW ', '')}</Text>
              </View>
            ))}
          </View>
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
  totalLabel: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 2, marginBottom: spacing.md },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: colors.label },
  chartSubtitle: { fontSize: 11, color: colors.secondaryLabel },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', height: 74, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 3 },
  barLabel: { fontSize: 10, color: colors.tertiaryLabel, marginTop: 4 },
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
