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

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const msg = await AuthService.forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(msg);
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Recover access to your account</Text>
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Success State */}
        {successMessage ? (
          <Card style={styles.successCard} padding="lg">
            <View style={styles.successIcon}>
              <Ionicons name="mail-unread" size={40} color={colors.accent.teal} />
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successDescription}>
              If an account with <Text style={styles.boldEmail}>{email}</Text> exists, a password reset token has been generated.
            </Text>
            <Text style={styles.successInstructions}>
              Copy the reset token and enter it on the Reset Password screen.
            </Text>

            <Button
              title="Enter Reset Token"
              onPress={() => router.push('/(auth)/reset-password')}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />

            <Button
              title="Back to Sign In"
              onPress={() => router.push('/(auth)/login')}
              variant="outline"
              fullWidth
              size="md"
              style={styles.secondaryButton}
            />
          </Card>
        ) : (
          <Card style={styles.card} padding="lg">
            <Text style={styles.instructions}>
              Enter the registered email associated with your FranchiseBridge account. We'll send instructions and a reset token to regain access.
            </Text>

            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error || undefined}
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.slate[400]} />}
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleSubmit}
              loading={isSubmitting}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />

            <View style={styles.cancelRow}>
              <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                <Text style={styles.cancelText}>Remembered password? Sign In</Text>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.md,
  },
  boldEmail: {
    fontWeight: '700',
    color: colors.navy[900],
  },
  successInstructions: {
    ...typography.caption,
    color: colors.slate[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.xs,
  },
});
