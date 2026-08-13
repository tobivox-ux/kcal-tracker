// iOS-inspired design tokens (San Francisco system font, iOS system colors)
export const colors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  border: '#E5E5EA',
  label: '#1C1C1E',
  secondaryLabel: '#8E8E93',
  tertiaryLabel: '#C7C7CC',

  tint: '#0A84FF',

  calories: '#FF453A',
  protein: '#30D158',
  carbs: '#FF9F0A',
  fat: '#BF5AF2',

  cutting: '#FF453A',
  bulking: '#30D158',
  maintenance: '#0A84FF',

  success: '#30D158',
  warning: '#FF9F0A',
} as const;

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
