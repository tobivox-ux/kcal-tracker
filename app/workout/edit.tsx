import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { useRoutineStore } from '../../src/store/routineStore';
import { GradientButton } from '../../src/components/GradientButton';

export default function EditRoutineScreen() {
  const { day: dayIdParam } = useLocalSearchParams<{ day?: string }>();
  const routines = useRoutineStore((s) => s.routines);
  const addExercise = useRoutineStore((s) => s.addExercise);
  const removeExercise = useRoutineStore((s) => s.removeExercise);
  const addRoutine = useRoutineStore((s) => s.addRoutine);
  const removeRoutine = useRoutineStore((s) => s.removeRoutine);

  const [selectedId, setSelectedId] = useState(dayIdParam ?? routines[0]?.id ?? '');
  const routine = routines.find((r) => r.id === selectedId) ?? routines[0];

  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [newRoutineLabel, setNewRoutineLabel] = useState('');
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8-12');
  const [weight, setWeight] = useState('0');
  const [rest, setRest] = useState('120');

  function resetExerciseForm() {
    setName('');
    setSets('3');
    setReps('8-12');
    setWeight('0');
    setRest('120');
    setShowExerciseForm(false);
  }

  function submitExercise() {
    if (!routine || !name.trim()) return;
    addExercise(routine.id, {
      name: name.trim(),
      targetSets: parseInt(sets, 10) || 1,
      targetReps: reps.trim() || '-',
      startWeightKg: parseFloat(weight.replace(',', '.')) || 0,
      restSeconds: parseInt(rest, 10) || 120,
    });
    resetExerciseForm();
  }

  function submitRoutine() {
    if (!newRoutineLabel.trim()) return;
    const id = addRoutine(newRoutineLabel.trim());
    setNewRoutineLabel('');
    setShowRoutineForm(false);
    setSelectedId(id);
  }

  function confirmRemoveRoutine() {
    if (!routine) return;
    if (routines.length <= 1) {
      Alert.alert('Geht nicht', 'Mindestens eine Routine muss übrig bleiben.');
      return;
    }
    Alert.alert('Routine löschen?', `"${routine.label}" wird komplett entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          removeRoutine(routine.id);
          setSelectedId(routines.find((r) => r.id !== routine.id)?.id ?? '');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>Trainingsplan bearbeiten</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineSwitcher}>
          {routines.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => setSelectedId(r.id)}
              style={[styles.routineChip, r.id === selectedId && styles.routineChipActive]}
            >
              <Text style={[styles.routineChipText, r.id === selectedId && styles.routineChipTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.newRoutineChip} onPress={() => setShowRoutineForm((s) => !s)}>
            <Ionicons name="add" size={16} color={colors.tint} />
            <Text style={styles.newRoutineChipText}>Neue Routine</Text>
          </Pressable>
        </ScrollView>

        {showRoutineForm && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Name der neuen Routine (z. B. "Beine")</Text>
            <TextInput
              style={styles.input}
              value={newRoutineLabel}
              onChangeText={setNewRoutineLabel}
              placeholder="Legs"
              placeholderTextColor={colors.tertiaryLabel}
              autoFocus
            />
            <GradientButton label="Routine erstellen" onPress={submitRoutine} style={{ marginTop: spacing.sm }} />
          </View>
        )}

        {routine && (
          <>
            <View style={styles.routineHeaderRow}>
              <Text style={styles.routineTitle}>{routine.label}</Text>
              <Pressable onPress={confirmRemoveRoutine} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.tertiaryLabel} />
              </Pressable>
            </View>

            {routine.exercises.length === 0 && (
              <Text style={styles.emptyText}>Noch keine Übungen in dieser Routine.</Text>
            )}

            {routine.exercises.map((ex) => (
              <View key={ex.name} style={styles.exerciseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.targetSets} Sätze × {ex.targetReps} Wdh. · {ex.restSeconds}s Pause
                  </Text>
                </View>
                <Pressable onPress={() => removeExercise(routine.id, ex.name)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.tertiaryLabel} />
                </Pressable>
              </View>
            ))}

            {!showExerciseForm ? (
              <Pressable style={styles.addExerciseBtn} onPress={() => setShowExerciseForm(true)}>
                <Ionicons name="add" size={16} color={colors.tint} />
                <Text style={styles.addExerciseText}>Übung hinzufügen</Text>
              </Pressable>
            ) : (
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>Übungsname</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="z. B. Beinpresse"
                  placeholderTextColor={colors.tertiaryLabel}
                  autoFocus
                />
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Sätze</Text>
                    <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="number-pad" />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Wdh.-Range</Text>
                    <TextInput style={styles.input} value={reps} onChangeText={setReps} placeholder="8-12" placeholderTextColor={colors.tertiaryLabel} />
                  </View>
                </View>
                <View style={styles.formRow}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Startgewicht (kg)</Text>
                    <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Pause (Sek.)</Text>
                    <TextInput style={styles.input} value={rest} onChangeText={setRest} keyboardType="number-pad" />
                  </View>
                </View>
                <View style={styles.formActions}>
                  <Pressable style={styles.cancelBtn} onPress={resetExerciseForm}>
                    <Text style={styles.cancelText}>Abbrechen</Text>
                  </Pressable>
                  <GradientButton label="Hinzufügen" onPress={submitExercise} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </>
        )}
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
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.label },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  routineSwitcher: { gap: spacing.sm, paddingBottom: spacing.md },
  routineChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routineChipActive: { backgroundColor: colors.tint, borderColor: colors.tint },
  routineChipText: { fontSize: 13, fontWeight: '700', color: colors.secondaryLabel },
  routineChipTextActive: { color: colors.background },
  newRoutineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.tint,
    borderStyle: 'dashed',
  },
  newRoutineChipText: { fontSize: 13, fontWeight: '700', color: colors.tint },
  routineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routineTitle: { fontSize: 19, fontWeight: '700', color: colors.label },
  emptyText: { fontSize: 13, color: colors.tertiaryLabel, fontStyle: 'italic', marginBottom: spacing.md },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  exerciseName: { fontSize: 14.5, fontWeight: '600', color: colors.label },
  exerciseMeta: { fontSize: 12, color: colors.secondaryLabel, marginTop: 2 },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  addExerciseText: { fontSize: 13.5, fontWeight: '700', color: colors.tint },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  formLabel: { fontSize: 11.5, fontWeight: '700', color: colors.secondaryLabel, marginBottom: 6 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
    fontSize: 14.5,
    color: colors.label,
    marginBottom: spacing.sm,
  },
  formRow: { flexDirection: 'row', gap: spacing.sm },
  formCol: { flex: 1 },
  formActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: 4 },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: spacing.sm },
  cancelText: { fontSize: 13.5, fontWeight: '700', color: colors.secondaryLabel },
});
