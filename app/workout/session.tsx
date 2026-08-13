import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { routineDays, type DemoSet } from '../../src/lib/demoData';

interface ExerciseState {
  name: string;
  targetSets: number;
  targetReps: string;
  sets: DemoSet[];
}

export default function WorkoutSessionScreen() {
  const { day: dayId } = useLocalSearchParams<{ day: string }>();
  const day = routineDays.find((d) => d.id === dayId) ?? routineDays[0];

  const [exercises, setExercises] = useState<ExerciseState[]>(() =>
    day.exercises.map((ex) => ({
      name: ex.name,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      sets: ex.sets.map((s) => ({ ...s })),
    }))
  );

  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const doneSets = exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0);

  function updateSet(exIndex: number, setIndex: number, patch: Partial<DemoSet>) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIndex
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, ...patch } : s)) }
      )
    );
  }

  function addSet(exIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 0, done: false }] };
      })
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.label} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{day.label}</Text>
          <Text style={styles.headerSubtitle}>
            {doneSets} / {totalSets} Sätze erledigt
          </Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {exercises.map((exercise, exIndex) => (
          <View key={exercise.name} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTarget}>
              Ziel: {exercise.targetSets} × {exercise.targetReps} Wdh.
            </Text>

            <View style={styles.setHeaderRow}>
              <Text style={[styles.setHeaderCell, styles.setCol]}>Satz</Text>
              <Text style={[styles.setHeaderCell, styles.weightCol]}>kg</Text>
              <Text style={[styles.setHeaderCell, styles.repsCol]}>Wdh.</Text>
              <View style={styles.checkCol} />
            </View>

            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={[styles.setCell, styles.setCol]}>{setIndex + 1}</Text>
                <TextInput
                  style={[styles.input, styles.weightCol]}
                  keyboardType="decimal-pad"
                  value={set.weightKg ? String(set.weightKg) : ''}
                  placeholder="0"
                  placeholderTextColor={colors.tertiaryLabel}
                  onChangeText={(t) => updateSet(exIndex, setIndex, { weightKg: parseFloat(t.replace(',', '.')) || 0 })}
                />
                <TextInput
                  style={[styles.input, styles.repsCol]}
                  keyboardType="number-pad"
                  value={set.reps ? String(set.reps) : ''}
                  placeholder="0"
                  placeholderTextColor={colors.tertiaryLabel}
                  onChangeText={(t) => updateSet(exIndex, setIndex, { reps: parseInt(t, 10) || 0 })}
                />
                <Pressable
                  style={[styles.checkCol, styles.setCheck, set.done && styles.setCheckDone]}
                  onPress={() => updateSet(exIndex, setIndex, { done: !set.done })}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={set.done ? colors.background : colors.tertiaryLabel}
                  />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addSetBtn} onPress={() => addSet(exIndex)}>
              <Ionicons name="add" size={16} color={colors.tint} />
              <Text style={styles.addSetText}>Satz hinzufügen</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.finishButton} onPress={() => router.back()}>
          <Text style={styles.finishButtonText}>Workout beenden</Text>
        </Pressable>
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
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.label },
  headerSubtitle: { fontSize: 11.5, color: colors.secondaryLabel, marginTop: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  exerciseCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  exerciseName: { fontSize: 16.5, fontWeight: '700', color: colors.label },
  exerciseTarget: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 2, marginBottom: spacing.sm },
  setHeaderRow: { flexDirection: 'row', paddingBottom: 6 },
  setHeaderCell: { fontSize: 11, fontWeight: '700', color: colors.tertiaryLabel, textAlign: 'center' },
  setCol: { width: 36 },
  weightCol: { flex: 1, marginHorizontal: 6 },
  repsCol: { flex: 1, marginHorizontal: 6 },
  checkCol: { width: 34 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  setCell: { fontSize: 13, fontWeight: '700', color: colors.secondaryLabel, textAlign: 'center' },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 8,
    textAlign: 'center',
    color: colors.label,
    fontSize: 14,
    fontWeight: '600',
  },
  setCheck: {
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCheckDone: { backgroundColor: colors.success, borderColor: colors.success },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 8,
  },
  addSetText: { fontSize: 13, fontWeight: '700', color: colors.tint },
  finishButton: {
    backgroundColor: colors.tint,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  finishButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
