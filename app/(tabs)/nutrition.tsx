import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { MEAL_SECTIONS, baseMeals } from '../../src/lib/demoData';
import { scheduleDailyTrackingReminder } from '../../src/lib/notifications';
import { useNutritionStore, dailyTotalsFromEntries } from '../../src/store/nutritionStore';
import { useActivePhase } from '../../src/store/phaseStore';

export default function NutritionScreen() {
  const activePhase = useActivePhase();
  const entries = useNutritionStore((s) => s.entries);
  const addEntry = useNutritionStore((s) => s.addEntry);
  const removeEntry = useNutritionStore((s) => s.removeEntry);
  const checkMidnightReset = useNutritionStore((s) => s.checkMidnightReset);
  const today = dailyTotalsFromEntries(entries);

  useEffect(() => {
    checkMidnightReset();
    scheduleDailyTrackingReminder().catch(() => {});
  }, [checkMidnightReset]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Ernährung heute</Text>

        <View style={styles.summaryCard}>
          <SummaryStat label="kcal" value={today.caloriesConsumed} target={activePhase.calorieTarget} />
          <SummaryStat
            label="Protein"
            value={today.proteinG}
            target={activePhase.proteinTargetG}
            unit="g"
            color={colors.protein}
            emphasized
          />
          <SummaryStat label="Carbs" value={today.carbsG} target={activePhase.carbsTargetG} unit="g" color={colors.carbs} />
          <SummaryStat label="Fett" value={today.fatG} target={activePhase.fatTargetG} unit="g" color={colors.fat} />
        </View>

        <Pressable style={styles.scanCard} onPress={() => router.push('/nutrition/scan')}>
          <View style={styles.scanIcon}>
            <Ionicons name="camera" size={22} color={colors.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanTitle}>Foto scannen</Text>
            <Text style={styles.scanSubtitle}>KI schätzt Kalorien & Makros aus einem Foto</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
        </Pressable>

        <Text style={styles.sectionLabel}>⭐ Basis-Mahlzeiten</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.baseScroll}>
          {baseMeals.map((bm) => (
            <Pressable
              key={bm.id}
              style={styles.baseCard}
              onPress={() => addEntry(bm.defaultMeal, bm)}
            >
              <Text style={styles.baseEmoji}>{bm.emoji}</Text>
              <Text style={styles.baseName} numberOfLines={2}>{bm.name}</Text>
              <Text style={styles.baseMeta}>{bm.calories} kcal · {bm.proteinG}g P</Text>
            </Pressable>
          ))}
        </ScrollView>

        {MEAL_SECTIONS.map((section) => {
          const mealEntries = entries[section.meal];
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);
          return (
            <View key={section.meal} style={styles.mealCard}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealLabel}>{section.label}</Text>
                <View style={styles.mealHeaderRight}>
                  {mealCalories > 0 && <Text style={styles.mealCalories}>{mealCalories} kcal</Text>}
                  <Pressable
                    style={styles.addButton}
                    onPress={() => router.push(`/nutrition/add-food?meal=${section.meal}`)}
                  >
                    <Ionicons name="add" size={18} color={colors.tint} />
                  </Pressable>
                </View>
              </View>
              {mealEntries.length === 0 ? (
                <Text style={styles.emptyText}>Noch nichts geloggt</Text>
              ) : (
                mealEntries.map((entry) => (
                  <View key={entry.id} style={styles.entryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryName}>{entry.name}</Text>
                      <Text style={styles.entryQuantity}>{entry.quantity}</Text>
                    </View>
                    <View style={styles.entryMacros}>
                      <Text style={styles.entryCalories}>{entry.calories} kcal</Text>
                      <Text style={styles.entryProtein}>{entry.proteinG}g Protein</Text>
                    </View>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => removeEntry(section.meal, entry.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.tertiaryLabel} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryStat({
  label,
  value,
  target,
  unit = '',
  color = colors.label,
  emphasized,
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, emphasized && styles.summaryValueEmphasized, { color }]}>
        {value}
        {unit}
      </Text>
      <Text style={styles.summaryTarget}>
        / {target}
        {unit}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
  },
  summaryStat: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 17, fontWeight: '700' },
  summaryValueEmphasized: { fontSize: 20 },
  summaryTarget: { fontSize: 11, color: colors.secondaryLabel },
  summaryLabel: { fontSize: 12, color: colors.secondaryLabel, marginTop: 4, fontWeight: '600' },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: 'rgba(255,90,54,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,90,54,0.32)',
    borderRadius: radius.lg,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: { fontSize: 14.5, fontWeight: '700', color: colors.label },
  scanSubtitle: { fontSize: 11.5, color: colors.secondaryLabel, marginTop: 1 },
  sectionLabel: { fontSize: 13.5, fontWeight: '700', color: colors.label, marginBottom: spacing.sm },
  baseScroll: { gap: spacing.sm, paddingBottom: spacing.md },
  baseCard: {
    width: 108,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  baseEmoji: { fontSize: 20, marginBottom: 6 },
  baseName: { fontSize: 12.5, fontWeight: '700', color: colors.label, lineHeight: 16 },
  baseMeta: { fontSize: 10.5, color: colors.secondaryLabel, marginTop: 4 },
  mealCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealLabel: { fontSize: 16, fontWeight: '700', color: colors.label },
  mealHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  mealCalories: { fontSize: 13, color: colors.secondaryLabel, marginRight: spacing.sm },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.tint}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: colors.tertiaryLabel, marginTop: spacing.sm, fontStyle: 'italic' },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  entryName: { fontSize: 14, fontWeight: '600', color: colors.label },
  entryQuantity: { fontSize: 12, color: colors.secondaryLabel, marginTop: 1 },
  entryMacros: { alignItems: 'flex-end', marginRight: spacing.sm },
  entryCalories: { fontSize: 13, fontWeight: '600', color: colors.label },
  entryProtein: { fontSize: 11, color: colors.protein, marginTop: 1, fontWeight: '600' },
  deleteButton: { padding: 4 },
});
