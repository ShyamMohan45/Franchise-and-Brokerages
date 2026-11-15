import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { AdminService } from '../../src/services/adminService';
import { AdminDashboardMetrics, BusinessAnalytics } from '../../src/types/admin';
import { colors, spacing, typography } from '../../src/theme';

export default function AdminAnalyticsScreen() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [mRes, aRes] = await Promise.allSettled([
        AdminService.getDashboardMetrics(),
        AdminService.getAnalytics(),
      ]);

      if (mRes.status === 'fulfilled') {
        setMetrics(mRes.value);
      }
      if (aRes.status === 'fulfilled') {
        setAnalytics(aRes.value);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Platform Analytics"
        subtitle="Business & Operations Metrics"
        showBack
        onBack={() => router.back()}
      />

      {isLoading && !isRefreshing ? (
        <LoadingOverlay visible={true} message="Loading platform analytics..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {/* Operations & Conversion Funnel */}
          <Text style={styles.sectionTitle}>Conversion Funnel & Inquiries</Text>
          <Card style={styles.card}>
            <View style={styles.gridRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Inquiries</Text>
                <Text style={styles.statValue}>
                  {analytics?.totalEnquiries ?? metrics?.totalApplications ?? 0}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Qualified Investors</Text>
                <Text style={[styles.statValue, { color: colors.accent.teal }]}>
                  {analytics?.qualifiedInvestors ?? metrics?.totalInvestors ?? 0}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.gridRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Leads</Text>
                <Text style={styles.statValue}>
                  {analytics?.totalLeads ?? 0}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Conversion Rate</Text>
                <Text style={[styles.statValue, { color: colors.success.DEFAULT }]}>
                  {analytics?.conversionRate ? `${analytics.conversionRate}%` : '0%'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Deal & Commission Financials */}
          <Text style={styles.sectionTitle}>Financial Volume & Pipeline</Text>
          <Card style={styles.card}>
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Total Pipeline Value</Text>
              <Text style={styles.financeValue}>
                {formatCurrency(analytics?.totalDealValue ?? metrics?.pipelineValue ?? 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Earned Commission Revenue</Text>
              <Text style={[styles.financeValue, { color: colors.success.DEFAULT }]}>
                {formatCurrency(analytics?.earnedCommission ?? metrics?.earnedCommission ?? 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Active Pipeline Deals</Text>
              <Text style={styles.financeValue}>
                {analytics?.activeDeals ?? metrics?.activeDealsCount ?? 0} Deals
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financeRow}>
              <Text style={styles.financeLabel}>Successfully Closed Deals</Text>
              <Text style={[styles.financeValue, { color: colors.primary.DEFAULT }]}>
                {analytics?.dealsWon ?? metrics?.completedDealsCount ?? 0} Closed
              </Text>
            </View>
          </Card>

          {/* Platform Governance & Ecosystem */}
          <Text style={styles.sectionTitle}>Ecosystem Composition</Text>
          <Card style={styles.card}>
            <View style={styles.ecoRow}>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoCount}>{metrics?.totalInvestors ?? 0}</Text>
                <Text style={styles.ecoLabel}>Investors</Text>
              </View>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoCount}>{metrics?.totalBusinessOwners ?? 0}</Text>
                <Text style={styles.ecoLabel}>Brands</Text>
              </View>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoCount}>{metrics?.publishedFranchises ?? 0}</Text>
                <Text style={styles.ecoLabel}>Franchises</Text>
              </View>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoCount}>{metrics?.pendingBusinesses ?? 0}</Text>
                <Text style={styles.ecoLabel}>Pending</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  financeLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  financeValue: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
  ecoItem: {
    alignItems: 'center',
  },
  ecoCount: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  ecoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
