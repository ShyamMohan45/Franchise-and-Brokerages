import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  TextInput,
  Modal,
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
} from '../../src/components';
import { PaymentService } from '../../src/services/paymentService';
import { AdminRevenueMetrics, PaymentTransactionItem } from '../../src/types/payment';
import { useAuth } from '../../src/hooks/useAuth';

export default function AdminRevenueDeskScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<AdminRevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refund Modal State
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransactionItem | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const fetchMetrics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const data = await PaymentService.getAdminRevenueMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.warn('[AdminRevenueDeskScreen] Fetch error:', err.message);
      setErrorMessage(err.message || 'Failed to load platform revenue metrics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleOpenRefundModal = (tx: PaymentTransactionItem) => {
    setSelectedTxForRefund(tx);
    setRefundAmount(String(tx.amount));
    setRefundReason('');
    setRefundModalVisible(true);
  };

  const handleExecuteRefund = async () => {
    if (!selectedTxForRefund) return;

    if (!refundReason.trim()) {
      Alert.alert('Required Field', 'Please provide a justification reason for issuing this refund.');
      return;
    }

    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0 || amt > selectedTxForRefund.amount) {
      Alert.alert('Invalid Amount', `Refund amount must be between ₹1 and ₹${selectedTxForRefund.amount}.`);
      return;
    }

    Alert.alert(
      'Confirm Administrative Refund',
      `Are you sure you want to refund ₹${amt.toLocaleString('en-IN')} for transaction ${selectedTxForRefund.transactionReference}? Any associated entitlements (featured status or active period) will be adjusted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessingRefund(true);
              await PaymentService.processRefund(
                selectedTxForRefund._id,
                refundReason.trim(),
                amt
              );
              setRefundModalVisible(false);
              Alert.alert('Refund Executed', 'The refund has been recorded and platform audit logs updated.');
              fetchMetrics(true);
            } catch (err: any) {
              Alert.alert('Refund Failed', err.message || 'Could not process administrative refund.');
            } finally {
              setIsProcessingRefund(false);
            }
          },
        },
      ]
    );
  };

  const formatINR = (val: number | undefined) => {
    return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  const getPurposeBadge = (purpose: string) => {
    switch (purpose) {
      case 'subscription':
        return <Badge label="FRANCHISOR SUB" variant="primary" size="sm" />;
      case 'investor_premium':
        return <Badge label="INVESTOR PRO" variant="success" size="sm" />;
      case 'featured_listing':
        return <Badge label="FEATURED SHOWCASE" variant="gold" size="sm" />;
      case 'commission':
        return <Badge label="BROKERAGE" variant="teal" size="sm" />;
      default:
        return <Badge label={purpose.toUpperCase()} variant="neutral" size="sm" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
        return <Badge label="CAPTURED" variant="success" size="sm" />;
      case 'refunded':
        return <Badge label="REFUNDED" variant="danger" size="sm" />;
      case 'failed':
        return <Badge label="FAILED" variant="danger" size="sm" />;
      case 'pending':
      case 'created':
      default:
        return <Badge label="PENDING" variant="warning" size="sm" />;
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Revenue & Monetization Desk"
          subtitle="Audit Platform Gross Inflows, Subscriptions & Refunds"
          showBack
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchMetrics(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {isLoading && !isRefreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                Auditing platform ledger and revenue streams...
              </Text>
            </View>
          ) : errorMessage ? (
            <Card style={styles.errorCard} padding="lg">
              <Ionicons name="alert-circle-outline" size={32} color={colors.danger.DEFAULT} />
              <Text style={styles.errorTitle}>Failed to Load Revenue Desk</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <Button
                title="Retry"
                onPress={() => fetchMetrics(false)}
                size="sm"
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <>
              {/* PRIMARY KPI: TOTAL CAPTURED INFLOWS */}
              <Card style={styles.totalRevenueCard} padding="lg">
                <View style={styles.totalRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.totalLabel}>TOTAL NET CAPTURED REVENUE</Text>
                    <Text style={styles.totalValue}>{formatINR(metrics?.capturedRevenueINR)}</Text>
                    <Text style={styles.totalNotice}>
                      Strictly settled and cryptographically confirmed inflows only. Excludes in-flight or projected amounts.
                    </Text>
                  </View>
                  <View style={styles.totalIconCircle}>
                    <Ionicons name="cash" size={28} color="#FFFFFF" />
                  </View>
                </View>
              </Card>

              {/* SEPARATE STREAM BREAKDOWN */}
              <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>
                Captured Revenue Streams
              </Text>

              <View style={styles.kpiGrid}>
                {/* Franchisor Subscriptions */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="business-outline" size={20} color={colors.primary.DEFAULT} />
                    <Badge label="FRANCHISOR" variant="primary" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.text.primary }]}>
                    {formatINR(metrics?.franchisorSubscriptionRevenueINR || (metrics?.subscriptionRevenueINR || 0) - (metrics?.investorPremiumRevenueINR || 0))}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Franchisor Subscriptions
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    {metrics?.activeSubscriptionsCount || 0} active paid memberships
                  </Text>
                </Card>

                {/* Investor Premium */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="sparkles-outline" size={20} color={colors.success.DEFAULT} />
                    <Badge label="INVESTOR" variant="success" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.text.primary }]}>
                    {formatINR(metrics?.investorPremiumRevenueINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Investor Premium Tier
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    ₹4,999/mo due diligence access
                  </Text>
                </Card>

                {/* Featured Listings */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="star-outline" size={20} color="#D97706" />
                    <Badge label="SHOWCASE" variant="gold" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.text.primary }]}>
                    {formatINR(metrics?.featuredListingRevenueINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Featured Listing Packages
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    {metrics?.activeFeaturedListingsCount || 0} active showcase listings
                  </Text>
                </Card>

                {/* Brokerage Commissions */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="briefcase-outline" size={20} color={colors.accent.teal} />
                    <Badge label="SETTLED" variant="teal" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.text.primary }]}>
                    {formatINR(metrics?.brokerageRevenueINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Brokerage Received
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    Verified expansion success fees
                  </Text>
                </Card>
              </View>

              {/* DEDUCTIONS & IN-FLIGHT METRICS */}
              <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>
                Deductions & Pipeline Telemetry
              </Text>

              <View style={styles.kpiGrid}>
                {/* Refunds */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="refresh-circle-outline" size={20} color={colors.danger.DEFAULT} />
                    <Badge label="DEDUCTION" variant="danger" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.danger.DEFAULT }]}>
                    {formatINR(metrics?.refundedRevenueINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Refunds Executed
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    All administrative reversals
                  </Text>
                </Card>

                {/* In-Flight Pending */}
                <Card style={styles.kpiCard} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="time-outline" size={20} color={colors.warning.DEFAULT} />
                    <Badge label="UNCAPTURED" variant="warning" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.warning.DEFAULT }]}>
                    {formatINR(metrics?.pendingRevenueINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Pending In-Flight
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    Awaiting gateway capture
                  </Text>
                </Card>

                {/* Projected Pipeline */}
                <Card style={[styles.kpiCard, { flex: 2 }]} padding="md">
                  <View style={styles.kpiHeader}>
                    <Ionicons name="trending-up-outline" size={20} color={colors.accent.teal} />
                    <Badge label="PROJECTION" variant="teal" size="sm" />
                  </View>
                  <Text style={[styles.kpiVal, { color: colors.text.primary }]}>
                    {formatINR(metrics?.projectedCommissionsINR)}
                  </Text>
                  <Text style={[styles.kpiTitle, { color: colors.slate[400] }]}>
                    Projected Brokerage Commissions (Pipeline)
                  </Text>
                  <Text style={[styles.kpiSub, { color: colors.slate[500] }]}>
                    Unrealized fees tied to active deal room milestones. Strictly segregated from captured revenue.
                  </Text>
                </Card>
              </View>

              {/* RECENT SETTLED LEDGER */}
              <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>
                Recent Transaction Ledger (Real Audit Stream)
              </Text>

              {metrics?.recentTransactions?.length === 0 ? (
                <EmptyState
                  title="No Transactions Recorded"
                  description="All platform payment events, subscription checkouts, and featured listing purchases will stream here."
                  icon="receipt-outline"
                />
              ) : (
                metrics?.recentTransactions?.map((tx) => (
                  <Card key={tx._id} style={styles.txCard} padding="md">
                    <View style={styles.txHeader}>
                      <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <View style={styles.badgeRow}>
                          {getPurposeBadge(tx.purpose)}
                          {getStatusBadge(tx.status)}
                        </View>
                        <Text style={[styles.txRef, { color: colors.text.primary }]}>
                          {tx.transactionReference}
                        </Text>
                        <Text style={[styles.txDate, { color: colors.slate[400] }]}>
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.txAmount, { color: colors.text.primary }]}>
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </Text>
                        <Text style={[styles.txOrder, { color: colors.slate[400] }]}>
                          {tx.gatewayOrderId || 'Gateway Direct'}
                        </Text>
                      </View>
                    </View>

                    {/* Admin Refund Button */}
                    {tx.status === 'captured' && (
                      <View style={styles.txActionRow}>
                        <Button
                          title="Issue Reversal / Refund"
                          onPress={() => handleOpenRefundModal(tx)}
                          variant="outline"
                          size="sm"
                          style={styles.refundBtn}
                        />
                      </View>
                    )}
                  </Card>
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* Modal: Administrative Refund */}
        <Modal
          visible={refundModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setRefundModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Process Refund</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.slate[400] }]}>
                    Ref: {selectedTxForRefund?.transactionReference}
                  </Text>
                </View>
                <Pressable onPress={() => setRefundModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.slate[400]} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                <View style={[styles.alertNotice, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                  <Ionicons name="warning-outline" size={20} color={colors.danger.DEFAULT} />
                  <Text style={[styles.alertText, { color: colors.danger.DEFAULT }]}>
                    Issuing a refund will revoke active entitlements associated with this transaction and record the action in statutory audit logs.
                  </Text>
                </View>

                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Refund Amount (INR) *</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={refundAmount}
                  onChangeText={setRefundAmount}
                  keyboardType="numeric"
                  placeholder="Amount in INR"
                  placeholderTextColor={colors.slate[400]}
                />

                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Audit Justification / Reason *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, { color: colors.text.primary, borderColor: colors.border }]}
                  value={refundReason}
                  onChangeText={setRefundReason}
                  multiline
                  numberOfLines={3}
                  placeholder="Explain why this administrative refund is being granted..."
                  placeholderTextColor={colors.slate[400]}
                />

                <Button
                  title="Confirm Reversal & Revoke Entitlement"
                  onPress={handleExecuteRefund}
                  variant="danger"
                  fullWidth
                  size="lg"
                  loading={isProcessingRefund}
                  style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
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
  totalRevenueCard: {
    backgroundColor: '#0B1320',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.caption,
    color: '#94A3B8',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },
  totalNotice: {
    ...typography.caption,
    color: '#64748B',
    marginTop: spacing.xs,
    fontSize: 11,
    lineHeight: 15,
  },
  totalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  sectionHeading: {
    ...typography.h3,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.md,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiTitle: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  kpiSub: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  txCard: {
    borderRadius: borderRadius.md,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: 4,
  },
  txRef: {
    ...typography.bodyBold,
    fontWeight: '700',
  },
  txDate: {
    ...typography.caption,
    marginTop: 2,
  },
  txAmount: {
    ...typography.h3,
    fontWeight: '800',
  },
  txOrder: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  txActionRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.xs,
    alignItems: 'flex-end',
  },
  refundBtn: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.caption,
  },
  modalForm: {
    gap: spacing.sm,
  },
  alertNotice: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
