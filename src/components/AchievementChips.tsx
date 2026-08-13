import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import type { Achievement } from '../lib/demoData';

export function AchievementChips({ items }: { items: Achievement[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>🏅 Erfolge</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((a) => (
          <View key={a.title} style={styles.chip}>
            <Text style={styles.chipEmoji}>{a.emoji}</Text>
            <Text style={styles.chipTitle}>{a.title}</Text>
            <Text style={styles.chipSubtitle}>{a.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.label, marginBottom: spacing.sm },
  scroll: { gap: spacing.sm, paddingRight: spacing.sm },
  chip: {
    width: 118,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  chipEmoji: { fontSize: 20, marginBottom: 4 },
  chipTitle: { fontSize: 13, fontWeight: '700', color: colors.label },
  chipSubtitle: { fontSize: 11, color: colors.secondaryLabel, marginTop: 2 },
});
