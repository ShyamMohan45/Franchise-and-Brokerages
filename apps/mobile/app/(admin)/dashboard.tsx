import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Card, Badge, Button, RoleGuard } from '../../src/components';
import { AdminMetricCard } from '../../src/components/admin/AdminMetricCard';
import { useAuth } from '../../src/hooks/useAuth';
import { useAdmin } from '../../src/hooks/useAdmin';
import { useNotifications } from '../../src/hooks/useNotifications';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { metrics, isLoading, isRefreshing, refresh } = useAdmin();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const isSuperAdmin = user?.role === 'super_admin';

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeSubtitle}>Platform Administration</Text>
            <Text style={styles.userName}>{user?.fullName || 'Administrator'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push('/notifications')}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.navy[900]} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => router.push('/profile')}
              hitSlop={8}
            >
              <Ionicons name="shield-checkmark" size={22} color={colors.accent.teal} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {/* Privilege Status */}
          <Card style={styles.roleCard} padding="md">
            <View style={styles.roleRow}>
              <View style={styles.roleIcon}>
                <Ionicons name="shield-outline" size={24} color={colors.accent.teal} />
              </View>
              <View style={styles.roleTextContainer}>
                <View style={styles.badgeLine}>
                  <Text style={styles.roleTitle}>
                    {isSuperAdmin ? 'Super Administrator' : 'Platform Administrator'}
                  </Text>
                  <Badge
                    label={isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                    variant={isSuperAdmin ? 'gold' : 'primary'}
                    size="sm"
                  />
                </View>
                <Text style={styles.roleEmail}>{user?.email}</Text>
              </View>
            </View>
          </Card>

          {/* Platform Performance KPIs */}
          <Text style={styles.sectionTitle}>Platform KPIs & Overview</Text>
          <View style={styles.metricsGrid}>
            <AdminMetricCard
              label="Total Users"
              value={metrics?.totalUsers ?? '--'}
              icon="people-outline"
              color={colors.primary.DEFAULT}
            />
            <AdminMetricCard
              label="Registered Investors"
              value={metrics?.totalInvestors ?? '--'}
              icon="cash-outline"
              color={colors.accent.gold}
            />
            <AdminMetricCard
              label="Brand Owners"
              value={metrics?.totalBusinessOwners ?? '--'}
              icon="business-outline"
              color={colors.accent.teal}
            />
            <AdminMetricCard
              label="Pending Approvals"
              value={metrics?.pendingBusinesses ?? '--'}
              icon="time-outline"
              color={colors.warning.DEFAULT}
            />
            <AdminMetricCard
              label="Published Franchises"
              value={metrics?.publishedFranchises ?? '--'}
              icon="storefront-outline"
              color={colors.success.DEFAULT}
            />
            <AdminMetricCard
              label="Active Pipeline Deals"
              value={metrics?.activeDealsCount ?? '--'}
              icon="git-network-outline"
              color={colors.primary.DEFAULT}
            />
            <AdminMetricCard
              label="Pipeline Value"
              value={formatCurrency(metrics?.pipelineValue || 0)}
              icon="trending-up-outline"
              color={colors.accent.gold}
            />
            <AdminMetricCard
              label="Commission Earned"
              value={formatCurrency(metrics?.earnedCommission || 0)}
              icon="wallet-outline"
              color={colors.success.DEFAULT}
            />
          </View>

          {/* Quick Management Shortcuts */}
          <Text style={styles.sectionTitle}>Administration Controls</Text>
          <View style={styles.controlsList}>
            <TouchableOpacity
              style={styles.controlRow}
              onPress={() => router.push('/(admin)/users')}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIcon, { backgroundColor: colors.primary.DEFAULT + '15' }]}>
                <Ionicons name="people" size={20} color={colors.primary.DEFAULT} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>User Management</Text>
                <Text style={styles.controlSubtitle}>
                  View all accounts, filter by role, update statuses
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlRow}
              onPress={() => router.push('/(admin)/approvals')}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIcon, { backgroundColor: colors.warning.DEFAULT + '15' }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.warning.DEFAULT} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Verification & Approvals</Text>
                <Text style={styles.controlSubtitle}>
                  Review pending businesses and franchise listings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlRow}
              onPress={() => router.push('/(admin)/analytics')}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIcon, { backgroundColor: colors.accent.teal + '15' }]}>
                <Ionicons name="stats-chart" size={20} color={colors.accent.teal} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Analytics & Reports</Text>
                <Text style={styles.controlSubtitle}>
                  Operations, conversion metrics, and business breakdown
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlRow}
              onPress={() => router.push('/(admin)/audit-logs')}
              activeOpacity={0.7}
            >
              <View style={[styles.controlIcon, { backgroundColor: colors.navy[600] + '15' }]}>
                <Ionicons name="list" size={20} color={colors.navy[600]} />
              </View>
              <View style={styles.controlInfo}>
                <Text style={styles.controlTitle}>Security Audit Logs</Text>
                <Text style={styles.controlSubtitle}>
                  Track user authentication, mutations, and API events
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <View style={styles.accountActions}>
            <Button
              title="View Account Profile"
              onPress={() => router.push('/profile')}
              variant="outline"
              fullWidth
              size="md"
              style={styles.profileButton}
            />

            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="danger"
              fullWidth
              size="md"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    ...typography.caption,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  roleCard: {
    marginBottom: spacing.lg,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.teal + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleTextContainer: {
    flex: 1,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  roleTitle: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  controlsList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  controlInfo: {
    flex: 1,
  },
  controlTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  controlSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountActions: {
    marginTop: spacing.md,
  },
  profileButton: {
    marginBottom: spacing.md,
  },
});
