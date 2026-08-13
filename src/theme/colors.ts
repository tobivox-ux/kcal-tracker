// Dark, high-contrast design tokens with one energetic signature accent —
// deliberately not the generic light iOS/SaaS look.
export const colors = {
  background: '#0B0C10',
  card: '#17181D',
  cardAlt: '#1E2027',
  border: '#2A2C34',
  label: '#F5F6F8',
  secondaryLabel: '#9298A3',
  tertiaryLabel: '#585C66',

  tint: '#FF5A36', // signature accent: CTAs, active tab, key numbers
  celebrate: '#FF2E7A', // second gradient stop for CTAs + PR/achievement moments

  calories: '#FF3B5C',
  protein: '#B4FF39',
  carbs: '#FFC337',
  fat: '#B26BFF', // also doubles as the Pull-day identity color (Push uses tint)

  cutting: '#FF3B5C',
  bulking: '#34D399',
  maintenance: '#4DA3FF',

  success: '#B4FF39',
  warning: '#FFC337',
} as const;

// Shared CTA gradient — used by <GradientButton> for a warmer, more
// energetic primary action than a flat fill.
export const ctaGradient = ['#FF5A36', '#FF2E7A'] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  full: 999,
} as const;

// Dark surfaces read as "elevated" via a hairline border, not a drop shadow
// (a black shadow is invisible on a near-black background).
export const cardStyle = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
} as const;
