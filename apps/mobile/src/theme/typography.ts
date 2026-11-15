import { TextStyle } from 'react-native';

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },
  fontWeights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semiBold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Complete TextStyle presets for standard React Native components
  h1: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: '#14243A',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: '#14243A',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#14243A',
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: '#334155',
  },
  body1: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: '#334155',
  },
  body2: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: '#334155',
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#334155',
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: '#334155',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: '#64748B',
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: '#64748B',
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: '#1E293B',
  },
};
