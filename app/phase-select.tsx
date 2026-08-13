import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../src/theme/colors';
import { phaseOptions } from '../src/lib/demoData';
import { usePhaseStore } from '../src/store/phaseStore';

const PHASE_COLOR = {
  cutting: colors.cutting,
  bulking: colors.bulking,
  maintenance: colors.maintenance,
} as const;

export default function PhaseSelectScreen() {
  const activeType = usePhaseStore((s) => s.activeType);
  const setPhase = usePhaseStore((s) => s.setPhase);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>Phase wechseln</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Die Phase steuert deine Tagesziele automatisch — Kalorien und Makros passen sich sofort an, Protein
          bleibt in jeder Phase hoch.
        </Text>

        {phaseOptions.map((phase) => {
          const active = phase.type === activeType;
          const c = PHASE_COLOR[phase.type];
          return (
            <Pressable
              key={phase.type}
              style={[styles.card, active && { borderColor: c, backgroundColor: `${c}14` }]}
              onPress={() => {
                setPhase(phase.type);
                router.back();
              }}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardName}>{phase.name}</Text>
                {active ? (
                  <View style={[styles.activeBadge, { backgroundColor: c }]}>
                    <Ionicons name="checkmark" size={13} color={colors.background} />
                  </View>
                ) : (
                  <View style={styles.inactiveDot} />
                )}
              </View>
              <Text style={styles.cardDescription}>{phase.description}</Text>
              <View style={styles.targetsRow}>
                <Target label="kcal" value={phase.calorieTarget} />
                <Target label="Protein" value={phase.proteinTargetG} unit="g" color={colors.protein} />
                <Target label="Carbs" value={phase.carbsTargetG} unit="g" color={colors.carbs} />
                <Target label="Fett" value={phase.fatTargetG} unit="g" color={colors.fat} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Target({ label, value, unit = '', color }: { label: string; value: number; unit?: string; color?: string }) {
  return (
    <View style={styles.target}>
      <Text style={[styles.targetValue, color && { color }]}>
        {value}
        {unit}
      </Text>
      <Text style={styles.targetLabel}>{label}</Text>
    </View>
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
  intro: { fontSize: 13, color: colors.secondaryLabel, lineHeight: 19, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16.5, fontWeight: '700', color: colors.label },
  activeBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  inactiveDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border },
  cardDescription: { fontSize: 12.5, color: colors.secondaryLabel, marginTop: 4, marginBottom: spacing.md, lineHeight: 18 },
  targetsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  target: { alignItems: 'center' },
  targetValue: { fontSize: 15, fontWeight: '700', color: colors.label },
  targetLabel: { fontSize: 10.5, color: colors.secondaryLabel, marginTop: 2 },
});
