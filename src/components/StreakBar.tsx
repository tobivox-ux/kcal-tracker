import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface StreakBarProps {
  trainingWeeks: number;
  loggingDays: number;
}

export function StreakBar({ trainingWeeks, loggingDays }: StreakBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.emoji}>🔥</Text>
        <View>
          <Text style={styles.value}>{trainingWeeks} Wochen</Text>
          <Text style={styles.label}>Trainings-Streak</Text>
        </View>
      </View>
      <View style={styles.pill}>
        <Text style={styles.emoji}>📝</Text>
        <View>
          <Text style={styles.value}>{loggingDays} Tage</Text>
          <Text style={styles.label}>Log-Streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  emoji: { fontSize: 22 },
  value: { fontSize: 14, fontWeight: '700', color: colors.label },
  label: { fontSize: 11, color: colors.secondaryLabel, marginTop: 1 },
});
