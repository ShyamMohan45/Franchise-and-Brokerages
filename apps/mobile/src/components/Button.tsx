import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { useTheme, typography, spacing, borderRadius } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors, isDark } = useTheme();
  const isDisabled = disabled || loading;

  const dynamicVariantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.primary.DEFAULT },
      text: { color: colors.white },
    },
    secondary: {
      container: { backgroundColor: isDark ? colors.surfaceSubtle : colors.navy[900] },
      text: { color: colors.white },
    },
    outline: {
      container: {
        backgroundColor: colors.transparent,
        borderWidth: 1.5,
        borderColor: colors.border,
      },
      text: { color: colors.text.primary },
    },
    ghost: {
      container: { backgroundColor: colors.transparent },
      text: { color: colors.primary.DEFAULT },
    },
    danger: {
      container: { backgroundColor: colors.danger.DEFAULT },
      text: { color: colors.white },
    },
  };

  const currentVariant = dynamicVariantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        currentVariant.container,
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.DEFAULT : colors.white}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.textBase,
              currentVariant.text,
              styles[`textSize_${size}`],
              isDisabled && { color: colors.text.muted },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  // Size styles
  size_sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
  },
  // Text styles
  textBase: {
    fontWeight: typography.fontWeights.semiBold,
  },
  textSize_sm: {
    fontSize: typography.fontSizes.sm,
  },
  textSize_md: {
    fontSize: typography.fontSizes.base,
  },
  textSize_lg: {
    fontSize: typography.fontSizes.lg,
  },
});
