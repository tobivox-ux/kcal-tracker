import { ReactNode } from 'react';
import { Text, Pressable, StyleSheet, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, ctaGradient, radius } from '../theme/colors';

interface GradientButtonProps extends PressableProps {
  label: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientButton({ label, icon, style, ...pressableProps }: GradientButtonProps) {
  return (
    <Pressable style={style} {...pressableProps}>
      <LinearGradient
        colors={ctaGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon}
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    borderRadius: radius.full,
    paddingVertical: 16,
  },
  text: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
