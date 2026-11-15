import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { AdminBusinessItem } from '../../types/admin';

interface PendingApprovalCardProps {
  business: AdminBusinessItem;
  onApprove: () => void;
  onReject: () => void;
}

export const PendingApprovalCard: React.FC<PendingApprovalCardProps> = ({
  business,
  onApprove,
  onReject,
}) => {
  return (
    <Card style={styles.card} padding="md">
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {business.companyName || business.brandName || 'Business Profile'}
          </Text>
          <Text style={styles.industryText}>{business.industry || 'General Franchise'}</Text>
        </View>
        <Badge
          label={business.approvalStatus?.replace(/_/g, ' ').toUpperCase() || 'UNDER REVIEW'}
          variant={business.approvalStatus === 'approved' ? 'success' : business.approvalStatus === 'rejected' ? 'danger' : 'gold'}
          size="sm"
        />
      </View>

      {/* Promotor & Registration */}
      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>
          Owner: {business.user?.fullName || 'Registered Brand'} ({business.user?.email})
        </Text>
        {business.registrationNumber && (
          <Text style={styles.metaLabel}>CIN / GSTIN: {business.registrationNumber}</Text>
        )}
      </View>

      {/* Review Notes if rejected / action required */}
      {business.adminReviewNotes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{business.adminReviewNotes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Pressable style={[styles.btn, styles.rejectBtn]} onPress={onReject}>
          <Ionicons name="close-circle-outline" size={16} color={colors.error} />
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.approveBtn]} onPress={onApprove}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.approveText}>Approve Business</Text>
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  companyName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 15,
  },
  industryText: {
    ...typography.captionBold,
    color: colors.accent.teal,
    marginTop: 1,
  },
  metaBox: {
    marginVertical: spacing.xs,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginVertical: 1,
  },
  notesBox: {
    backgroundColor: colors.warning.soft,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.caption,
    color: colors.warning.text,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: colors.danger.soft,
    borderWidth: 1,
    borderColor: colors.danger.border,
  },
  rejectText: {
    ...typography.captionBold,
    color: colors.error,
  },
  approveBtn: {
    flex: 1.6,
    backgroundColor: colors.success.DEFAULT,
  },
  approveText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
});
