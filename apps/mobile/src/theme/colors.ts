export const lightColors = {
  // Brand Primary & Accents (matching FranchiseBridge web branding)
  navy: {
    950: '#0B1320',
    900: '#14243A', // Primary deep enterprise navy
    800: '#1E293B',
    700: '#2A3C53',
    600: '#3A4F6B',
  },
  primary: {
    DEFAULT: '#315EFB', // Primary action blue
    hover: '#244BD8',
    dark: '#1D3EB8',
    light: '#6084FC',
    soft: '#EFF4FF',
    50: '#EFF4FF',
    200: '#BFDBFE',
  },
  accent: {
    teal: '#159D8B', // Verified / Success / Deals
    tealLight: '#E6F8F5',
    tealDark: '#0E7063',
    gold: '#F59E0B',
    goldLight: '#FEF3C7',
    goldDark: '#B45309',
  },
  // Neutrals
  slate: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    500: '#64748B',
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50: '#F8FAFC',
  },
  // Text shortcuts
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    white: '#FFFFFF',
  },
  // Semantics
  success: {
    DEFAULT: '#16A34A',
    soft: '#ECFDF5',
    border: '#A7F3D0',
    text: '#166534',
  },
  warning: {
    DEFAULT: '#D97706',
    soft: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  danger: {
    DEFAULT: '#DC2626',
    soft: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
  },
  info: {
    DEFAULT: '#0284C7',
    soft: '#F0F9FF',
    border: '#BAE6FD',
    text: '#075985',
  },
  // Surface
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  navBg: '#FFFFFF',
  hoverBg: '#F1F5F9',
  divider: '#E2E8F0',
  inputBg: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Semantic Shortcuts
  error: '#DC2626',
  errorLight: '#FEF2F2',
  successLight: '#ECFDF5',

  // Convenience Aliases
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
};

export const darkColors: typeof lightColors = {
  // Pure Black & Charcoal Tokens
  navy: {
    950: '#000000',
    900: '#050505',
    800: '#090909',
    700: '#101010',
    600: '#171717',
  },
  // Electric Blue Brand Accents (Preserved FranchiseBridge Identity)
  primary: {
    DEFAULT: '#3563FF',
    hover: '#4775FF',
    dark: '#2851E8',
    light: '#5E85FF',
    soft: '#171717',
    50: '#101010',
    200: '#262626',
  },
  accent: {
    teal: '#2DD4BF',
    tealLight: '#0A2520',
    tealDark: '#0D9488',
    gold: '#FBBF24',
    goldLight: '#261C02',
    goldDark: '#D97706',
  },
  slate: {
    900: '#FFFFFF',
    800: '#F5F5F5',
    700: '#E5E5E5',
    600: '#D4D4D4',
    500: '#A3A3A3',
    400: '#737373',
    300: '#525252',
    200: '#262626',
    100: '#171717',
    50: '#090909',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D4D4D4',
    muted: '#A3A3A3',
    white: '#FFFFFF',
  },
  success: {
    DEFAULT: '#4ADE80',
    soft: '#052E16',
    border: '#166534',
    text: '#86EFAC',
  },
  warning: {
    DEFAULT: '#FBBF24',
    soft: '#451A03',
    border: '#78350F',
    text: '#FDE68A',
  },
  danger: {
    DEFAULT: '#F87171',
    soft: '#450A0A',
    border: '#7F1D1D',
    text: '#FCA5A5',
  },
  info: {
    DEFAULT: '#38BDF8',
    soft: '#082F49',
    border: '#075985',
    text: '#7DD3FC',
  },
  // Pure Black AMOLED Surfaces
  background: '#000000',
  surface: '#090909',
  surfaceSubtle: '#171717',
  card: '#101010',
  cardElevated: '#171717',
  navBg: '#050505',
  hoverBg: '#202020',
  divider: '#222222',
  inputBg: '#111111',
  border: '#262626',
  borderStrong: '#333333',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  error: '#F87171',
  errorLight: '#450A0A',
  successLight: '#052E16',

  textPrimary: '#FFFFFF',
  textSecondary: '#D4D4D4',
  textMuted: '#A3A3A3',
};

// Default export alias for backward compatibility
export const colors = lightColors;

export type ThemeColors = typeof lightColors;
