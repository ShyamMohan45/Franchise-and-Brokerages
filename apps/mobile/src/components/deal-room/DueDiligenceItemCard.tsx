import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { DueDiligenceCategoryItem, DueDiligenceItemStatus } from '../../types/dealRoom';

interface DueDiligenceItemCardProps {
  item: DueDiligenceCategoryItem;
  onUpdateStatus?: () => void;
  canEdit?: boolean;
}

export const DueDiligenceItemCard: React.FC<DueDiligenceItemCardProps> = ({
  item,
  onUpdateStatus,
  canEdit = true,
}) => {
  const getStatusBadge = (status: DueDiligenceItemStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'verified':
        return <Badge label="APPROVED" variant="success" size="sm" />;
      case 'UNDER_REVIEW':
      case 'in_review':
        return <Badge label="UNDER REVIEW" variant="gold" size="sm" />;
      case 'SUBMITTED':
        return <Badge label="SUBMITTED" variant="info" size="sm" />;
      case 'NEEDS_CLARIFICATION':
      case 'flagged':
        return <Badge label="CLARIFICATION REQUIRED" variant="warning" size="sm" />;
      case 'REJECTED':
        return <Badge label="REJECTED" variant="danger" size="sm" />;
      default:
        return <Badge label="PENDING" variant="neutral" size="sm" />;
    }
  };

  const evidenceCount = item.evidenceDocuments?.length || 0;

  return (
    <Card style={styles.card} padding="md">
      {/* Category & Status */}
      <View style={styles.headerRow}>
        <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
        {getStatusBadge(item.status)}
      </View>

      {/* Title */}
      <Text style={styles.itemTitle}>{item.title}</Text>

      {/* Description */}
      {item.description ? (
        <Text style={styles.itemDesc}>{item.description}</Text>
      ) : null}

      {/* Clarification Request Alert Box if present */}
      {item.clarificationRequest ? (
        <View style={styles.clarificationBox}>
          <View style={styles.clarificationHeader}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning.text} />
            <Text style={styles.clarificationTitle}>Clarification Requested:</Text>
          </View>
          <Text style={styles.clarificationText}>{item.clarificationRequest}</Text>
        </View>
      ) : null}

      {/* Notes / Reviewer notes */}
      {item.notes ? (
        <View style={styles.notesRow}>
          <Text style={styles.notesLabel}>Notes: </Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      ) : null}

      {/* Bottom Footer: Evidence Count & Update Action */}
      <View style={styles.footerRow}>
        <View style={styles.evidenceBadge}>
          <Ionicons name="attach-outline" size={14} color={colors.text.muted} />
          <Text style={styles.evidenceText}>
            {evidenceCount > 0 ? `${evidenceCount} Evidence File(s)` : 'No files attached'}
          </Text>
        </View>

        {canEdit && onUpdateStatus && (
          <Pressable style={styles.editBtn} onPress={onUpdateStatus} hitSlop={8}>
            <Ionicons name="create-outline" size={14} color={colors.primary.DEFAULT} />
            <Text style={styles.editBtnText}>Update Check</Text>
          </Pressable>
        )}
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
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    ...typography.captionBold,
    color: colors.accent.teal,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  itemTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  clarificationBox: {
    backgroundColor: colors.warning.soft,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning.DEFAULT,
  },
  clarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  clarificationTitle: {
    ...typography.captionBold,
    color: colors.warning.text,
    fontSize: 11,
  },
  clarificationText: {
    ...typography.caption,
    color: colors.warning.text,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notesLabel: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  notesText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  evidenceText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  editBtnText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 12,
  },
});
