import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, ctaGradient } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Eigenes Logo: eine Hantel im aufgerollten Kalorien-Ring — nimmt das
// Ring-Motiv vom Dashboard auf, damit Splash und App zusammengehören.
export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const ring = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ring, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(content, {
          toValue: 1,
          duration: 700,
          delay: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(500),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [ring, content, fadeOut, onDone]);

  const circumference = 2 * Math.PI * 52;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeOut }]} pointerEvents="none">
      <Animated.View
        style={{
          opacity: content,
          transform: [
            { scale: content.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
          ],
        }}
      >
        <View style={styles.logoWrap}>
          <Svg width={128} height={128} viewBox="0 0 128 128">
            <Defs>
              <LinearGradient id="splashRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={ctaGradient[0]} />
                <Stop offset="100%" stopColor={ctaGradient[1]} />
              </LinearGradient>
            </Defs>
            <Circle cx={64} cy={64} r={52} stroke={colors.cardAlt} strokeWidth={8} fill="none" />
            <AnimatedCircle
              cx={64}
              cy={64}
              r={52}
              stroke="url(#splashRing)"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={ring.interpolate({
                inputRange: [0, 1],
                outputRange: [circumference, circumference * 0.18],
              })}
              rotation={-90}
              originX={64}
              originY={64}
            />
            {/* Hantel */}
            <Path
              d="M44 64 h40"
              stroke={colors.label}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />
            <Path d="M40 54 v20 M88 54 v20" stroke={colors.label} strokeWidth={8} strokeLinecap="round" />
            <Path d="M32 58 v12 M96 58 v12" stroke={colors.tint} strokeWidth={7} strokeLinecap="round" />
          </Svg>
        </View>

        <Text style={styles.appName}>KCAL TRACKER</Text>
        <Text style={styles.tagline}>Push · Pull · Progress</Text>
      </Animated.View>

      <Animated.Text style={[styles.poweredBy, { opacity: content }]}>
        powered by <Text style={styles.poweredByName}>Emil Salomon</Text>
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.label,
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12.5,
    color: colors.tint,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
  },
  poweredBy: {
    position: 'absolute',
    bottom: 56,
    fontSize: 12,
    color: colors.tertiaryLabel,
  },
  poweredByName: { color: colors.secondaryLabel, fontWeight: '700' },
});
