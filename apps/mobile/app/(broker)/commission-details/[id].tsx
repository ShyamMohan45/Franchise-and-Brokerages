import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../src/components/Header';
import { Card } from '../../../src/components/Card';
import { Badge, BadgeVariant } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { LoadingOverlay } from '../../../src/components/LoadingOverlay';
import { EmptyState } from '../../../src/components/EmptyState';
import { CommissionPaymentCard } from '../../../src/components/commissions/CommissionPaymentCard';
import { RecordPaymentModal } from '../../../src/components/commissions/RecordPaymentModal';
import { CommissionService, RecordPaymentPayload } from '../../../src/services/commissionService';
import {
  CommissionAgreement,
  CommissionPayment,
  CommissionStatement,
} from '../../../src/types/commission';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';

export default function CommissionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [agreement, setAgreement] = useState<CommissionAgreement | null>(null);
  const [statement, setStatement] = useState<CommissionStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = useCallback(async (isRefresh = false) => {
    if (!id) return;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [agData, stmtData] = await Promise.allSettled([
        CommissionService.getAgreementById(id),
        CommissionService.getStatement(id),
      ]);

      if (agData.status === 'fulfilled') {
        setAgreement(agData.value);
      }
      if (stmtData.status === 'fulfilled') {
        setStatement(stmtData.value);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load commission details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleRecordPayment = async (payload: RecordPaymentPayload) => {
    setSubmitting(true);
    try {
      await CommissionService.recordPayment(payload);
      Alert.alert('Success', 'Payment recorded successfully');
      setModalVisible(false);
      fetchDetails(true);
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
        return 'primary';
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'TERMINATED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Agreement Details" showBack onBack={() => router.back()} />
        <LoadingOverlay visible={true} message="Loading commission details..." />
      </SafeAreaView>
    );
  }

  if (!agreement) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Agreement Details" showBack onBack={() => router.back()} />
        <EmptyState
          title="Agreement Not Found"
          description="The requested commission agreement could not be located."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const brandName = agreement.brand?.fullName || agreement.franchiseListing?.brandName || 'Brand Partner';
  const investorName = agreement.investor?.fullName || 'Investor Client';

  // Normalize payments to CommissionPayment[]
  const payments: CommissionPayment[] =
    agreement.payments && agreement.payments.length > 0
      ? agreement.payments
      : (statement?.payments || []).map((p, idx) => ({
          _id: p.paymentReference || String(idx),
          paymentReference: p.paymentReference,
          agreement: agreement._id,
          amount: p.amount,
          amountPaise: Math.round(p.amount * 100),
          currency: 'INR',
          paymentMethod: p.paymentMethod,
          paymentDate: p.paymentDate,
          payerName: p.payerName,
          payerRole: 'brand',
          status: p.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
          createdAt: p.paymentDate,
          notes: p.notes,
        }));

  const milestones = agreement.milestones || [];
  const dealValue = agreement.deal?.dealValue || agreement.baseAmount || 0;
  const agreementTitle =
    agreement.deal?.dealTitle || agreement.franchiseListing?.brandName || 'Commission Agreement';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={agreement.agreementNumber || 'Commission Statement'}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchDetails(true)}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* Title & Status */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.agreementTitle}>{agreementTitle}</Text>
              <Text style={styles.agreementNumber}>{agreement.agreementNumber}</Text>
            </View>
            <Badge
              label={agreement.status.replace('_', ' ').toUpperCase()}
              variant={getStatusVariant(agreement.status)}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.partiesRow}>
            <View style={styles.partyItem}>
              <Text style={styles.partyLabel}>Brand</Text>
              <Text style={styles.partyValue}>{brandName}</Text>
            </View>
            <View style={styles.partyItem}>
              <Text style={styles.partyLabel}>Investor</Text>
              <Text style={styles.partyValue}>{investorName}</Text>
            </View>
          </View>
        </Card>

        {/* Financial Ledger Breakdown */}
        <Card style={styles.ledgerCard}>
          <Text style={styles.sectionTitle}>Commission Breakdown</Text>
          <View style={styles.ledgerGrid}>
            <View style={styles.ledgerItem}>
              <Text style={styles.ledgerLabel}>Deal Value</Text>
              <Text style={styles.ledgerValue}>{formatCurrency(dealValue)}</Text>
            </View>
            <View style={styles.ledgerItem}>
              <Text style={styles.ledgerLabel}>Commission Rate</Text>
              <Text style={styles.ledgerValue}>
                {agreement.commissionRate ? `${agreement.commissionRate}%` : 'Fixed Fee'}
              </Text>
            </View>
            <View style={styles.ledgerItem}>
              <Text style={styles.ledgerLabel}>Expected Total</Text>
              <Text style={[styles.ledgerValue, { color: colors.textPrimary }]}>
                {formatCurrency(agreement.expectedCommission)}
              </Text>
            </View>
            <View style={styles.ledgerItem}>
              <Text style={styles.ledgerLabel}>Received</Text>
              <Text style={[styles.ledgerValue, { color: colors.success.DEFAULT }]}>
                {formatCurrency(agreement.receivedRevenue)}
              </Text>
            </View>
          </View>

          <View style={styles.pendingHighlight}>
            <Text style={styles.pendingLabel}>Pending Balance</Text>
            <Text style={styles.pendingValue}>
              {formatCurrency(agreement.pendingCommission)}
            </Text>
          </View>
        </Card>

        {/* Milestones Schedule */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Milestone Schedule</Text>
          {milestones.length === 0 ? (
            <Text style={styles.emptyNote}>No milestone schedule configured.</Text>
          ) : (
            milestones.map((m, idx) => (
              <View key={idx} style={styles.milestoneItem}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneName}>{m.title}</Text>
                  <Badge
                    label={m.status.toUpperCase()}
                    variant={m.status === 'PAID' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
                <View style={styles.milestoneDetails}>
                  <Text style={styles.milestonePercent}>{m.percentage}% of commission</Text>
                  <Text style={styles.milestoneAmount}>{formatCurrency(m.amount)}</Text>
                </View>
                {m.triggerStage && (
                  <Text style={styles.milestoneTrigger}>Trigger: {m.triggerStage.replace('_', ' ')}</Text>
                )}
              </View>
            ))
          )}
        </Card>

        {/* Payments History */}
        <View style={styles.paymentsSection}>
          <View style={styles.paymentsSectionHeader}>
            <Text style={styles.sectionTitle}>Recorded Payments</Text>
            <Button
              title="+ Record Payment"
              variant="outline"
              size="sm"
              onPress={() => setModalVisible(true)}
            />
          </View>

          {payments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyNote}>No payments recorded yet for this agreement.</Text>
            </Card>
          ) : (
            payments.map((p) => (
              <CommissionPaymentCard key={p._id} payment={p} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        visible={modalVisible}
        agreementId={agreement._id}
        milestones={agreement.milestones}
        expectedBalance={agreement.pendingCommission}
        onClose={() => setModalVisible(false)}
        onSubmit={handleRecordPayment}
        submitting={submitting}
      />
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
  headerCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  agreementTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  agreementNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partyItem: {
    flex: 1,
  },
  partyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  partyValue: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ledgerCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ledgerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ledgerItem: {
    width: '45%',
  },
  ledgerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  ledgerValue: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pendingHighlight: {
    backgroundColor: colors.primary.DEFAULT + '10',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.DEFAULT,
  },
  pendingLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pendingValue: {
    ...typography.h3,
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emptyNote: {
    ...typography.body2,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  milestoneItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneName: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  milestoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestonePercent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  milestoneAmount: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  milestoneTrigger: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  paymentsSection: {
    marginTop: spacing.xs,
  },
  paymentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
