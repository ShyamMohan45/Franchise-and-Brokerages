import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme, typography, spacing, borderRadius } from '../theme';

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
  const { colors, isDark } = useTheme();

  const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: colors.primary.soft,
        borderColor: isDark ? colors.primary.dark : '#BFDBFE',
      },
      text: { color: colors.primary.DEFAULT },
    },
    success: {
      container: {
        backgroundColor: colors.success.soft,
        borderColor: colors.success.border,
      },
      text: { color: colors.success.text },
    },
    warning: {
      container: {
        backgroundColor: colors.warning.soft,
        borderColor: colors.warning.border,
      },
      text: { color: colors.warning.text },
    },
    danger: {
      container: {
        backgroundColor: colors.danger.soft,
        borderColor: colors.danger.border,
      },
      text: { color: colors.danger.text },
    },
    error: {
      container: {
        backgroundColor: colors.danger.soft,
        borderColor: colors.danger.border,
      },
      text: { color: colors.danger.text },
    },
    info: {
      container: {
        backgroundColor: colors.info.soft,
        borderColor: colors.info.border,
      },
      text: { color: colors.info.text },
    },
    neutral: {
      container: {
        backgroundColor: colors.surfaceSubtle,
        borderColor: colors.border,
      },
      text: { color: colors.text.secondary },
    },
    gold: {
      container: {
        backgroundColor: colors.accent.goldLight,
        borderColor: colors.accent.gold,
      },
      text: { color: isDark ? colors.accent.gold : colors.accent.goldDark },
    },
    teal: {
      container: {
        backgroundColor: colors.accent.tealLight,
        borderColor: colors.accent.teal,
      },
      text: { color: isDark ? colors.accent.teal : colors.accent.tealDark },
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <View
      style={[
        styles.base,
        currentVariant.container,
        styles[`size_${size}`],
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          currentVariant.text,
          styles[`textSize_${size}`],
          textStyle,
        ]}
      >
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
    borderWidth: 1,
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  size_md: {
    paddingVertical: spacing.xxs + 2,
    paddingHorizontal: spacing.md - 2,
  },
  textBase: {
    fontWeight: typography.fontWeights.semiBold,
  },
  textSize_sm: {
    fontSize: typography.fontSizes.xs - 1,
  },
  textSize_md: {
    fontSize: typography.fontSizes.xs,
  },
});
