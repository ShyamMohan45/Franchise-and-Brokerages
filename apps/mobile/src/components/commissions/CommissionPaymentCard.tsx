import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { CommissionPayment } from '../../types/commission';

interface CommissionPaymentCardProps {
  payment: CommissionPayment;
}

export const CommissionPaymentCard: React.FC<CommissionPaymentCardProps> = ({ payment }) => {
  const formatCurrency = (val?: number) => {
    if (!val) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <Card style={styles.card} padding="md">
      <View style={styles.topRow}>
        <View style={styles.refGroup}>
          <Ionicons name="receipt-outline" size={18} color={colors.accent.teal} />
          <Text style={styles.refText}>{payment.paymentReference}</Text>
        </View>
        <Badge
          label={payment.status || 'VERIFIED'}
          variant={payment.status === 'VERIFIED' ? 'success' : 'gold'}
          size="sm"
        />
      </View>

      <View style={styles.middleRow}>
        <View>
          <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
          <Text style={styles.methodText}>
            Via {payment.paymentMethod?.toUpperCase() || 'BANK TRANSFER'} • Paid by {payment.payerName}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          Date: {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
        </Text>
        {payment.milestoneTitle && (
          <Text style={styles.milestoneTag} numberOfLines={1}>
            {payment.milestoneTitle}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  refGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  refText: {
    ...typography.captionBold,
    color: colors.text.primary,
    fontSize: 12,
  },
  middleRow: {
    marginVertical: 4,
  },
  amountText: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.success.DEFAULT,
  },
  methodText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  dateText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  milestoneTag: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 11,
    maxWidth: '55%',
  },
});
