import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface StreakBarProps {
  trainingWeeks: number;
  loggingDays: number;
  onPressTraining?: () => void;
  onPressLogging?: () => void;
}

export function StreakBar({
  trainingWeeks,
  loggingDays,
  onPressTraining,
  onPressLogging,
}: StreakBarProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPressTraining}
        style={[styles.pill, { backgroundColor: 'rgba(255,90,54,0.14)', borderColor: 'rgba(255,90,54,0.35)' }]}
      >
        <Text style={styles.emoji}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.value}>{trainingWeeks} Wochen</Text>
          <Text style={styles.label}>Trainings-Streak</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onPressLogging}
        style={[styles.pill, { backgroundColor: 'rgba(180,255,57,0.10)', borderColor: 'rgba(180,255,57,0.30)' }]}
      >
        <Text style={styles.emoji}>📝</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.value}>{loggingDays} Tage</Text>
          <Text style={styles.label}>Log-Streak</Text>
        </View>
      </Pressable>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
  },
  emoji: { fontSize: 22 },
  value: { fontSize: 14, fontWeight: '700', color: colors.label },
  label: { fontSize: 11, color: colors.secondaryLabel, marginTop: 1 },
});
