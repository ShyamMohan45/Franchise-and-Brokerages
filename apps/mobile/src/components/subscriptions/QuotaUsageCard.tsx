import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';

interface QuotaUsageCardProps {
  title: string;
  used: number;
  limit: number;
  icon: keyof typeof Ionicons.glyphMap;
  helperText?: string;
}

export const QuotaUsageCard: React.FC<QuotaUsageCardProps> = ({
  title,
  used,
  limit,
  icon,
  helperText,
}) => {
  const { colors, isDark } = useTheme();

  const isUnlimited = limit >= 999;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const isFull = !isUnlimited && used >= limit;
  const isNearLimit = !isUnlimited && percentage >= 75 && !isFull;

  let progressColor = colors.primary.DEFAULT;
  if (isFull) {
    progressColor = colors.danger.DEFAULT;
  } else if (isNearLimit) {
    progressColor = colors.warning.DEFAULT;
  }

  const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - used);

  return (
    <Card style={styles.card} padding="md" variant="elevated">
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceSubtle : '#EFF4FF' }]}>
            <Ionicons name={icon} size={20} color={progressColor} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            {helperText && <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helperText}</Text>}
          </View>
        </View>

        <View style={styles.countContainer}>
          <Text style={[styles.usedText, { color: isFull ? colors.danger.DEFAULT : colors.textPrimary }]}>
            {used}
          </Text>
          <Text style={[styles.limitText, { color: colors.textSecondary }]}>
            {isUnlimited ? ' / ∞' : ` / ${limit}`}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={[styles.track, { backgroundColor: isDark ? colors.surfaceSubtle : '#E2E8F0' }]}>
        <View
          style={[
            styles.fill,
            {
              width: isUnlimited ? '10%' : `${Math.max(5, percentage)}%`,
              backgroundColor: isUnlimited ? colors.accent.teal : progressColor,
            },
          ]}
        />
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={[styles.statusText, { color: isFull ? colors.danger.DEFAULT : colors.textSecondary }]}>
          {isFull
            ? 'Quota reached — upgrade required'
            : isUnlimited
            ? 'Enterprise Unlimited Quota'
            : `${remaining} remaining`}
        </Text>
        {!isUnlimited && (
          <Text style={[styles.percentText, { color: colors.textSecondary }]}>
            {percentage}%
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  helperText: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 1,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  usedText: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  limitText: {
    ...typography.caption,
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
  },
  percentText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});
