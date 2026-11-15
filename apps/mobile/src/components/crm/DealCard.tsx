import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { BrokerageDeal } from '../../types/crm';
import { formatCurrencyINR } from '../marketplace';

interface DealCardProps {
  deal: BrokerageDeal;
  onPress: () => void;
  onStageChange?: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onPress, onStageChange }) => {
  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'CLOSED_WON':
        return 'success';
      case 'CLOSED_LOST':
        return 'danger';
      case 'AGREEMENT':
      case 'DUE_DILIGENCE':
      case 'NEGOTIATION':
        return 'gold';
      default:
        return 'primary';
    }
  };

  const brandName =
    deal.franchiseListing?.brandName || (deal as any).brandName || 'Franchise Deal';
  const investorName = deal.investor?.fullName || deal.relatedLead?.fullName || 'Investor';

  return (
    <Card style={styles.card} padding="md">
      <Pressable onPress={onPress}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={styles.dealTitle} numberOfLines={1}>
              {deal.dealTitle}
            </Text>
            <Text style={styles.brandText} numberOfLines={1}>
              {brandName} • {investorName}
            </Text>
          </View>
          <Badge
            label={deal.stage.replace('_', ' ')}
            variant={getStageVariant(deal.stage)}
            size="sm"
          />
        </View>

        <View style={styles.metricsBox}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>DEAL VALUE</Text>
            <Text style={styles.dealValueText}>{formatCurrencyINR(deal.dealValue)}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>EXP. COMMISSION</Text>
            <Text style={styles.commissionText}>
              {formatCurrencyINR(deal.expectedCommission || deal.dealValue * 0.05)}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerInfo}>
            <Ionicons name="calendar-outline" size={13} color={colors.slate[400]} />
            <Text style={styles.dateText}>
              Updated {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>

          {onStageChange && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onStageChange();
              }}
              style={styles.stageChangeBtn}
              hitSlop={6}
            >
              <Text style={styles.stageChangeText}>Change Stage</Text>
              <Ionicons name="swap-horizontal" size={14} color={colors.primary.DEFAULT} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  dealTitle: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  brandText: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.slate[200],
    marginHorizontal: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.slate[400],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dealValueText: {
    ...typography.bodyBold,
    color: colors.primary.DEFAULT,
  },
  commissionText: {
    ...typography.bodyBold,
    color: colors.accent.teal,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
  stageChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stageChangeText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 11,
  },
});
