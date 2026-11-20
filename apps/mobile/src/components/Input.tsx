import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { useTheme, typography, spacing, borderRadius } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  secureTextEntry,
  placeholderTextColor,
  ...rest
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: Boolean(error)
              ? colors.danger.DEFAULT
              : isFocused
              ? colors.primary.DEFAULT
              : colors.border,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={placeholderTextColor || colors.text.muted}
          style={[styles.input, { color: colors.text.primary }, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setIsSecure(!isSecure)} style={styles.iconRight}>
            <Text style={[styles.toggleText, { color: colors.primary.DEFAULT }]}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : (
          rightIcon && <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.danger.DEFAULT }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.text.muted }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    fontSize: typography.fontSizes.base,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  toggleText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semiBold,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xxs + 2,
  },
  helperText: {
    fontSize: typography.fontSizes.xs,
    marginTop: spacing.xxs + 2,
  },
});
