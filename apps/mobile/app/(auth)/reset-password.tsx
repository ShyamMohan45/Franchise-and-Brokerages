import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Input, Button, Card } from '../../src/components';
import { AuthService } from '../../src/services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!token.trim()) {
      newErrors.token = 'Reset token is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters (backend security requirement)';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await AuthService.resetPassword(token.trim(), newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || 'Password reset failed. Please verify your token.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={colors.navy[900]} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Set a new secure password</Text>
          </View>
        </View>

        {/* Error Banner */}
        {errors.general && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {isSuccess ? (
          <Card style={styles.successCard} padding="lg">
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.accent.teal} />
            </View>
            <Text style={styles.successTitle}>Password Updated!</Text>
            <Text style={styles.successDescription}>
              Your password has been changed successfully. You can now sign in using your new credentials.
            </Text>

            <Button
              title="Proceed to Sign In"
              onPress={() => router.push('/(auth)/login')}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />
          </Card>
        ) : (
          <Card style={styles.card} padding="lg">
            <Input
              label="Reset Token"
              placeholder="Paste token received via email/admin"
              value={token}
              onChangeText={(val) => {
                setToken(val);
                if (errors.token) setErrors((prev) => ({ ...prev, token: undefined }));
              }}
              error={errors.token}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="key-outline" size={20} color={colors.slate[400]} />}
            />

            <Input
              label="New Password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChangeText={(val) => {
                setNewPassword(val);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              secureTextEntry
              error={errors.newPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.slate[400]} />}
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.slate[400]} />}
            />

            <Button
              title="Update Password"
              onPress={handleReset}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />

            <View style={styles.cancelRow}>
              <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                <Text style={styles.cancelText}>Back to Sign In</Text>
              </Pressable>
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.navy[900],
  },
  subtitle: {
    ...typography.caption,
    color: colors.slate[500],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
  },
  card: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  cancelRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  cancelText: {
    ...typography.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  successCard: {
    alignItems: 'center',
    textAlign: 'center',
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.navy[900],
    marginBottom: spacing.xs,
  },
  successDescription: {
    ...typography.body,
    color: colors.slate[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
