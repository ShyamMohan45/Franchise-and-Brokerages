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
import { Input, Button, Card, Badge } from '../../src/components';
import { useAuth } from '../../src/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<'investor' | 'business_owner'>('investor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters (backend security requirement)';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
      });

      // Role-based redirect
      if (user.role === 'investor') {
        router.replace('/(investor)/dashboard');
      } else {
        router.replace('/(brand)/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please review your details.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the FranchiseBridge Network</Text>
          </View>
        </View>

        {/* General Error Banner */}
        {errors.general && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {/* Role Selector Card */}
        <Card style={styles.roleCard} padding="md">
          <Text style={styles.roleLabel}>I want to join as:</Text>
          <View style={styles.roleRow}>
            <Pressable
              style={[
                styles.roleOption,
                role === 'investor' && styles.roleOptionActive,
              ]}
              onPress={() => setRole('investor')}
            >
              <Ionicons
                name="wallet-outline"
                size={22}
                color={role === 'investor' ? colors.primary.DEFAULT : colors.slate[400]}
              />
              <Text
                style={[
                  styles.roleText,
                  role === 'investor' && styles.roleTextActive,
                ]}
              >
                Investor
              </Text>
              <Text style={styles.roleSubtext}>Find & buy franchises</Text>
            </Pressable>

            <Pressable
              style={[
                styles.roleOption,
                role === 'business_owner' && styles.roleOptionActive,
              ]}
              onPress={() => setRole('business_owner')}
            >
              <Ionicons
                name="storefront-outline"
                size={22}
                color={role === 'business_owner' ? colors.primary.DEFAULT : colors.slate[400]}
              />
              <Text
                style={[
                  styles.roleText,
                  role === 'business_owner' && styles.roleTextActive,
                ]}
              >
                Brand Owner
              </Text>
              <Text style={styles.roleSubtext}>Expand franchise business</Text>
            </Pressable>
          </View>
        </Card>

        {/* Registration Form Card */}
        <Card style={styles.card} padding="lg">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.slate[400]} />}
          />

          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.slate[400]} />}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Ionicons name="call-outline" size={20} color={colors.slate[400]} />}
          />

          <Input
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            error={errors.password}
            helperText="Backend requires at least 8 characters"
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.slate[400]} />}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
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
            title="Create Account"
            onPress={handleRegister}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text style={styles.loginLink}> Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
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
    marginBottom: spacing.lg,
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
  roleCard: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.navy[900],
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.slate[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary[50],
  },
  roleText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.slate[700],
    marginTop: spacing.xs,
  },
  roleTextActive: {
    color: colors.primary.DEFAULT,
  },
  roleSubtext: {
    ...typography.caption,
    fontSize: 10,
    color: colors.slate[400],
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.slate[600],
  },
  loginLink: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
});
