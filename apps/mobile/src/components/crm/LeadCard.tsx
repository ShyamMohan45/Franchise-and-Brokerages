import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Lead } from '../../types/crm';
import { formatCurrencyINR } from '../marketplace';

interface LeadCardProps {
  lead: Lead;
  onPress: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPress }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge label="NEW" variant="primary" size="sm" />;
      case 'qualified':
        return <Badge label="QUALIFIED" variant="success" size="sm" />;
      case 'contacted':
        return <Badge label="CONTACTED" variant="info" size="sm" />;
      case 'meeting_scheduled':
        return <Badge label="MEETING" variant="gold" size="sm" />;
      case 'negotiation':
      case 'converted':
        return <Badge label={status.toUpperCase()} variant="success" size="sm" />;
      case 'lost':
      case 'not_qualified':
        return <Badge label={status.toUpperCase()} variant="danger" size="sm" />;
      default:
        return <Badge label={status.toUpperCase()} variant="neutral" size="sm" />;
    }
  };

  const budgetText =
    lead.budgetMin && lead.budgetMax
      ? `${formatCurrencyINR(lead.budgetMin)} - ${formatCurrencyINR(lead.budgetMax)}`
      : lead.budgetMin
      ? formatCurrencyINR(lead.budgetMin)
      : 'Budget not declared';

  return (
    <Card style={styles.card} padding="md">
      <Pressable onPress={onPress}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={styles.nameText} numberOfLines={1}>
              {lead.fullName}
            </Text>
            {lead.company && (
              <Text style={styles.companyText} numberOfLines={1}>
                {lead.company}
              </Text>
            )}
          </View>
          {getStatusBadge(lead.status)}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.infoText} numberOfLines={1}>
              {lead.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.infoText} numberOfLines={1}>
              {lead.phone}
            </Text>
          </View>

          {lead.preferredCity && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.slate[400]} />
              <Text style={styles.infoText} numberOfLines={1}>
                {lead.preferredCity}
                {lead.preferredState ? `, ${lead.preferredState}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.budgetText} numberOfLines={1}>
              {budgetText}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.tagWrap}>
            <Text style={styles.typeText}>{lead.leadType.replace('_', ' ').toUpperCase()}</Text>
            {lead.targetIndustry && (
              <Text style={styles.industryTag}>• {lead.targetIndustry}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.slate[400]} />
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
  nameText: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  companyText: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 1,
  },
  infoGrid: {
    gap: 4,
    paddingVertical: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.slate[600],
    fontSize: 12,
    flex: 1,
  },
  budgetText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    ...typography.captionBold,
    color: colors.slate[400],
    fontSize: 10,
    letterSpacing: 0.5,
  },
  industryTag: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
});
