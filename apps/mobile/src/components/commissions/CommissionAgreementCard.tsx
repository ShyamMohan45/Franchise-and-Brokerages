import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { CommissionAgreement, CommissionAgreementStatus } from '../../types/commission';

interface CommissionAgreementCardProps {
  agreement: CommissionAgreement;
  onPress: () => void;
}

export const CommissionAgreementCard: React.FC<CommissionAgreementCardProps> = ({
  agreement,
  onPress,
}) => {
  const formatCurrency = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: CommissionAgreementStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge label="ACTIVE" variant="gold" size="sm" />;
      case 'COMPLETED':
        return <Badge label="COMPLETED" variant="success" size="sm" />;
      case 'PENDING_APPROVAL':
        return <Badge label="PENDING APPROVAL" variant="warning" size="sm" />;
      case 'TERMINATED':
        return <Badge label="TERMINATED" variant="danger" size="sm" />;
      default:
        return <Badge label={status} variant="neutral" size="sm" />;
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Card style={styles.card} padding="lg">
        {/* Top Header */}
        <View style={styles.topRow}>
          <View style={styles.titleInfo}>
            <Text style={styles.agreementNumber}>{agreement.agreementNumber}</Text>
            <Text style={styles.dealTitle} numberOfLines={1}>
              {agreement.deal?.dealTitle || agreement.franchiseListing?.brandName || 'Brokerage Deal'}
            </Text>
          </View>
          {getStatusBadge(agreement.status)}
        </View>

        {/* Brand & Payer Information */}
        <View style={styles.payerRow}>
          <Text style={styles.brandName} numberOfLines={1}>
            Brand: {agreement.brand?.fullName || agreement.franchiseListing?.brandName || 'Verified Brand'}
          </Text>
          <Badge
            label={`${(agreement.payer || 'brand').toUpperCase()} PAYS`}
            variant="primary"
            size="sm"
          />
        </View>

        {/* Financial Ledger Snapshot */}
        <View style={styles.ledgerGrid}>
          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Expected Commission</Text>
            <Text style={styles.ledgerValue}>{formatCurrency(agreement.expectedCommission)}</Text>
            <Text style={styles.rateText}>
              {agreement.commissionType === 'percentage'
                ? `${agreement.commissionRate}% rate`
                : 'Fixed Fee'}
            </Text>
          </View>

          <View style={styles.ledgerDivider} />

          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Received Revenue</Text>
            <Text style={[styles.ledgerValue, { color: colors.success.DEFAULT }]}>
              {formatCurrency(agreement.receivedRevenue)}
            </Text>
            <Text style={styles.rateText}>Verified UTR</Text>
          </View>

          <View style={styles.ledgerDivider} />

          <View style={styles.ledgerItem}>
            <Text style={styles.ledgerLabel}>Pending Balance</Text>
            <Text
              style={[
                styles.ledgerValue,
                { color: agreement.pendingCommission > 0 ? colors.accent.gold : colors.text.muted },
              ]}
            >
              {formatCurrency(agreement.pendingCommission)}
            </Text>
            <Text style={styles.rateText}>To Be Invoiced</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerMilestones}>
            {agreement.milestones?.length || 0} Milestone Schedule(s)
          </Text>
          <View style={styles.arrowRow}>
            <Text style={styles.viewDetailsText}>View Statement</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary.DEFAULT} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  agreementNumber: {
    ...typography.captionBold,
    color: colors.text.muted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dealTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: 2,
  },
  payerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandName: {
    ...typography.captionBold,
    color: colors.accent.teal,
    flex: 1,
    marginRight: spacing.sm,
  },
  ledgerGrid: {
    flexDirection: 'row',
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ledgerItem: {
    flex: 1,
    alignItems: 'center',
  },
  ledgerLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  ledgerValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 14,
  },
  rateText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 1,
  },
  ledgerDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerMilestones: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 12,
  },
});
