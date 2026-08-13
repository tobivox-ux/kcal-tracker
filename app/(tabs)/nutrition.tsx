import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { MEAL_SECTIONS } from '../../src/lib/demoData';
import { scheduleDailyTrackingReminder, scheduleHydrationReminders } from '../../src/lib/notifications';
import { useNutritionStore, dailyTotalsFromEntries } from '../../src/store/nutritionStore';
import { useActivePhase } from '../../src/store/phaseStore';
import { useBaseMealStore } from '../../src/store/baseMealStore';
import {
  useHydrationStore,
  totalMl,
  DRINK_OPTIONS,
  DAILY_HYDRATION_TARGET_ML,
} from '../../src/store/hydrationStore';
import type { MealType } from '../../src/types/database';

export default function NutritionScreen() {
  const activePhase = useActivePhase();
  const entries = useNutritionStore((s) => s.entries);
  const addEntry = useNutritionStore((s) => s.addEntry);
  const removeEntry = useNutritionStore((s) => s.removeEntry);
  const checkMidnightReset = useNutritionStore((s) => s.checkMidnightReset);
  const today = dailyTotalsFromEntries(entries);

  const baseMeals = useBaseMealStore((s) => s.meals);
  const addBaseMeal = useBaseMealStore((s) => s.addMeal);
  const removeBaseMeal = useBaseMealStore((s) => s.removeMeal);

  const drinks = useHydrationStore((s) => s.entries);
  const addDrink = useHydrationStore((s) => s.addDrink);
  const removeDrink = useHydrationStore((s) => s.removeDrink);
  const checkDrinkReset = useHydrationStore((s) => s.checkMidnightReset);
  const drunkMl = totalMl(drinks);

  const [showBaseForm, setShowBaseForm] = useState(false);
  const [bmName, setBmName] = useState('');
  const [bmQuantity, setBmQuantity] = useState('');
  const [bmKcal, setBmKcal] = useState('');
  const [bmProtein, setBmProtein] = useState('');
  const [bmCarbs, setBmCarbs] = useState('');
  const [bmFat, setBmFat] = useState('');
  const [bmMeal, setBmMeal] = useState<MealType>('breakfast');

  useEffect(() => {
    checkMidnightReset();
    checkDrinkReset();
    scheduleDailyTrackingReminder().catch(() => {});
    scheduleHydrationReminders().catch(() => {});
  }, [checkMidnightReset, checkDrinkReset]);

  function submitBaseMeal() {
    if (!bmName.trim()) return;
    addBaseMeal({
      emoji: '🍽️',
      name: bmName.trim(),
      quantity: bmQuantity.trim() || '1 Portion',
      defaultMeal: bmMeal,
      calories: parseInt(bmKcal, 10) || 0,
      proteinG: parseInt(bmProtein, 10) || 0,
      carbsG: parseInt(bmCarbs, 10) || 0,
      fatG: parseInt(bmFat, 10) || 0,
    });
    setBmName('');
    setBmQuantity('');
    setBmKcal('');
    setBmProtein('');
    setBmCarbs('');
    setBmFat('');
    setShowBaseForm(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        <View style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <Text style={styles.sectionLabel}>💧 Getränke</Text>
            <Text style={styles.hydrationValue}>
              {(drunkMl / 1000).toFixed(1)} / {(DAILY_HYDRATION_TARGET_ML / 1000).toFixed(1)} l
            </Text>
          </View>
          <View style={styles.hydrationTrack}>
            <View
              style={[
                styles.hydrationFill,
                { width: `${Math.min(100, Math.round((drunkMl / DAILY_HYDRATION_TARGET_ML) * 100))}%` },
              ]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinkRow}>
            {DRINK_OPTIONS.map((d) => (
              <Pressable key={d.id} style={styles.drinkChip} onPress={() => addDrink(d.id)}>
                <Text style={styles.drinkEmoji}>{d.emoji}</Text>
                <Text style={styles.drinkLabel}>{d.label}</Text>
                <Text style={styles.drinkMl}>{d.defaultMl} ml</Text>
              </Pressable>
            ))}
          </ScrollView>
          {drinks.length > 0 && (
            <View style={styles.drinkLogRow}>
              {drinks.map((d) => (
                <Pressable key={d.id} style={styles.drinkPill} onPress={() => removeDrink(d.id)}>
                  <Text style={styles.drinkPillText}>
                    {d.emoji} {d.ml}ml
                  </Text>
                  <Ionicons name="close" size={11} color={colors.tertiaryLabel} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>⭐ Basis-Mahlzeiten</Text>
          <Pressable onPress={() => setShowBaseForm((v) => !v)} hitSlop={8}>
            <Text style={styles.sectionAction}>{showBaseForm ? 'Abbrechen' : '+ Neu'}</Text>
          </Pressable>
        </View>

        {showBaseForm && (
          <View style={styles.baseForm}>
            <TextInput
              style={styles.formInput}
              placeholder="Name (z. B. Thunfisch-Bowl)"
              placeholderTextColor={colors.tertiaryLabel}
              value={bmName}
              onChangeText={setBmName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Menge (z. B. 200 g + 150 g)"
              placeholderTextColor={colors.tertiaryLabel}
              value={bmQuantity}
              onChangeText={setBmQuantity}
            />
            <View style={styles.formRow}>
              <TextInput style={[styles.formInput, styles.formCol]} placeholder="kcal" placeholderTextColor={colors.tertiaryLabel} keyboardType="number-pad" value={bmKcal} onChangeText={setBmKcal} />
              <TextInput style={[styles.formInput, styles.formCol]} placeholder="Protein" placeholderTextColor={colors.tertiaryLabel} keyboardType="number-pad" value={bmProtein} onChangeText={setBmProtein} />
            </View>
            <View style={styles.formRow}>
              <TextInput style={[styles.formInput, styles.formCol]} placeholder="Carbs" placeholderTextColor={colors.tertiaryLabel} keyboardType="number-pad" value={bmCarbs} onChangeText={setBmCarbs} />
              <TextInput style={[styles.formInput, styles.formCol]} placeholder="Fett" placeholderTextColor={colors.tertiaryLabel} keyboardType="number-pad" value={bmFat} onChangeText={setBmFat} />
            </View>
            <View style={styles.formRow}>
              {MEAL_SECTIONS.map((sct) => (
                <Pressable
                  key={sct.meal}
                  onPress={() => setBmMeal(sct.meal)}
                  style={[styles.mealPickChip, bmMeal === sct.meal && styles.mealPickChipActive]}
                >
                  <Text style={[styles.mealPickText, bmMeal === sct.meal && styles.mealPickTextActive]}>
                    {sct.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.formSubmit} onPress={submitBaseMeal}>
              <Text style={styles.formSubmitText}>Basis-Mahlzeit speichern</Text>
            </Pressable>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.baseScroll}>
          {baseMeals.map((bm) => (
            <Pressable
              key={bm.id}
              style={styles.baseCard}
              onPress={() => addEntry(bm.defaultMeal, bm)}
            >
              <Pressable style={styles.baseDelete} onPress={() => removeBaseMeal(bm.id)} hitSlop={6}>
                <Ionicons name="close" size={11} color={colors.tertiaryLabel} />
              </Pressable>
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
      </KeyboardAvoidingView>
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
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionAction: { fontSize: 12.5, fontWeight: '700', color: colors.tint, marginBottom: spacing.sm },
  hydrationCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hydrationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hydrationValue: { fontSize: 13, fontWeight: '700', color: colors.maintenance, marginBottom: spacing.sm },
  hydrationTrack: { height: 8, borderRadius: 4, backgroundColor: colors.cardAlt, overflow: 'hidden' },
  hydrationFill: { height: '100%', backgroundColor: colors.maintenance, borderRadius: 4 },
  drinkRow: { gap: spacing.sm, paddingTop: spacing.sm + 2 },
  drinkChip: {
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 76,
  },
  drinkEmoji: { fontSize: 17 },
  drinkLabel: { fontSize: 10.5, fontWeight: '700', color: colors.label, marginTop: 3 },
  drinkMl: { fontSize: 9.5, color: colors.secondaryLabel, marginTop: 1 },
  drinkLogRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  drinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  drinkPillText: { fontSize: 10.5, color: colors.secondaryLabel, fontWeight: '600' },
  baseForm: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  formInput: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 9,
    fontSize: 13.5,
    color: colors.label,
  },
  formRow: { flexDirection: 'row', gap: spacing.sm },
  formCol: { flex: 1 },
  mealPickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.cardAlt,
  },
  mealPickChipActive: { backgroundColor: colors.tint },
  mealPickText: { fontSize: 10, fontWeight: '700', color: colors.secondaryLabel },
  mealPickTextActive: { color: colors.background },
  formSubmit: { backgroundColor: colors.tint, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center' },
  formSubmitText: { fontSize: 13.5, fontWeight: '700', color: colors.background },
  baseDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
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
