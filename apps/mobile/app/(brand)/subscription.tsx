import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, typography, spacing, borderRadius } from '../../src/theme';
import {
  Header,
  Card,
  Badge,
  Button,
  RoleGuard,
  EmptyState,
  PlanCard,
  QuotaUsageCard,
} from '../../src/components';
import { useSubscription } from '../../src/hooks/useSubscription';
import { PaymentService } from '../../src/services/paymentService';
import {
  SubscriptionPlanConfig,
  BillingInterval,
} from '../../src/types/subscription';
import { PaymentTransactionItem } from '../../src/types/payment';

export default function FranchisorSubscriptionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const {
    subscription,
    plans,
    isLoading,
    isRefreshing,
    error,
    refresh,
    cancel,
  } = useSubscription();

  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [isCanceling, setIsCanceling] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'history'>('overview');

  // Load transactions history
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingHistory(true);
        const history = await PaymentService.getPaymentHistory();
        if (isMounted) {
          setTransactions(history || []);
        }
      } catch (err: any) {
        console.warn('[SubscriptionScreen] Error loading payment history:', err.message);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription Renewal',
      'Are you sure you want to cancel automatic renewal? Your franchisor capabilities will remain active until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCanceling(true);
              await cancel();
              Alert.alert(
                'Cancellation Scheduled',
                'Your subscription will not renew after the current period ends. You will retain all entitlements until then.'
              );
            } catch (err: any) {
              Alert.alert('Cancellation Error', err.message || 'Failed to cancel subscription.');
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ]
    );
  };

  const handlePlanSelect = (selectedPlan: SubscriptionPlanConfig) => {
    if (selectedPlan.id === subscription?.planId) {
      Alert.alert('Current Plan', `You are already enrolled in the ${selectedPlan.name} plan.`);
      return;
    }

    Alert.alert(
      `Upgrade to ${selectedPlan.name}`,
      `Ready to activate ${selectedPlan.name} (${billingInterval === 'yearly' ? `₹${selectedPlan.yearlyPrice.toLocaleString('en-IN')}/year` : `₹${selectedPlan.monthlyPrice.toLocaleString('en-IN')}/month`})? Standard Razorpay checkout will be presented in Phase 3.`,
      [
        { text: 'Review Plans', style: 'cancel' },
        {
          text: 'Proceed to Checkout',
          onPress: () => {
            Alert.alert(
              'Checkout Ready',
              'Razorpay Mobile Checkout module is scheduled for Phase 3. Live payment will be verified by the backend before plan activation.'
            );
          },
        },
      ]
    );
  };

  // Filter franchisor plans
  const franchisorPlans = plans.filter((p) => p.role === 'franchisor' || !p.role);

  const isCurrentActive =
    subscription?.status === 'active' &&
    new Date(subscription.currentPeriodEnd) > new Date();

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Subscription & Quotas"
          subtitle="Manage Tiers, Quotas & Invoices"
          showBack
          onBack={() => router.back()}
        />

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.tabItem, activeTab === 'overview' && { borderBottomColor: colors.primary.DEFAULT, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'overview' ? colors.primary.DEFAULT : colors.textSecondary }]}>
              Current Quotas
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'plans' && { borderBottomColor: colors.primary.DEFAULT, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'plans' ? colors.primary.DEFAULT : colors.textSecondary }]}>
              Upgrade Plans
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'history' && { borderBottomColor: colors.primary.DEFAULT, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'history' ? colors.primary.DEFAULT : colors.textSecondary }]}>
              Billing History
            </Text>
          </Pressable>
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
          {isLoading && !subscription ? (
            <View style={styles.loadingCenter}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading plan entitlements...</Text>
            </View>
          ) : error ? (
            <Card style={styles.errorCard} padding="lg">
              <Ionicons name="alert-circle-outline" size={36} color={colors.danger.DEFAULT} />
              <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Unable to load subscription</Text>
              <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{error}</Text>
              <Button title="Retry" onPress={refresh} variant="primary" size="md" style={{ marginTop: spacing.md }} />
            </Card>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & QUOTAS */}
              {activeTab === 'overview' && (
                <View>
                  {/* Current Active Plan Card */}
                  <Card style={styles.currentPlanCard} padding="lg" variant="elevated">
                    <View style={styles.planHeaderRow}>
                      <View>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>ACTIVE TIER</Text>
                        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                          {subscription?.planName || 'Free Tier'}
                        </Text>
                      </View>
                      <Badge
                        label={
                          subscription?.cancelAtPeriodEnd
                            ? 'CANCELING'
                            : subscription?.status?.toUpperCase() || 'ACTIVE'
                        }
                        variant={
                          subscription?.cancelAtPeriodEnd
                            ? 'warning'
                            : isCurrentActive
                            ? 'success'
                            : 'danger'
                        }
                        size="md"
                      />
                    </View>

                    <View style={styles.periodRow}>
                      <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.periodText, { color: colors.textSecondary }]}>
                        {subscription?.planId === 'free'
                          ? 'Perpetual Community Free Tier'
                          : `Renews on: ${new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}`}
                      </Text>
                    </View>

                    {subscription?.cancelAtPeriodEnd && (
                      <View style={[styles.noticeBox, { backgroundColor: isDark ? colors.surfaceSubtle : '#FEF3C7' }]}>
                        <Ionicons name="information-circle" size={18} color="#D97706" />
                        <Text style={[styles.noticeText, { color: '#92400E' }]}>
                          Subscription cancellation scheduled. You retain full access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                        </Text>
                      </View>
                    )}

                    <View style={styles.planActionsRow}>
                      <Button
                        title="Change Plan"
                        onPress={() => setActiveTab('plans')}
                        variant="primary"
                        size="sm"
                        style={{ flex: 1 }}
                      />
                      {subscription?.planId !== 'free' && !subscription?.cancelAtPeriodEnd && (
                        <Button
                          title="Cancel Renewal"
                          onPress={handleCancelSubscription}
                          variant="outline"
                          size="sm"
                          disabled={isCanceling}
                        />
                      )}
                    </View>
                  </Card>

                  {/* Section Title */}
                  <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                    Capacity & Resource Quotas
                  </Text>

                  {/* Quota Usage Cards */}
                  <QuotaUsageCard
                    title="Active Franchise Listings"
                    used={subscription?.usage.activeListingsCount || 0}
                    limit={subscription?.limits.maxListings || 1}
                    icon="pricetags-outline"
                    helperText="Approved marketplace opportunities"
                  />

                  <QuotaUsageCard
                    title="Brand Profiles"
                    used={subscription?.usage.activeBrandsCount || 0}
                    limit={subscription?.limits.maxBrands || 1}
                    icon="business-outline"
                    helperText="Enterprise brand registrations"
                  />

                  <QuotaUsageCard
                    title="Monthly Investor Leads"
                    used={subscription?.usage.leadsThisMonth || 0}
                    limit={subscription?.limits.monthlyLeadsLimit || 5}
                    icon="mail-unread-outline"
                    helperText="Resets automatically every billing period"
                  />

                  <QuotaUsageCard
                    title="Featured Listing Slots"
                    used={subscription?.usage.featuredSlotsUsed || 0}
                    limit={subscription?.limits.featuredListingSlots || 0}
                    icon="sparkles-outline"
                    helperText="Included 14 to 90-day homepage placements"
                  />
                </View>
              )}

              {/* TAB 2: UPGRADE PLANS */}
              {activeTab === 'plans' && (
                <View>
                  {/* Interval Selector */}
                  <View style={[styles.intervalToggle, { backgroundColor: isDark ? colors.surfaceSubtle : '#E2E8F0' }]}>
                    <Pressable
                      style={[
                        styles.toggleBtn,
                        billingInterval === 'monthly' && [styles.toggleBtnActive, { backgroundColor: colors.card }],
                      ]}
                      onPress={() => setBillingInterval('monthly')}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          { color: billingInterval === 'monthly' ? colors.primary.DEFAULT : colors.textSecondary },
                        ]}
                      >
                        Monthly Billing
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.toggleBtn,
                        billingInterval === 'yearly' && [styles.toggleBtnActive, { backgroundColor: colors.card }],
                      ]}
                      onPress={() => setBillingInterval('yearly')}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          { color: billingInterval === 'yearly' ? colors.primary.DEFAULT : colors.textSecondary },
                        ]}
                      >
                        Annual (Save ~17%)
                      </Text>
                    </Pressable>
                  </View>

                  {/* Plan Cards List */}
                  {franchisorPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrentPlan={subscription?.planId === plan.id}
                      isCurrentActive={isCurrentActive}
                      billingInterval={billingInterval}
                      onSelect={handlePlanSelect}
                    />
                  ))}
                </View>
              )}

              {/* TAB 3: BILLING HISTORY */}
              {activeTab === 'history' && (
                <View>
                  <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                    Recent Transactions & Tax Invoices
                  </Text>

                  {loadingHistory ? (
                    <ActivityIndicator size="small" color={colors.primary.DEFAULT} style={{ marginVertical: spacing.lg }} />
                  ) : transactions.length === 0 ? (
                    <EmptyState
                      icon="receipt-outline"
                      title="No Transactions Yet"
                      description="Payment receipts and 18% GST tax invoices will appear here once orders are processed."
                    />
                  ) : (
                    transactions.map((tx) => (
                      <Card key={tx._id} style={styles.txCard} padding="md" variant="elevated">
                        <View style={styles.txHeaderRow}>
                          <View>
                            <Text style={[styles.txRef, { color: colors.textPrimary }]}>
                              {tx.transactionReference}
                            </Text>
                            <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                          <Badge
                            label={tx.status.toUpperCase()}
                            variant={tx.status === 'captured' ? 'success' : tx.status === 'refunded' ? 'warning' : 'danger'}
                            size="sm"
                          />
                        </View>

                        <View style={styles.txDetailsRow}>
                          <Text style={[styles.txPurpose, { color: colors.textSecondary }]}>
                            {tx.purpose.replace('_', ' ').toUpperCase()}
                          </Text>
                          <Text style={[styles.txAmount, { color: colors.textPrimary }]}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabText: {
    ...typography.bodyBold,
    fontSize: 13,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingCenter: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4,
  },
  currentPlanCard: {
    marginBottom: spacing.lg,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardSubtitle: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    ...typography.h1,
    fontSize: 24,
    marginTop: 2,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  periodText: {
    ...typography.caption,
    fontSize: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    fontSize: 11,
    flex: 1,
  },
  planActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  intervalToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    ...typography.bodyBold,
    fontSize: 13,
  },
  txCard: {
    marginBottom: spacing.sm,
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txRef: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  txDate: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  txDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  txPurpose: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  txAmount: {
    ...typography.bodyBold,
    fontSize: 15,
  },
});
