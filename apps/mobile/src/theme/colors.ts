export const colors = {
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
    DEFAULT: '#10B981',
    soft: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  },
  warning: {
    DEFAULT: '#F59E0B',
    soft: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
  },
  danger: {
    DEFAULT: '#EF4444',
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
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Semantic Shortcuts
  error: '#EF4444',
  errorLight: '#FEF2F2',
  successLight: '#ECFDF5',

  // Convenience Aliases
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
};

export type ThemeColors = typeof colors;
