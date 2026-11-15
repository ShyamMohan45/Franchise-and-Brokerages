import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { FranchiseListing } from '../../types/franchise';

interface FranchiseCardProps {
  listing: FranchiseListing;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function formatCurrencyINR(amount: number): string {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(1).replace(/\.0$/, '');
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(1).replace(/\.0$/, '');
    return `₹${lk} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const FranchiseCard: React.FC<FranchiseCardProps> = ({
  listing,
  onPress,
  isSaved = false,
  onToggleSave,
}) => {
  const investmentText = `${formatCurrencyINR(listing.totalInvestmentMin)} - ${formatCurrencyINR(listing.totalInvestmentMax)}`;
  const franchiseFeeText = listing.initialFranchiseFee
    ? formatCurrencyINR(listing.initialFranchiseFee)
    : 'Contact Brand';

  const locationsText =
    listing.expansionLocations && listing.expansionLocations.length > 0
      ? listing.expansionLocations.slice(0, 3).join(', ') +
        (listing.expansionLocations.length > 3 ? ` +${listing.expansionLocations.length - 3} more` : '')
      : 'Pan-India / Multiple Cities';

  const initials = listing.brandName
    ? listing.brandName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FB';

  return (
    <Card style={styles.card} padding="md">
      <Pressable onPress={onPress} style={styles.contentContainer}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoInitial}>{initials}</Text>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName} numberOfLines={1}>
                {listing.brandName}
              </Text>
              <Text style={styles.industryText} numberOfLines={1}>
                {listing.industry || listing.category || 'Franchise'}
              </Text>
            </View>
          </View>

          {onToggleSave && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              style={styles.saveButton}
              hitSlop={8}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={22}
                color={isSaved ? colors.danger.DEFAULT : colors.slate[400]}
              />
            </Pressable>
          )}
        </View>

        {/* Opportunity Title / Tagline */}
        <Text style={styles.title} numberOfLines={2}>
          {listing.opportunityTitle || listing.tagline || `${listing.brandName} Franchise Opportunity`}
        </Text>

        {/* Financial Highlights Grid */}
        <View style={styles.metricsBox}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>INVESTMENT</Text>
            <Text style={styles.metricValuePrimary}>{investmentText}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>FRANCHISE FEE</Text>
            <Text style={styles.metricValue}>{franchiseFeeText}</Text>
          </View>
        </View>

        {/* Details Footer */}
        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={colors.slate[400]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationsText}
            </Text>
          </View>

          <View style={styles.badgesRow}>
            {listing.businessModel && (
              <Badge label={listing.businessModel} variant="neutral" size="sm" />
            )}
            {listing.royaltyPercentage !== undefined && (
              <Badge label={`${listing.royaltyPercentage}% Royalty`} variant="primary" size="sm" />
            )}
          </View>
        </View>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  contentContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoInitial: {
    ...typography.captionBold,
    color: colors.white,
    fontWeight: '700',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  industryText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
  saveButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.slate[800],
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.slate[100],
  },
  metricColumn: {
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
    fontSize: 10,
    color: colors.slate[400],
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValuePrimary: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  metricValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.navy[900],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  locationText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
    marginLeft: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
