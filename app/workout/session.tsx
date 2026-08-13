import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { routineDays, type DemoSet } from '../../src/lib/demoData';
import { suggestNextSession } from '../../src/lib/progression';
import { scheduleRestTimerNotification, cancelRestTimerNotification } from '../../src/lib/notifications';
import { GradientButton } from '../../src/components/GradientButton';

interface ExerciseState {
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  sets: DemoSet[];
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function WorkoutSessionScreen() {
  const { day: dayId } = useLocalSearchParams<{ day: string }>();
  const day = routineDays.find((d) => d.id === dayId) ?? routineDays[0];

  // Unveränderte Momentaufnahme der letzten Session — Basis für
  // PR-Erkennung und Progressions-Vorschläge, unabhängig von Live-Edits.
  const baselineRef = useRef(day.exercises.map((ex) => ex.sets.map((s) => ({ ...s }))));
  const suggestions = useMemo(() => day.exercises.map((ex) => suggestNextSession(ex)), [day]);

  const [exercises, setExercises] = useState<ExerciseState[]>(() =>
    day.exercises.map((ex) => ({
      name: ex.name,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      restSeconds: ex.restSeconds,
      sets: ex.sets.map((s) => ({ ...s, done: false })),
    }))
  );

  const [elapsed, setElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [prSet, setPrSet] = useState<{ ex: number; set: number } | null>(null);
  const prAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setRestRemaining((r) => {
        if (r === null) return null;
        if (r <= 1) {
          Vibration.vibrate(400);
          cancelRestTimerNotification().catch(() => {});
          return null;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

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

  function triggerPrBadge(exIndex: number, setIndex: number) {
    setPrSet({ ex: exIndex, set: setIndex });
    prAnim.setValue(0);
    Animated.sequence([
      Animated.spring(prAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
      Animated.delay(900),
      Animated.timing(prAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setPrSet(null));
  }

  function toggleSetDone(exIndex: number, setIndex: number) {
    const exercise = exercises[exIndex];
    const set = exercise.sets[setIndex];
    const nowDone = !set.done;
    updateSet(exIndex, setIndex, { done: nowDone });

    if (!nowDone) return;

    const baseline = baselineRef.current[exIndex]?.[setIndex];
    if (baseline) {
      const isPr =
        set.weightKg > baseline.weightKg || (set.weightKg === baseline.weightKg && set.reps > baseline.reps);
      if (isPr) triggerPrBadge(exIndex, setIndex);
    }

    setRestTotal(exercise.restSeconds);
    setRestRemaining(exercise.restSeconds);
    scheduleRestTimerNotification(exercise.restSeconds).catch(() => {});
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

  const restProgress = restRemaining !== null && restTotal > 0 ? 1 - restRemaining / restTotal : 0;

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
        <View style={styles.sessionClock}>
          <Ionicons name="time-outline" size={13} color={colors.secondaryLabel} />
          <Text style={styles.sessionClockText}>{formatClock(elapsed)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, restRemaining !== null && { paddingBottom: 110 }]}>
        {exercises.map((exercise, exIndex) => (
          <View key={exercise.name} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTarget}>
              Ziel: {exercise.targetSets} × {exercise.targetReps} Wdh.
            </Text>
            <View style={styles.suggestionRow}>
              <Text style={styles.suggestionIcon}>💡</Text>
              <Text style={styles.suggestionText}>{suggestions[exIndex].reason}</Text>
            </View>

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
                <View style={styles.checkColWrap}>
                  <Pressable
                    style={[styles.checkCol, styles.setCheck, set.done && styles.setCheckDone]}
                    onPress={() => toggleSetDone(exIndex, setIndex)}
                  >
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={set.done ? colors.background : colors.tertiaryLabel}
                    />
                  </Pressable>
                  {prSet && prSet.ex === exIndex && prSet.set === setIndex && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.prBadge,
                        {
                          opacity: prAnim,
                          transform: [
                            { scale: prAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
                            { translateY: prAnim.interpolate({ inputRange: [0, 1], outputRange: [4, -22] }) },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.prBadgeText}>💪 PR</Text>
                    </Animated.View>
                  )}
                </View>
              </View>
            ))}

            <Pressable style={styles.addSetBtn} onPress={() => addSet(exIndex)}>
              <Ionicons name="add" size={16} color={colors.tint} />
              <Text style={styles.addSetText}>Satz hinzufügen</Text>
            </Pressable>
          </View>
        ))}

        <GradientButton label="Workout beenden" style={styles.finishButton} onPress={() => router.back()} />
      </ScrollView>

      {restRemaining !== null && (
        <View style={styles.restBar}>
          <View style={styles.restTrack}>
            <View style={[styles.restFill, { width: `${Math.round(restProgress * 100)}%` }]} />
          </View>
          <View style={styles.restRow}>
            <Text style={styles.restLabel}>Pause</Text>
            <Text style={styles.restClock}>{formatClock(restRemaining)}</Text>
            <View style={styles.restActions}>
              <Pressable
                style={styles.restBtn}
                onPress={() =>
                  setRestRemaining((r) => {
                    const next = Math.max(0, (r ?? 0) - 15);
                    scheduleRestTimerNotification(next).catch(() => {});
                    return next;
                  })
                }
              >
                <Text style={styles.restBtnText}>-15s</Text>
              </Pressable>
              <Pressable
                style={styles.restBtn}
                onPress={() =>
                  setRestRemaining((r) => {
                    const next = (r ?? 0) + 15;
                    scheduleRestTimerNotification(next).catch(() => {});
                    return next;
                  })
                }
              >
                <Text style={styles.restBtnText}>+15s</Text>
              </Pressable>
              <Pressable
                style={styles.restSkip}
                onPress={() => {
                  setRestRemaining(null);
                  cancelRestTimerNotification().catch(() => {});
                }}
              >
                <Ionicons name="close" size={16} color={colors.label} />
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  sessionClock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 54,
    justifyContent: 'flex-end',
  },
  sessionClockText: { fontSize: 12.5, fontWeight: '700', color: colors.secondaryLabel, fontVariant: ['tabular-nums'] },
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
  exerciseTarget: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 2 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 6, marginBottom: spacing.sm },
  suggestionIcon: { fontSize: 12 },
  suggestionText: { flex: 1, fontSize: 12, color: colors.tint, fontWeight: '600', lineHeight: 16 },
  setHeaderRow: { flexDirection: 'row', paddingBottom: 6 },
  setHeaderCell: { fontSize: 11, fontWeight: '700', color: colors.tertiaryLabel, textAlign: 'center' },
  setCol: { width: 36 },
  weightCol: { flex: 1, marginHorizontal: 6 },
  repsCol: { flex: 1, marginHorizontal: 6 },
  checkCol: { width: 34 },
  checkColWrap: { width: 34, position: 'relative' },
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
  prBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: colors.celebrate,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  prBadgeText: { fontSize: 10, fontWeight: '700', color: colors.background },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 8,
  },
  addSetText: { fontSize: 13, fontWeight: '700', color: colors.tint },
  finishButton: { marginTop: spacing.sm },
  restBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: spacing.md,
  },
  restTrack: { height: 3, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  restFill: { height: '100%', backgroundColor: colors.tint },
  restRow: { flexDirection: 'row', alignItems: 'center' },
  restLabel: { fontSize: 13, fontWeight: '700', color: colors.secondaryLabel, width: 48 },
  restClock: { fontSize: 22, fontWeight: '700', color: colors.label, flex: 1, fontVariant: ['tabular-nums'] },
  restActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.label },
  restSkip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
