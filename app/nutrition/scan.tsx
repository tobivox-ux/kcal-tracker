import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../../src/theme/colors';

type Step = 'idle' | 'analyzing' | 'result';

// Demo-Schätzung, die nach ein paar Sekunden "erkannt" wird. In echt ruft
// dieser Schritt eine Supabase Edge Function auf, die das Foto an ein
// Vision-Modell schickt und Lebensmittel + Makros zurückgibt.
const MOCK_RESULT = {
  label: 'Hähnchenbrust mit Reis & Brokkoli',
  confidence: 0.86,
  calories: 480,
  proteinG: 42,
  carbsG: 48,
  fatG: 14,
};

export default function ScanFoodScreen() {
  const [step, setStep] = useState<Step>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState(MOCK_RESULT);

  async function pickImage(source: 'camera' | 'library') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });

    if (pickerResult.canceled || !pickerResult.assets?.[0]) return;

    setImageUri(pickerResult.assets[0].uri);
    setStep('analyzing');
    setResult(MOCK_RESULT);
    setTimeout(() => setStep('result'), 1800);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.label} />
        </Pressable>
        <Text style={styles.headerTitle}>Foto-Scan</Text>
        <View style={{ width: 24 }} />
      </View>

      {step === 'idle' && (
        <View style={styles.center}>
          <View style={styles.cameraIconWrap}>
            <Ionicons name="camera" size={40} color={colors.tint} />
          </View>
          <Text style={styles.idleTitle}>Mahlzeit fotografieren</Text>
          <Text style={styles.idleSubtitle}>
            Die KI schätzt automatisch, was auf dem Teller ist, und wie viele Kalorien & Makros es hat.
          </Text>

          <Pressable style={styles.primaryBtn} onPress={() => pickImage('camera')}>
            <Ionicons name="camera" size={18} color={colors.background} />
            <Text style={styles.primaryBtnText}>Foto aufnehmen</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => pickImage('library')}>
            <Ionicons name="images" size={18} color={colors.label} />
            <Text style={styles.secondaryBtnText}>Aus Galerie wählen</Text>
          </Pressable>
        </View>
      )}

      {step === 'analyzing' && (
        <View style={styles.center}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.lg }} />
          <Text style={styles.analyzingText}>KI analysiert dein Foto...</Text>
        </View>
      )}

      {step === 'result' && (
        <View style={styles.resultWrap}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultLabel}>{result.label}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{Math.round(result.confidence * 100)}% sicher</Text>
              </View>
            </View>
            <Text style={styles.resultHint}>Werte prüfen und bei Bedarf anpassen, bevor du sie hinzufügst.</Text>

            <EditableMacro label="kcal" value={result.calories} color={colors.calories} onChange={(v) => setResult((r) => ({ ...r, calories: v }))} />
            <EditableMacro label="Protein (g)" value={result.proteinG} color={colors.protein} onChange={(v) => setResult((r) => ({ ...r, proteinG: v }))} />
            <EditableMacro label="Carbs (g)" value={result.carbsG} color={colors.carbs} onChange={(v) => setResult((r) => ({ ...r, carbsG: v }))} />
            <EditableMacro label="Fett (g)" value={result.fatG} color={colors.fat} onChange={(v) => setResult((r) => ({ ...r, fatG: v }))} />
          </View>

          <Pressable style={styles.retakeBtn} onPress={() => setStep('idle')}>
            <Text style={styles.retakeText}>Neues Foto</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Eintrag hinzufügen</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

function EditableMacro({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.macroRow}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <TextInput
        style={styles.macroInput}
        keyboardType="number-pad"
        value={String(value)}
        onChangeText={(t) => onChange(parseInt(t, 10) || 0)}
      />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  cameraIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,90,54,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  idleTitle: { fontSize: 19, fontWeight: '700', color: colors.label, marginBottom: 6, textAlign: 'center' },
  idleSubtitle: {
    fontSize: 13.5,
    color: colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.tint,
    borderRadius: radius.full,
    paddingVertical: 15,
    width: '100%',
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: colors.background, fontSize: 15.5, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 15,
    width: '100%',
  },
  secondaryBtnText: { color: colors.label, fontSize: 15.5, fontWeight: '700' },
  preview: { width: '100%', height: 220, borderRadius: radius.lg, marginBottom: spacing.sm },
  analyzingText: { fontSize: 14, color: colors.secondaryLabel, marginTop: spacing.sm, fontWeight: '600' },
  resultWrap: { flex: 1, padding: spacing.md },
  resultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  resultLabel: { fontSize: 17, fontWeight: '700', color: colors.label, flex: 1 },
  confidenceBadge: {
    backgroundColor: 'rgba(180,255,57,0.14)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confidenceText: { fontSize: 11, fontWeight: '700', color: colors.success },
  resultHint: { fontSize: 12, color: colors.secondaryLabel, marginTop: 4, marginBottom: spacing.md },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  macroLabel: { flex: 1, fontSize: 14, color: colors.label, fontWeight: '600' },
  macroInput: {
    width: 64,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  retakeBtn: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  retakeText: { fontSize: 13, color: colors.tint, fontWeight: '600' },
});
