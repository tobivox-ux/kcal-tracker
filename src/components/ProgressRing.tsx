import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: readonly [string, string];
  trackColor?: string;
  label: string;
  value: string;
  /** Zahl in der Mitte; wenn gesetzt, zählt sie beim Aufrollen mit hoch. */
  countTo?: number;
}

export function ProgressRing({
  progress,
  size = 180,
  strokeWidth = 16,
  color = colors.calories,
  gradientColors,
  trackColor = colors.border,
  label,
  value,
  countTo,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const gradientId = 'progressRingGradient';

  // Ring rollt sich von 0 auf den aktuellen Stand auf, statt fertig
  // dazustehen — das macht beim Öffnen sofort sichtbar, wie voll der Tag ist.
  const anim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(countTo !== undefined ? 0 : null);

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      // strokeDashoffset ist kein natively animierbares Layout-Prop.
      useNativeDriver: false,
    }).start();
  }, [anim, clamped]);

  useEffect(() => {
    if (countTo === undefined) return;
    const id = anim.addListener(({ value: v }) => setDisplayValue(Math.round(countTo * v)));
    return () => anim.removeListener(id);
  }, [anim, countTo]);

  const animatedOffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - clamped)],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {gradientColors && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientColors ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={styles.value}>
            {displayValue !== null ? displayValue.toLocaleString('de-DE') : value}
          </Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.label,
  },
  label: {
    fontSize: 13,
    color: colors.secondaryLabel,
    marginTop: 2,
  },
});
