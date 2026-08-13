import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';
import type { PhaseType } from '../types/database';

const PHASE_LABELS: Record<PhaseType, string> = {
  cutting: 'Cutting Phase',
  bulking: 'Bulking Phase',
  maintenance: 'Maintenance',
};

const PHASE_COLORS: Record<PhaseType, string> = {
  cutting: colors.cutting,
  bulking: colors.bulking,
  maintenance: colors.maintenance,
};

export function PhaseBadge({ type }: { type: PhaseType }) {
  const color = PHASE_COLORS[type];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{PHASE_LABELS[type]}</Text>
      <Ionicons name="chevron-down" size={12} color={color} style={{ marginLeft: 3 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
