import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { todaysRoutineDay } from '../../src/lib/demoData';

export default function WorkoutsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.routineName}>{todaysRoutineDay.routineName}</Text>
          <Text style={styles.dayLabel}>{todaysRoutineDay.dayLabel}</Text>
        </View>

        {todaysRoutineDay.exercises.map((exercise, index) => (
          <View key={exercise.name} style={styles.exerciseCard}>
            <View style={[styles.checkCircle, exercise.done && styles.checkCircleDone]}>
              {exercise.done ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={styles.exerciseIndex}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.targetSets} Sätze × {exercise.targetReps} Wdh. · zuletzt {exercise.lastWeightKg} kg
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.startButton}>
        <Text style={styles.startButtonText}>Workout starten</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 100 },
  header: { marginBottom: spacing.md },
  routineName: { fontSize: 13, color: colors.secondaryLabel, fontWeight: '600' },
  dayLabel: { fontSize: 26, fontWeight: '700', color: colors.label, marginTop: 2 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  exerciseIndex: { fontSize: 12, fontWeight: '700', color: colors.secondaryLabel },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', color: colors.label },
  exerciseMeta: { fontSize: 13, color: colors.secondaryLabel, marginTop: 2 },
  startButton: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    backgroundColor: colors.tint,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.tint,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
