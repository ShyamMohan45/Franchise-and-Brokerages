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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const user = await login(email.trim().toLowerCase(), password);
      // Role-based redirect
      routeToRoleDashboard(user.role);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const routeToRoleDashboard = (role: string) => {
    switch (role) {
      case 'investor':
        router.replace('/(investor)/dashboard');
        break;
      case 'business_owner':
      case 'brand_owner':
        router.replace('/(brand)/dashboard');
        break;
      case 'broker':
        router.replace('/(broker)/dashboard');
        break;
      case 'admin':
      case 'super_admin':
        router.replace('/(admin)/dashboard');
        break;
      default:
        router.replace('/');
        break;
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
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
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="business" size={32} color={colors.white} />
          </View>
          <Text style={styles.title}>
            Franchise<Text style={styles.titleAccent}>Bridge</Text>
          </Text>
          <Text style={styles.subtitle}>Native Mobile Platform</Text>
          <View style={styles.badgeRow}>
            <Badge label="SECURE ENTERPRISE LOGIN" variant="primary" size="sm" />
          </View>
        </View>

        {/* General Error Banner */}
        {errors.general && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {/* Credentials Form Card */}
        <Card style={styles.card} padding="lg">
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>Access your investment and franchise portfolio</Text>

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
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.slate[400]} />}
          />

          <View style={styles.forgotRow}>
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.loginButton}
          />
        </Card>

        {/* Quick-Fill Role Testing Helpers (Development Only - Excluded in Production) */}
        {__DEV__ && (
          <Card style={styles.quickCard} padding="md">
            <Text style={styles.quickTitle}>Quick Demo Logins (Dev Testing Only)</Text>
            <Text style={styles.quickDescription}>
              Tap to pre-fill test credentials for different role dashboards:
            </Text>
            <View style={styles.quickButtonGrid}>
              <Pressable
                style={styles.quickButton}
                onPress={() => handleQuickFill('investor@franchisebridge.com', 'Password123!')}
              >
                <Ionicons name="wallet-outline" size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.quickButtonText}>Investor</Text>
              </Pressable>
              <Pressable
                style={styles.quickButton}
                onPress={() => handleQuickFill('brand@franchisebridge.com', 'Password123!')}
              >
                <Ionicons name="storefront-outline" size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.quickButtonText}>Brand Owner</Text>
              </Pressable>
              <Pressable
                style={styles.quickButton}
                onPress={() => handleQuickFill('broker@franchisebridge.com', 'Password123!')}
              >
                <Ionicons name="people-outline" size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.quickButtonText}>Broker</Text>
              </Pressable>
              <Pressable
                style={styles.quickButton}
                onPress={() => handleQuickFill('admin@franchisebridge.com', 'AdminPass123!')}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary.DEFAULT} />
                <Text style={styles.quickButtonText}>Admin</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account yet?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={styles.registerLink}> Register Now</Text>
          </Pressable>
        </View>

        {/* Utility links */}
        <View style={styles.utilRow}>
          <Pressable onPress={() => router.push('/(auth)/verify-email')} hitSlop={6}>
            <Text style={styles.utilLink}>Verify Email</Text>
          </Pressable>
          <Text style={styles.utilDivider}>•</Text>
          <Pressable onPress={() => router.push('/(auth)/reset-password')} hitSlop={6}>
            <Text style={styles.utilLink}>Reset Password</Text>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.navy[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    ...typography.h1,
    color: colors.navy[900],
  },
  titleAccent: {
    color: colors.accent.teal,
  },
  subtitle: {
    ...typography.body,
    color: colors.slate[500],
    marginTop: 2,
  },
  badgeRow: {
    marginTop: spacing.sm,
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
  formTitle: {
    ...typography.h2,
    color: colors.navy[900],
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.slate[500],
    marginBottom: spacing.lg,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  quickCard: {
    backgroundColor: colors.slate[50],
    borderColor: colors.slate[200],
    marginBottom: spacing.lg,
  },
  quickTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.navy[900],
    marginBottom: 2,
  },
  quickDescription: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  quickButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.slate[200],
    gap: 4,
  },
  quickButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.navy[900],
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.slate[600],
  },
  registerLink: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  utilRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  utilLink: {
    ...typography.caption,
    color: colors.slate[500],
  },
  utilDivider: {
    color: colors.slate[300],
  },
});
