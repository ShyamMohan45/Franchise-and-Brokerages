import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Card, Badge, RoleGuard, MetricStatCard } from '../../src/components';
import { useAuth } from '../../src/hooks/useAuth';
import { CrmService } from '../../src/services/crmService';
import { CrmMetrics } from '../../src/types/crm';

export default function BrokerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await CrmService.getCrmMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load CRM metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.gold}
              colors={[colors.accent.gold]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeSubtitle}>Expansion Partner Portal</Text>
              <Text style={styles.userName}>{user?.fullName || 'Broker'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pressable
                style={styles.profileAvatar}
                onPress={() => router.push('/notifications' as any)}
                hitSlop={8}
              >
                <Ionicons name="notifications-outline" size={24} color={colors.accent.gold} />
              </Pressable>
              <Pressable
                style={styles.profileAvatar}
                onPress={() => router.push('/profile')}
                hitSlop={8}
              >
                <Ionicons name="person-circle-outline" size={32} color={colors.accent.gold} />
              </Pressable>
            </View>
          </View>

          {/* Brokerage Status Badge Card */}
          <Card style={styles.roleCard} padding="md">
            <View style={styles.roleRow}>
              <View style={styles.roleIcon}>
                <Ionicons name="briefcase-outline" size={24} color={colors.accent.teal} />
              </View>
              <View style={styles.roleTextContainer}>
                <View style={styles.badgeLine}>
                  <Text style={styles.roleTitle}>Brokerage Operations</Text>
                  <Badge label="LICENSED BROKER" variant="gold" size="sm" />
                </View>
                <Text style={styles.roleEmail}>{user?.email}</Text>
              </View>
            </View>
          </Card>

          {/* KPI Metrics Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pipeline & Performance Metrics</Text>
            {loading && <ActivityIndicator size="small" color={colors.accent.gold} />}
          </View>

          {error && (
            <Card style={styles.errorCard} padding="md">
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={fetchMetrics} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </Card>
          )}

          <View style={styles.metricsGrid}>
            <MetricStatCard
              title="Assigned Leads"
              value={metrics?.totalLeads ?? 0}
              subtitle={`${metrics?.investorLeads ?? 0} Investor | ${metrics?.brandLeads ?? 0} Brand`}
              icon="people-outline"
              color={colors.accent.teal}
              onPress={() => router.push('/(broker)/leads' as any)}
            />
            <MetricStatCard
              title="Active Deals"
              value={metrics?.activeDealsCount ?? 0}
              subtitle="Across 10 Stages"
              icon="git-network-outline"
              color={colors.primary.DEFAULT}
              onPress={() => router.push('/(broker)/pipeline' as any)}
            />
            <MetricStatCard
              title="Closed Won"
              value={metrics?.dealsWonCount ?? 0}
              subtitle={formatCurrency(metrics?.totalWonValue)}
              icon="trophy-outline"
              color={colors.success.DEFAULT}
              onPress={() => router.push('/(broker)/pipeline' as any)}
            />
            <MetricStatCard
              title="Commission Earned"
              value={formatCurrency(metrics?.totalCommissionEarned)}
              subtitle="Broker Revenue"
              icon="cash-outline"
              color={colors.accent.gold}
              onPress={() => router.push('/(broker)/commissions' as any)}
            />
            <MetricStatCard
              title="Scheduled Meetings"
              value={metrics?.scheduledMeetingsCount ?? 0}
              subtitle="Investor Consultations"
              icon="calendar-outline"
              color="#6366F1"
              onPress={() => router.push('/(broker)/meetings' as any)}
            />
            <MetricStatCard
              title="Overdue Tasks"
              value={metrics?.overdueFollowUpsCount ?? 0}
              subtitle="Requires Attention"
              icon="alert-circle-outline"
              color={metrics?.overdueFollowUpsCount ? colors.error : colors.text.muted}
              onPress={() => router.push('/(broker)/tasks' as any)}
            />
          </View>

          {/* CRM Module Navigation */}
          <Text style={styles.modulesTitle}>Broker CRM Modules</Text>

          <View style={styles.modulesContainer}>
            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(broker)/pipeline' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(30, 58, 138, 0.1)' }]}>
                    <Ionicons name="git-network-outline" size={24} color={colors.primary.DEFAULT} />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Deal Pipeline (10 Stages)</Text>
                    <Text style={styles.moduleDescription}>
                      Manage Discovery, FDD, Negotiations, Due Diligence, and Closing
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(broker)/leads' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(13, 148, 136, 0.1)' }]}>
                    <Ionicons name="people-outline" size={24} color={colors.accent.teal} />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Lead Management</Text>
                    <Text style={styles.moduleDescription}>
                      Track investor prospects, qualify leads, and view enquiry history
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(broker)/tasks' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                    <Ionicons name="checkbox-outline" size={24} color={colors.accent.gold} />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Tasks & Action Items</Text>
                    <Text style={styles.moduleDescription}>
                      Manage follow-up tasks, diligence reviews, and priority deadlines
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(deal-room)' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(21, 157, 139, 0.1)' }]}>
                    <Ionicons name="briefcase-outline" size={24} color={colors.accent.teal} />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Deal Rooms & Due Diligence</Text>
                    <Text style={styles.moduleDescription}>
                      FDD review, 11-category audit checklists, vault & contracts
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(broker)/meetings' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <Ionicons name="calendar-outline" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Meetings & Discovery Days</Text>
                    <Text style={styles.moduleDescription}>
                      Schedule investor pitches, brand introductions, and sync notes
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            <Pressable
              style={styles.moduleItem}
              onPress={() => router.push('/(broker)/commissions' as any)}
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={styles.moduleRow}>
                  <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="cash-outline" size={24} color={colors.success.DEFAULT} />
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleTitle}>Commissions & Payouts</Text>
                    <Text style={styles.moduleDescription}>
                      Agreement ledger, payment milestone tracking, and INR statements
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userName: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roleTextContainer: {
    flex: 1,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  roleEmail: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  retryText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  modulesTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  modulesContainer: {
    gap: spacing.sm,
  },
  moduleItem: {
    marginBottom: spacing.xs,
  },
  moduleCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIconBox: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleDetails: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  moduleTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  moduleDescription: {
    ...typography.caption,
    color: colors.text.muted,
    lineHeight: 16,
  },
});
