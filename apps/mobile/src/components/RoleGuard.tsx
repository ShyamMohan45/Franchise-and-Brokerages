import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { colors, typography, spacing } from '../theme';
import { Button } from './Button';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Verifying session...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Access Restricted</Text>
        <Text style={styles.errorSubtitle}>
          Your account role ({user.role}) does not have permission to view this section.
        </Text>
        <View style={styles.actionRow}>
          <Button
            title="Go to My Dashboard"
            onPress={() => router.replace('/')}
            variant="primary"
            size="md"
          />
          <View style={{ height: spacing.md }} />
          <Button
            title="Log Out"
            onPress={() => logout().then(() => router.replace('/(auth)/login'))}
            variant="outline"
            size="md"
          />
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.slate[600],
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.slate[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionRow: {
    width: '100%',
    maxWidth: 320,
  },
});
