import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../src/theme';
import { useAuth } from '../src/hooks/useAuth';
import { Button } from '../src/components';

export default function RootIndexRouter() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/(auth)/login');
      return;
    }

    // Role-based redirection per verified backend enums
    switch (user.role) {
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
        // Unknown role fallback handled below in render
        break;
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Loading Splash Screen while restoring SecureStore session
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoBadge}>
          <Ionicons name="business" size={38} color={colors.white} />
        </View>
        <Text style={styles.brandTitle}>
          Franchise<Text style={styles.brandTitleAccent}>Bridge</Text>
        </Text>
        <Text style={styles.tagline}>Native Mobile Application</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary.DEFAULT}
          style={styles.spinner}
        />
        <Text style={styles.statusText}>Restoring secure session...</Text>
      </View>
    );
  }

  // Fallback for unexpected role values
  if (isAuthenticated && user && !['investor', 'business_owner', 'brand_owner', 'broker', 'admin', 'super_admin'].includes(user.role)) {
    return (
      <View style={styles.unknownRoleContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.warning.DEFAULT} />
        <Text style={styles.unknownTitle}>Unrecognized Account Role</Text>
        <Text style={styles.unknownSubtitle}>
          Your account role ({user.role}) has not been mapped to a mobile dashboard. Please contact system support.
        </Text>
        <Button
          title="Sign Out"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}
          variant="outline"
          size="md"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.navy[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 28,
    color: colors.navy[900],
  },
  brandTitleAccent: {
    color: colors.accent.teal,
  },
  tagline: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  spinner: {
    marginTop: spacing.md,
  },
  statusText: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: spacing.sm,
  },
  unknownRoleContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    textAlign: 'center',
  },
  unknownTitle: {
    ...typography.h2,
    color: colors.navy[900],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  unknownSubtitle: {
    ...typography.body,
    color: colors.slate[600],
    textAlign: 'center',
    lineHeight: 22,
  },
});
