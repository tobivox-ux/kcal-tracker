import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../../src/theme/colors';
import {
  CARDIO_MACHINES,
  INTENSITY_LABELS,
  estimateCardioKcal,
  type CardioIntensity,
} from '../../src/lib/cardio';
import { useWorkoutHistoryStore } from '../../src/store/workoutHistoryStore';
import { useBodyWeightStore } from '../../src/store/bodyWeightStore';
import { GradientButton } from '../../src/components/GradientButton';

// Was ein Vision-Modell später aus dem Foto des Gerätedisplays ausliest.
// Bis dahin eine feste Demo-Antwort — der Wert ist bewusst die *Anzeige*
// des Geräts, die Umrechnung passiert danach in estimateCardioKcal.
const MOCK_SCAN = { durationMin: '32', displayedKcal: '410' };

export default function CardioScreen() {
  const addCardio = useWorkoutHistoryStore((s) => s.addCardio);
  const weightEntries = useBodyWeightStore((s) => s.entries);
  const bodyWeightKg = weightEntries[weightEntries.length - 1]?.weightKg ?? 72;

  const [machineId, setMachineId] = useState(CARDIO_MACHINES[1].id);
  const [intensity, setIntensity] = useState<CardioIntensity>('moderate');
  const [durationMin, setDurationMin] = useState('30');
  const [displayedKcal, setDisplayedKcal] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const machine = CARDIO_MACHINES.find((m) => m.id === machineId)!;
  const minutes = parseInt(durationMin, 10) || 0;
  const shown = parseInt(displayedKcal, 10) || 0;
  const estimate = estimateCardioKcal(machineId, intensity, minutes, bodyWeightKg, shown);

  async function scanDisplay() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (result.canceled || !result.assets?.[0]) return;

    setImageUri(result.assets[0].uri);
    setScanning(true);
    setTimeout(() => {
      setDurationMin(MOCK_SCAN.durationMin);
      setDisplayedKcal(MOCK_SCAN.displayedKcal);
      setScanning(false);
    }, 1600);
  }

  function save() {
    if (minutes <= 0) return;
    addCardio({
      machine: machine.label,
      durationMin: minutes,
      displayedKcal: shown,
      estimatedKcal: estimate.netKcal,
    });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>Cardio hinzufügen</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.scanCard} onPress={scanDisplay}>
            <View style={styles.scanIcon}>
              <Ionicons name="camera" size={20} color={colors.background} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanTitle}>Display abfotografieren</Text>
              <Text style={styles.scanSub}>Dauer & angezeigte kcal automatisch übernehmen</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
          </Pressable>

          {imageUri && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              {scanning && (
                <View style={styles.scanOverlay}>
                  <ActivityIndicator color={colors.tint} />
                  <Text style={styles.scanOverlayText}>Display wird gelesen...</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.label}>Gerät</Text>
          <View style={styles.machineGrid}>
            {CARDIO_MACHINES.map((m) => {
              const active = m.id === machineId;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMachineId(m.id)}
                  style={[styles.machineChip, active && styles.machineChipActive]}
                >
                  <Text style={styles.machineEmoji}>{m.emoji}</Text>
                  <Text style={[styles.machineLabel, active && styles.machineLabelActive]} numberOfLines={2}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Intensität</Text>
          <View style={styles.intensityRow}>
            {(Object.keys(INTENSITY_LABELS) as CardioIntensity[]).map((key) => {
              const active = key === intensity;
              return (
                <Pressable
                  key={key}
                  onPress={() => setIntensity(key)}
                  style={[styles.intensityChip, active && styles.intensityChipActive]}
                >
                  <Text style={[styles.intensityText, active && styles.intensityTextActive]}>
                    {INTENSITY_LABELS[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Dauer (min)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={durationMin}
                onChangeText={setDurationMin}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Gerät zeigt (kcal)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={displayedKcal}
                onChangeText={setDisplayedKcal}
                placeholder="optional"
                placeholderTextColor={colors.tertiaryLabel}
              />
            </View>
          </View>

          <View style={styles.estimateCard}>
            <Text style={styles.estimateLabel}>Realistische Schätzung</Text>
            <Text style={styles.estimateValue}>
              {estimate.netKcal} <Text style={styles.estimateUnit}>kcal</Text>
            </Text>
            {estimate.overestimatePct !== null && estimate.overestimatePct > 0 && (
              <View style={styles.compareRow}>
                <Text style={styles.compareStrike}>{estimate.displayedKcal} kcal</Text>
                <Text style={styles.compareArrow}>→</Text>
                <Text style={styles.compareReal}>{estimate.netKcal} kcal</Text>
              </View>
            )}
            <Text style={styles.estimateNote}>{estimate.note}</Text>
            <Text style={styles.estimateSmall}>
              Berechnet über MET bei {bodyWeightKg} kg, ohne Grundumsatz (der steckt schon in deinem Tagesziel).
            </Text>
          </View>

          <GradientButton label="Cardio speichern" onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: { fontSize: 14, fontWeight: '700', color: colors.label },
  scanSub: { fontSize: 11.5, color: colors.secondaryLabel, marginTop: 1 },
  previewWrap: { marginBottom: spacing.md },
  preview: { width: '100%', height: 160, borderRadius: radius.md },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,12,16,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
  },
  scanOverlayText: { fontSize: 12.5, color: colors.label, fontWeight: '600' },
  label: { fontSize: 11.5, fontWeight: '700', color: colors.secondaryLabel, marginBottom: 6 },
  machineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  machineChip: {
    width: '31%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  machineChipActive: { borderColor: colors.tint, backgroundColor: 'rgba(255,90,54,0.12)' },
  machineEmoji: { fontSize: 18, marginBottom: 3 },
  machineLabel: { fontSize: 10.5, fontWeight: '600', color: colors.secondaryLabel, textAlign: 'center' },
  machineLabelActive: { color: colors.label },
  intensityRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  intensityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intensityChipActive: { backgroundColor: colors.tint, borderColor: colors.tint },
  intensityText: { fontSize: 12.5, fontWeight: '700', color: colors.secondaryLabel },
  intensityTextActive: { color: colors.background },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  inputCol: { flex: 1 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '600',
    color: colors.label,
  },
  estimateCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  estimateLabel: { fontSize: 11.5, fontWeight: '700', color: colors.secondaryLabel },
  estimateValue: { fontSize: 32, fontWeight: '700', color: colors.tint, marginTop: 2 },
  estimateUnit: { fontSize: 15, color: colors.secondaryLabel, fontWeight: '600' },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  compareStrike: {
    fontSize: 13,
    color: colors.tertiaryLabel,
    textDecorationLine: 'line-through',
  },
  compareArrow: { fontSize: 13, color: colors.tertiaryLabel },
  compareReal: { fontSize: 13, fontWeight: '700', color: colors.success },
  estimateNote: { fontSize: 12.5, color: colors.label, marginTop: spacing.sm, lineHeight: 18 },
  estimateSmall: { fontSize: 11, color: colors.tertiaryLabel, marginTop: 6, lineHeight: 16 },
});
