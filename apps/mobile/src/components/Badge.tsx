import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'neutral'
  | 'gold'
  | 'teal';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.textBase, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Variant containers
  primary: {
    backgroundColor: colors.primary.soft,
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  success: {
    backgroundColor: colors.success.soft,
    borderColor: colors.success.border,
    borderWidth: 1,
  },
  warning: {
    backgroundColor: colors.warning.soft,
    borderColor: colors.warning.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.danger.soft,
    borderColor: colors.danger.border,
    borderWidth: 1,
  },
  info: {
    backgroundColor: colors.info.soft,
    borderColor: colors.info.border,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: colors.slate[100],
    borderColor: colors.border,
    borderWidth: 1,
  },
  gold: {
    backgroundColor: colors.accent.goldLight,
    borderColor: colors.accent.gold,
    borderWidth: 1,
  },
  error: {
    backgroundColor: colors.danger.soft,
    borderColor: colors.danger.border,
    borderWidth: 1,
  },
  teal: {
    backgroundColor: colors.accent.tealLight,
    borderColor: colors.accent.teal,
    borderWidth: 1,
  },
  // Sizes
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: spacing.xxs + 2,
    paddingHorizontal: spacing.md - 2,
  },
  // Text
  textBase: {
    fontWeight: typography.fontWeights.semiBold,
  },
  text_primary: {
    color: colors.primary.DEFAULT,
  },
  text_success: {
    color: colors.success.text,
  },
  text_warning: {
    color: colors.warning.text,
  },
  text_danger: {
    color: colors.danger.text,
  },
  text_info: {
    color: colors.info.text,
  },
  text_neutral: {
    color: colors.slate[700],
  },
  text_gold: {
    color: colors.accent.goldDark,
  },
  text_error: {
    color: colors.danger.text,
  },
  text_teal: {
    color: colors.accent.tealDark,
  },
  textSize_sm: {
    fontSize: typography.fontSizes.xs - 1,
  },
  textSize_md: {
    fontSize: typography.fontSizes.xs,
  },
});
