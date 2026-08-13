import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

interface MacroBarProps {
  label: string;
  currentG: number;
  targetG: number;
  color: string;
  emphasized?: boolean;
}

export function MacroBar({ label, currentG, targetG, color, emphasized }: MacroBarProps) {
  const progress = targetG > 0 ? Math.min(currentG / targetG, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, emphasized && styles.labelEmphasized]}>{label}</Text>
        <Text style={styles.valueText}>
          <Text style={[styles.current, emphasized && styles.currentEmphasized]}>{currentG}g</Text>
          <Text style={styles.target}> / {targetG}g</Text>
        </Text>
      </View>
      <View style={[styles.track, emphasized && styles.trackEmphasized]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.label,
  },
  labelEmphasized: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 14,
  },
  current: {
    fontWeight: '700',
    color: colors.label,
  },
  currentEmphasized: {
    fontSize: 16,
  },
  target: {
    color: colors.secondaryLabel,
  },
  track: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackEmphasized: {
    height: 14,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
