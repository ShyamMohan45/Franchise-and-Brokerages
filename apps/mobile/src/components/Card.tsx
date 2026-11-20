import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme, spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'md',
}) => {
  const { colors, isDark } = useTheme();

  const dynamicCardStyle: ViewStyle = {
    backgroundColor: variant === 'flat' ? colors.surfaceSubtle : colors.card,
    borderColor: variant === 'outlined' ? colors.borderStrong : colors.border,
  };

  const containerStyle = [
    styles.base,
    styles[variant],
    dynamicCardStyle,
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...containerStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.sm,
    borderWidth: 1,
  },
  outlined: {
    borderWidth: 1.5,
  },
  flat: {},
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.lg,
  },
  padding_lg: {
    padding: spacing.xl,
  },
});
