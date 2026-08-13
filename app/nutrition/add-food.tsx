import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../src/theme/colors';
import { foodDatabase, MEAL_SECTIONS, type DemoFood } from '../../src/lib/demoData';
import { useNutritionStore } from '../../src/store/nutritionStore';
import { GradientButton } from '../../src/components/GradientButton';
import type { MealType } from '../../src/types/database';

const MEAL_LABELS: Record<string, string> = Object.fromEntries(
  MEAL_SECTIONS.map((s) => [s.meal, s.label])
);

export default function AddFoodScreen() {
  const { meal } = useLocalSearchParams<{ meal?: MealType }>();
  const addEntry = useNutritionStore((s) => s.addEntry);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DemoFood | null>(null);
  const [grams, setGrams] = useState('100');

  const results = useMemo(
    () => foodDatabase.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const qty = parseFloat(grams.replace(',', '.')) || 0;
  const factor = qty / 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>{MEAL_LABELS[meal ?? ''] ?? 'Lebensmittel'} hinzufügen</Text>
        <View style={{ width: 24 }} />
      </View>

      {!selected ? (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={colors.secondaryLabel} />
            <TextInput
              style={styles.searchInput}
              placeholder="Lebensmittel suchen..."
              placeholderTextColor={colors.tertiaryLabel}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.emptyText}>Keine Treffer für "{query}"</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.resultRow} onPress={() => setSelected(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  {item.brand && <Text style={styles.resultBrand}>{item.brand}</Text>}
                </View>
                <Text style={styles.resultKcal}>{item.caloriesPer100g} kcal /100g</Text>
              </Pressable>
            )}
          />
        </>
      ) : (
        <View style={styles.detail}>
          <Text style={styles.detailName}>{selected.name}</Text>

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Menge</Text>
            <View style={styles.qtyInputWrap}>
              <TextInput
                style={styles.qtyInput}
                keyboardType="decimal-pad"
                value={grams}
                onChangeText={setGrams}
                autoFocus
              />
              <Text style={styles.qtyUnit}>g</Text>
            </View>
          </View>

          <View style={styles.macroPreview}>
            <MacroPreviewItem label="kcal" value={Math.round(selected.caloriesPer100g * factor)} color={colors.calories} />
            <MacroPreviewItem
              label="Protein"
              value={Math.round(selected.proteinPer100g * factor)}
              unit="g"
              color={colors.protein}
            />
            <MacroPreviewItem
              label="Carbs"
              value={Math.round(selected.carbsPer100g * factor)}
              unit="g"
              color={colors.carbs}
            />
            <MacroPreviewItem label="Fett" value={Math.round(selected.fatPer100g * factor)} unit="g" color={colors.fat} />
          </View>

          <Pressable style={styles.backToSearch} onPress={() => setSelected(null)}>
            <Text style={styles.backToSearchText}>Anderes Lebensmittel wählen</Text>
          </Pressable>

          <GradientButton
            label={`Zu ${MEAL_LABELS[meal ?? ''] ?? 'Mahlzeit'} hinzufügen`}
            onPress={() => {
              if (!meal) return;
              addEntry(meal, {
                name: selected.name,
                quantity: `${qty} g`,
                calories: Math.round(selected.caloriesPer100g * factor),
                proteinG: Math.round(selected.proteinPer100g * factor),
                carbsG: Math.round(selected.carbsPer100g * factor),
                fatG: Math.round(selected.fatPer100g * factor),
              });
              router.back();
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function MacroPreviewItem({
  label,
  value,
  unit = '',
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <View style={styles.macroPreviewItem}>
      <Text style={[styles.macroPreviewValue, { color }]}>
        {value}
        {unit}
      </Text>
      <Text style={styles.macroPreviewLabel}>{label}</Text>
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
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.label },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: colors.label, fontSize: 15 },
  list: { padding: spacing.md, paddingTop: spacing.sm },
  emptyText: { fontSize: 13, color: colors.secondaryLabel, textAlign: 'center', marginTop: spacing.lg },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.label },
  resultBrand: { fontSize: 11.5, color: colors.secondaryLabel, marginTop: 1 },
  resultKcal: { fontSize: 12.5, color: colors.secondaryLabel },
  detail: { padding: spacing.md },
  detailName: { fontSize: 22, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  qtyLabel: { fontSize: 15, fontWeight: '600', color: colors.label },
  qtyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
  },
  qtyInput: { fontSize: 17, fontWeight: '700', color: colors.label, padding: 8, width: 70, textAlign: 'right' },
  qtyUnit: { fontSize: 15, color: colors.secondaryLabel, marginLeft: 4 },
  macroPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  macroPreviewItem: { alignItems: 'center', flex: 1 },
  macroPreviewValue: { fontSize: 18, fontWeight: '700' },
  macroPreviewLabel: { fontSize: 11.5, color: colors.secondaryLabel, marginTop: 2 },
  backToSearch: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  backToSearchText: { fontSize: 13, color: colors.tint, fontWeight: '600' },
});
