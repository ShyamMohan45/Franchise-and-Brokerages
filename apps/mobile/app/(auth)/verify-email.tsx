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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Input, Button, Card } from '../../src/components';
import { AuthService } from '../../src/services/authService';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerify = async () => {
    if (!token.trim()) {
      setError('Verification token is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const msg = await AuthService.verifyEmail(token.trim());
      setSuccessMessage(msg || 'Your email address has been verified successfully!');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Email verification failed. The token may be invalid or expired.');
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
            <Text style={styles.title}>Email Verification</Text>
            <Text style={styles.subtitle}>Confirm your email address</Text>
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {isSuccess ? (
          <Card style={styles.successCard} padding="lg">
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-done-circle" size={54} color={colors.accent.teal} />
            </View>
            <Text style={styles.successTitle}>Verified Successfully!</Text>
            <Text style={styles.successDescription}>{successMessage}</Text>

            <Button
              title="Continue to Sign In"
              onPress={() => router.push('/(auth)/login')}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />
          </Card>
        ) : (
          <Card style={styles.card} padding="lg">
            <Text style={styles.instructions}>
              Enter the verification token provided in your email confirmation link or backend audit log to activate your account.
            </Text>

            <Input
              label="Verification Token"
              placeholder="Paste verification token here"
              value={token}
              onChangeText={(val) => {
                setToken(val);
                if (error) setError(null);
              }}
              error={error || undefined}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.slate[400]} />}
            />

            <Button
              title="Verify Email"
              onPress={handleVerify}
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
  instructions: {
    ...typography.body,
    color: colors.slate[600],
    marginBottom: spacing.lg,
    lineHeight: 22,
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
