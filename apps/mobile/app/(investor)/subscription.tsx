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
  RazorpayWebViewModal,
  CheckoutOrderSummaryModal,
} from '../../src/components';
import { useSubscription } from '../../src/hooks/useSubscription';
import { useCheckout } from '../../src/hooks/useCheckout';
import { useAuth } from '../../src/hooks/useAuth';
import { PaymentService } from '../../src/services/paymentService';
import {
  SubscriptionPlanConfig,
  BillingInterval,
} from '../../src/types/subscription';
import { PaymentTransactionItem } from '../../src/types/payment';

export default function InvestorSubscriptionScreen() {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'upgrade' | 'history'>('overview');

  const { user } = useAuth();
  const {
    isProcessing,
    isVerifying,
    webViewOptions,
    isWebViewVisible,
    startCheckout,
    cancelWebView,
    handleWebViewSuccess,
    handleWebViewError,
  } = useCheckout();

  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);

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
        console.warn('[InvestorSubscriptionScreen] Error loading payment history:', err.message);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const isInvestorPremium =
    subscription?.planId === 'investor_premium' &&
    subscription?.status === 'active' &&
    new Date(subscription.currentPeriodEnd) > new Date();

  const investorPremiumPlan: SubscriptionPlanConfig = plans.find(
    (p) => p.id === 'investor_premium'
  ) || {
    id: 'investor_premium',
    name: 'Investor Pro & Intelligence',
    role: 'investor',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    currency: 'INR',
    maxBrands: 0,
    maxListings: 0,
    monthlyLeadsLimit: 999,
    featuredListingSlots: 0,
    analyticsTier: 'advanced',
    features: [
      'Advanced Multi-Vector AI Match Scoring (Budget, Territory, Industry, Experience)',
      'Full FDD Financial Due Diligence & CapEx Benchmarks',
      'Unlimited Saved Searches & Instant Opportunity Notifications',
      'Priority Introduction Requests & Direct Franchisor Connections',
      'Private Virtual Deal Room Access & Document Sharing',
    ],
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Investor Premium Renewal',
      'Are you sure you want to cancel automatic renewal? Your premium intelligence and priority introduction access will remain active until the end of your billing cycle.',
      [
        { text: 'Keep Membership', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCanceling(true);
              await cancel();
              Alert.alert(
                'Cancellation Scheduled',
                'Your Investor Premium will not renew after the current period ends. You retain full access until then.'
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

  const handleUpgradePress = () => {
    if (isInvestorPremium) {
      Alert.alert(
        'Active Membership',
        'You already have an active Investor Pro & Intelligence membership.'
      );
      return;
    }
    setIsSummaryModalVisible(true);
  };

  const handleConfirmCheckout = async (billingDetails: any) => {
    setIsSummaryModalVisible(false);

    try {
      const result = await startCheckout(
        {
          purpose: 'investor_premium',
          planId: 'investor_premium',
          billingInterval,
        },
        {
          title: 'FranchiseBridge Investor Premium',
          description: `Investor Pro & Intelligence (${billingInterval === 'yearly' ? 'Annual' : 'Monthly'} Membership)`,
          billingDetails,
        }
      );

      if (result.success) {
        Alert.alert(
          '🎉 Investor Premium Activated!',
          'Your Investor Pro & Intelligence membership is now active! You now have full access to deep match scores, FDD insights, and priority introductions.',
          [
            {
              text: 'Explore Smart Matches',
              onPress: () => {
                refresh();
                router.push('/(investor)/matching' as any);
              },
            },
            {
              text: 'View Dashboard',
              onPress: () => {
                refresh();
                setActiveTab('overview');
              },
            },
          ]
        );
        refresh();
      } else if (!result.cancelled && result.error) {
        Alert.alert('Payment Status', result.error);
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err?.message || 'Unable to complete transaction.');
    }
  };

  const comparisonFeatures = [
    {
      title: 'AI Compatibility Scoring',
      free: 'Standard Score Only',
      premium: '5-Vector Breakdown (CapEx, Territory, Sector, Experience, Timing)',
      highlight: true,
    },
    {
      title: 'FDD & Diligence Analytics',
      free: 'Basic Summary',
      premium: 'Full Unit Economics, Fee Matrix & Historical Growth Data',
      highlight: true,
    },
    {
      title: 'Introduction Requests',
      free: 'Standard Queue',
      premium: 'Priority Introduction Queue & Direct Notification to Brand Founders',
      highlight: true,
    },
    {
      title: 'Saved Searches & Alerts',
      free: 'Up to 3 Searches',
      premium: 'Unlimited Saved Filters & Real-Time New Brand Alerts',
      highlight: false,
    },
    {
      title: 'Virtual Deal Room Collaboration',
      free: 'Read Only',
      premium: 'Full Document Vault, Due Diligence Checklists & Direct Chat',
      highlight: false,
    },
    {
      title: 'Dedicated Franchise Advisor',
      free: 'Self-Serve Helpdesk',
      premium: 'Senior Broker Mediation & Introduction Coordination',
      highlight: false,
    },
  ];

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Investor Membership"
          subtitle="Pro Tier & Due Diligence Intelligence"
          showBack
          onBack={() => router.back()}
        />

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.tabItem, activeTab === 'overview' && styles.activeTabItem]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'overview' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Current Status
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'upgrade' && styles.activeTabItem]}
            onPress={() => setActiveTab('upgrade')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'upgrade' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'upgrade' && styles.activeTabText,
              ]}
            >
              Compare & Upgrade
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'history' && styles.activeTabItem]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'history' && styles.activeTabText,
              ]}
            >
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
          {isLoading && !isRefreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                Loading membership status...
              </Text>
            </View>
          ) : error ? (
            <Card style={styles.errorCard} padding="lg">
              <Ionicons name="alert-circle-outline" size={32} color={colors.danger.DEFAULT} />
              <Text style={styles.errorTitle}>Failed to Load Membership</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <Button title="Retry" onPress={refresh} size="sm" variant="outline" style={{ marginTop: spacing.md }} />
            </Card>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <View style={styles.tabContent}>
                  {/* Current Plan Status Card */}
                  <Card
                    style={[
                      styles.membershipCard,
                      isInvestorPremium
                        ? { borderColor: colors.primary.DEFAULT, borderWidth: 1.5 }
                        : { borderColor: colors.border },
                    ]}
                    padding="lg"
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.planHeaderInfo}>
                        <View style={styles.badgeRow}>
                          <Badge
                            label={isInvestorPremium ? 'PRO INTELLIGENCE' : 'FREE TIER'}
                            variant={isInvestorPremium ? 'success' : 'neutral'}
                            size="sm"
                          />
                          {subscription?.cancelAtPeriodEnd && (
                            <Badge label="CANCELS AT END" variant="warning" size="sm" />
                          )}
                        </View>
                        <Text style={[styles.planTitle, { color: colors.text.primary }]}>
                          {isInvestorPremium ? 'Investor Pro & Intelligence' : 'Free Investor Account'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.planIconCircle,
                          {
                            backgroundColor: isInvestorPremium
                              ? colors.primary.DEFAULT + '20'
                              : colors.slate[100],
                          },
                        ]}
                      >
                        <Ionicons
                          name={isInvestorPremium ? 'shield-checkmark' : 'person-outline'}
                          size={28}
                          color={isInvestorPremium ? colors.primary.DEFAULT : colors.slate[500]}
                        />
                      </View>
                    </View>

                    <Text style={[styles.planDesc, { color: colors.slate[400] }]}>
                      {isInvestorPremium
                        ? 'Full proprietary AI compatibility breakdown, deep FDD due diligence analytics, and priority mutual introductions.'
                        : 'Basic access to public franchise catalog and standard inquiry submissions.'}
                    </Text>

                    {/* Expiry / Renewal Info */}
                    <View style={[styles.periodInfoBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[50] }]}>
                      <View style={styles.periodRow}>
                        <Text style={[styles.periodLabel, { color: colors.slate[400] }]}>Membership Status</Text>
                        <Text style={[styles.periodValue, { color: colors.text.primary }]}>
                          {subscription?.status ? subscription.status.toUpperCase() : 'ACTIVE'}
                        </Text>
                      </View>

                      {isInvestorPremium && subscription?.currentPeriodEnd && (
                        <View style={styles.periodRow}>
                          <Text style={[styles.periodLabel, { color: colors.slate[400] }]}>Current Period Ends</Text>
                          <Text style={[styles.periodValue, { color: colors.text.primary }]}>
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                      )}

                      {isInvestorPremium && (
                        <View style={styles.periodRow}>
                          <Text style={[styles.periodLabel, { color: colors.slate[400] }]}>Billing Interval</Text>
                          <Text style={[styles.periodValue, { color: colors.text.primary }]}>
                            {subscription?.billingInterval === 'yearly' ? 'Annual (₹49,990/yr)' : 'Monthly (₹4,999/mo)'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Upgrade or Manage CTA */}
                    {!isInvestorPremium ? (
                      <Button
                        title="Upgrade to Investor Premium (₹4,999/mo)"
                        onPress={() => setActiveTab('upgrade')}
                        variant="primary"
                        fullWidth
                        size="lg"
                        style={{ marginTop: spacing.md }}
                      />
                    ) : (
                      <View style={styles.activeActionsRow}>
                        <Button
                          title="View Smart Matches"
                          onPress={() => router.push('/(investor)/matching' as any)}
                          variant="primary"
                          size="md"
                          style={{ flex: 1 }}
                        />
                        {!subscription?.cancelAtPeriodEnd && (
                          <Button
                            title="Cancel Renewal"
                            onPress={handleCancelSubscription}
                            variant="outline"
                            size="md"
                            loading={isCanceling}
                            style={{ flex: 1 }}
                          />
                        )}
                      </View>
                    )}
                  </Card>

                  {/* Quick Feature Highlights Card */}
                  <Card style={styles.highlightsCard} padding="lg">
                    <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>Your Entitlements</Text>
                    <View style={styles.entitlementList}>
                      <View style={styles.entitlementItem}>
                        <Ionicons
                          name={isInvestorPremium ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={isInvestorPremium ? colors.success.DEFAULT : colors.slate[400]}
                        />
                        <Text style={[styles.entitlementText, { color: colors.text.primary }]}>
                          Multi-Vector Compatibility Engine
                        </Text>
                      </View>

                      <View style={styles.entitlementItem}>
                        <Ionicons
                          name={isInvestorPremium ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={isInvestorPremium ? colors.success.DEFAULT : colors.slate[400]}
                        />
                        <Text style={[styles.entitlementText, { color: colors.text.primary }]}>
                          Full FDD & Unit Economics Analytics
                        </Text>
                      </View>

                      <View style={styles.entitlementItem}>
                        <Ionicons
                          name={isInvestorPremium ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={isInvestorPremium ? colors.success.DEFAULT : colors.slate[400]}
                        />
                        <Text style={[styles.entitlementText, { color: colors.text.primary }]}>
                          Priority Introduction Invitations
                        </Text>
                      </View>

                      <View style={styles.entitlementItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.success.DEFAULT}
                        />
                        <Text style={[styles.entitlementText, { color: colors.text.primary }]}>
                          Standard Franchise Catalog Access
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              {/* TAB 2: COMPARE & UPGRADE */}
              {activeTab === 'upgrade' && (
                <View style={styles.tabContent}>
                  {/* Interval Switcher */}
                  <View style={[styles.intervalContainer, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
                    <Pressable
                      style={[
                        styles.intervalButton,
                        billingInterval === 'monthly' && { backgroundColor: colors.surface },
                      ]}
                      onPress={() => setBillingInterval('monthly')}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          { color: billingInterval === 'monthly' ? colors.primary.DEFAULT : colors.slate[400] },
                          billingInterval === 'monthly' && styles.activeIntervalText,
                        ]}
                      >
                        Monthly Billing
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.intervalButton,
                        billingInterval === 'yearly' && { backgroundColor: colors.surface },
                      ]}
                      onPress={() => setBillingInterval('yearly')}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          { color: billingInterval === 'yearly' ? colors.primary.DEFAULT : colors.slate[400] },
                          billingInterval === 'yearly' && styles.activeIntervalText,
                        ]}
                      >
                        Annual Billing (Save 17%)
                      </Text>
                    </Pressable>
                  </View>

                  {/* Pricing Card */}
                  <Card
                    style={[styles.pricingCard, { borderColor: colors.primary.DEFAULT, borderWidth: 2 }]}
                    padding="lg"
                  >
                    <View style={styles.pricingBadgeRow}>
                      <Badge label="MOST POPULAR FOR ACQUISITORS" variant="primary" size="sm" />
                    </View>

                    <Text style={[styles.pricingPlanName, { color: colors.text.primary }]}>
                      Investor Pro & Intelligence
                    </Text>

                    <View style={styles.priceRow}>
                      <Text style={[styles.priceCurrency, { color: colors.primary.DEFAULT }]}>₹</Text>
                      <Text style={[styles.priceAmount, { color: colors.primary.DEFAULT }]}>
                        {billingInterval === 'yearly'
                          ? investorPremiumPlan.yearlyPrice.toLocaleString('en-IN')
                          : investorPremiumPlan.monthlyPrice.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.pricePeriod, { color: colors.slate[400] }]}>
                        /{billingInterval === 'yearly' ? 'year' : 'month'}
                      </Text>
                    </View>

                    {billingInterval === 'yearly' && (
                      <Text style={[styles.savingsNote, { color: colors.success.DEFAULT }]}>
                        Equivalent to ₹4,165/mo. Includes 2 months free!
                      </Text>
                    )}

                    <Button
                      title={
                        isInvestorPremium
                          ? 'Current Active Plan'
                          : `Upgrade Now (${billingInterval === 'yearly' ? '₹49,990/yr' : '₹4,999/mo'})`
                      }
                      onPress={handleUpgradePress}
                      disabled={isInvestorPremium}
                      variant="primary"
                      fullWidth
                      size="lg"
                      style={{ marginTop: spacing.lg }}
                      loading={isProcessing || isVerifying}
                    />
                  </Card>

                  {/* Comparison Matrix */}
                  <Text style={[styles.comparisonTitle, { color: colors.text.primary }]}>
                    Plan Comparison: Free vs. Pro Intelligence
                  </Text>

                  {comparisonFeatures.map((feat, idx) => (
                    <Card key={idx} style={styles.comparisonCard} padding="md">
                      <Text style={[styles.featTitle, { color: colors.text.primary }]}>{feat.title}</Text>
                      <View style={styles.featComparisonRow}>
                        <View style={styles.featCol}>
                          <Text style={[styles.colHeader, { color: colors.slate[400] }]}>Free Investor</Text>
                          <Text style={[styles.colValue, { color: colors.slate[500] }]}>{feat.free}</Text>
                        </View>
                        <View style={[styles.featCol, styles.colHighlight]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="sparkles" size={14} color={colors.primary.DEFAULT} />
                            <Text style={[styles.colHeader, { color: colors.primary.DEFAULT }]}>Pro Intelligence</Text>
                          </View>
                          <Text style={[styles.colValue, { color: colors.text.primary, fontWeight: '600' }]}>
                            {feat.premium}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}

              {/* TAB 3: BILLING HISTORY */}
              {activeTab === 'history' && (
                <View style={styles.tabContent}>
                  {loadingHistory ? (
                    <View style={styles.centerBox}>
                      <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                      <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                        Loading payment invoices...
                      </Text>
                    </View>
                  ) : transactions.length === 0 ? (
                    <EmptyState
                      title="No Payment History Yet"
                      description="Invoices and transaction receipts will appear here after your first completed payment."
                      icon="receipt-outline"
                    />
                  ) : (
                    transactions.map((tx) => (
                      <Card key={tx._id} style={styles.txCard} padding="md">
                        <View style={styles.txHeader}>
                          <View>
                            <Text style={[styles.txPurpose, { color: colors.text.primary }]}>
                              {tx.purpose === 'investor_premium' || tx.purpose === 'subscription'
                                ? 'Investor Pro Membership'
                                : tx.purpose.toUpperCase()}
                            </Text>
                            <Text style={[styles.txDate, { color: colors.slate[400] }]}>
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                          <Badge
                            label={tx.status.toUpperCase()}
                            variant={tx.status === 'captured' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'}
                            size="sm"
                          />
                        </View>

                        <View style={styles.txFooter}>
                          <Text style={[styles.txRef, { color: colors.slate[400] }]}>
                            Order: {tx.gatewayOrderId || tx._id.slice(-8)}
                          </Text>
                          <Text style={[styles.txAmount, { color: colors.text.primary }]}>
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

        {/* Checkout Order Summary Modal */}
        <CheckoutOrderSummaryModal
          visible={isSummaryModalVisible}
          plan={investorPremiumPlan}
          billingInterval={billingInterval}
          initialUser={{
            name: user?.fullName,
            email: user?.email,
            phone: user?.phone,
          }}
          onConfirm={handleConfirmCheckout}
          onClose={() => setIsSummaryModalVisible(false)}
        />

        {/* Razorpay WebView Fallback Modal */}
        <RazorpayWebViewModal
          visible={isWebViewVisible}
          options={webViewOptions}
          onSuccess={handleWebViewSuccess}
          onError={handleWebViewError}
          onCancel={cancelWebView}
        />
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
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  centerBox: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: '#EF4444',
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    ...typography.caption,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tabContent: {
    gap: spacing.lg,
  },
  membershipCard: {
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planHeaderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  planTitle: {
    ...typography.h2,
    fontWeight: '700',
  },
  planIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  planDesc: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  periodInfoBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodLabel: {
    ...typography.caption,
  },
  periodValue: {
    ...typography.caption,
    fontWeight: '700',
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  highlightsCard: {
    borderRadius: borderRadius.lg,
  },
  sectionHeading: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  entitlementList: {
    gap: spacing.md,
  },
  entitlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entitlementText: {
    ...typography.body,
    flex: 1,
  },
  intervalContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    padding: 4,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  intervalButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  activeIntervalText: {
    fontWeight: '700',
  },
  pricingCard: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  pricingBadgeRow: {
    marginBottom: spacing.xs,
  },
  pricingPlanName: {
    ...typography.h2,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.sm,
  },
  priceCurrency: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
  },
  pricePeriod: {
    ...typography.caption,
    marginLeft: 4,
  },
  savingsNote: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  comparisonTitle: {
    ...typography.h3,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  comparisonCard: {
    borderRadius: borderRadius.md,
  },
  featTitle: {
    ...typography.bodyBold,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  featComparisonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  featCol: {
    flex: 1,
  },
  colHighlight: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  colHeader: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: 2,
  },
  colValue: {
    ...typography.caption,
    lineHeight: 16,
  },
  txCard: {
    borderRadius: borderRadius.md,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txPurpose: {
    ...typography.bodyBold,
    fontWeight: '700',
  },
  txDate: {
    ...typography.caption,
    marginTop: 2,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.sm,
  },
  txRef: {
    ...typography.caption,
  },
  txAmount: {
    ...typography.h3,
    fontWeight: '700',
  },
});
