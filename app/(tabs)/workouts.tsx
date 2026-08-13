import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { routineName, routineDays, todaysRoutineDayId } from '../../src/lib/demoData';
import { suggestNextSession } from '../../src/lib/progression';

export default function WorkoutsScreen() {
  const [selectedDayId, setSelectedDayId] = useState(todaysRoutineDayId);
  const day = routineDays.find((d) => d.id === selectedDayId)!;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.routineName}>{routineName}</Text>
          <Pressable style={styles.historyBtn} onPress={() => router.push('/workout/history')} hitSlop={8}>
            <Ionicons name="time-outline" size={14} color={colors.secondaryLabel} />
            <Text style={styles.historyBtnText}>Verlauf</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySwitcher}>
          {routineDays.map((d) => {
            const active = d.id === selectedDayId;
            return (
              <Pressable
                key={d.id}
                onPress={() => setSelectedDayId(d.id)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {day.exercises.map((exercise, index) => {
          const doneSets = exercise.sets.filter((s) => s.done).length;
          const isDone = doneSets === exercise.sets.length;
          return (
            <Pressable
              key={exercise.name}
              style={styles.exerciseCard}
              onPress={() => router.push(`/workout/session?day=${day.id}`)}
            >
              <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={16} color={colors.background} />
                ) : (
                  <Text style={styles.exerciseIndex}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.targetSets} Sätze × {exercise.targetReps} Wdh. · zuletzt {exercise.lastWeightKg} kg
                  {doneSets > 0 ? ` · ${doneSets}/${exercise.sets.length} Sätze erledigt` : ''}
                </Text>
                <Text style={styles.exerciseSuggestion}>💡 {suggestNextSession(exercise).reason}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.startButton} onPress={() => router.push(`/workout/session?day=${day.id}`)}>
        <Text style={styles.startButtonText}>Workout starten</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineName: { fontSize: 13, color: colors.secondaryLabel, fontWeight: '600' },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyBtnText: { fontSize: 12.5, color: colors.secondaryLabel, fontWeight: '600' },
  daySwitcher: { gap: spacing.sm, paddingBottom: spacing.sm },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: { backgroundColor: colors.tint, borderColor: colors.tint },
  dayChipText: { fontSize: 13.5, fontWeight: '700', color: colors.secondaryLabel },
  dayChipTextActive: { color: colors.background },
  scroll: { padding: spacing.md, paddingTop: spacing.sm, paddingBottom: 100 },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  exerciseSuggestion: { fontSize: 11.5, color: colors.tint, fontWeight: '600', marginTop: 3 },
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
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  startButtonText: { color: colors.background, fontSize: 17, fontWeight: '700' },
});
