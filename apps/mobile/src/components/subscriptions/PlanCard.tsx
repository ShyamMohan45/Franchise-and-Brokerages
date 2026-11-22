import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { SubscriptionPlanConfig, BillingInterval } from '../../types/subscription';

interface PlanCardProps {
  plan: SubscriptionPlanConfig;
  isCurrentPlan: boolean;
  isCurrentActive?: boolean;
  billingInterval?: BillingInterval;
  onSelect: (plan: SubscriptionPlanConfig) => void;
  disabled?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan,
  isCurrentActive = true,
  billingInterval = 'monthly',
  onSelect,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();

  const isFree = plan.monthlyPrice === 0;
  const isPopular = plan.id === 'professional';
  const isEnterprise = plan.id === 'enterprise';

  const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const priceDisplay = isFree
    ? 'Free Forever'
    : `₹${price.toLocaleString('en-IN')}`;
  const intervalDisplay = isFree ? '' : billingInterval === 'yearly' ? ' / year' : ' / month';

  return (
    <Card
      style={[
        styles.card,
        isPopular && { borderColor: colors.primary.DEFAULT, borderWidth: 2 },
        isCurrentPlan && { borderColor: colors.success.DEFAULT, borderWidth: 2 },
      ]}
      padding="lg"
      variant="elevated"
    >
      {/* Top Tag */}
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.planName, { color: colors.textPrimary }]}>{plan.name}</Text>
          {isCurrentPlan ? (
            <Badge
              label={isCurrentActive ? 'CURRENT PLAN' : 'EXPIRED'}
              variant={isCurrentActive ? 'success' : 'warning'}
              size="sm"
            />
          ) : isPopular ? (
            <Badge label="MOST POPULAR" variant="primary" size="sm" />
          ) : isEnterprise ? (
            <Badge label="ENTERPRISE" variant="gold" size="sm" />
          ) : null}
        </View>
      </View>

      {/* Pricing Row */}
      <View style={styles.pricingRow}>
        <Text style={[styles.priceNumber, { color: colors.textPrimary }]}>{priceDisplay}</Text>
        {intervalDisplay ? (
          <Text style={[styles.intervalText, { color: colors.textSecondary }]}>{intervalDisplay}</Text>
        ) : null}
      </View>

      {/* Quota Highlights Grid */}
      <View style={[styles.highlightsContainer, { backgroundColor: isDark ? colors.surfaceSubtle : '#F8FAFC' }]}>
        <View style={styles.highlightRow}>
          <Ionicons name="pricetags-outline" size={16} color={colors.primary.DEFAULT} />
          <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
            {plan.maxListings >= 999 ? 'Unlimited' : plan.maxListings} Franchise Listing{plan.maxListings === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.highlightRow}>
          <Ionicons name="business-outline" size={16} color={colors.accent.teal} />
          <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
            {plan.maxBrands >= 999 ? 'Unlimited' : plan.maxBrands} Brand Profile{plan.maxBrands === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.highlightRow}>
          <Ionicons name="mail-outline" size={16} color={colors.accent.gold} />
          <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
            {plan.monthlyLeadsLimit >= 999 ? 'Unlimited' : plan.monthlyLeadsLimit} Monthly Investor Inquiries
          </Text>
        </View>

        {plan.featuredListingSlots > 0 && (
          <View style={styles.highlightRow}>
            <Ionicons name="sparkles" size={16} color="#EAB308" />
            <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
              {plan.featuredListingSlots} Featured Listing Placement{plan.featuredListingSlots === 1 ? '' : 's'} Included
            </Text>
          </View>
        )}
      </View>

      {/* Features Checklist */}
      <View style={styles.featuresSection}>
        <Text style={[styles.featuresHeader, { color: colors.textSecondary }]}>Included Capabilities:</Text>
        {plan.features?.map((feat, idx) => (
          <View key={idx} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.buttonWrap}>
        {isCurrentPlan ? (
          <Button
            title="Active Plan"
            onPress={() => {}}
            variant="outline"
            fullWidth
            disabled
          />
        ) : (
          <Button
            title={isFree ? 'Select Free Tier' : `Upgrade to ${plan.name}`}
            onPress={() => onSelect(plan)}
            variant={isPopular ? 'primary' : 'outline'}
            fullWidth
            disabled={disabled}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  topRow: {
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    ...typography.h2,
    fontSize: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.sm,
  },
  priceNumber: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '800',
  },
  intervalText: {
    ...typography.body,
    marginLeft: spacing.xs,
    fontSize: 14,
  },
  highlightsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  highlightText: {
    ...typography.bodyBold,
    fontSize: 13,
  },
  featuresSection: {
    marginVertical: spacing.sm,
    gap: spacing.xs + 2,
  },
  featuresHeader: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.body,
    fontSize: 13,
    flex: 1,
  },
  buttonWrap: {
    marginTop: spacing.md,
  },
});
