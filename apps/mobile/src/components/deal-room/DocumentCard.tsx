import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { DealDocument, DealDocumentStatus } from '../../types/dealRoom';

interface DocumentCardProps {
  document: DealDocument;
  onDownload: () => void;
  onUploadVersion?: () => void;
  onUpdateStatus?: () => void;
  onDelete?: () => void;
  isDownloading?: boolean;
  canReview?: boolean;
  canDelete?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onUploadVersion,
  onUpdateStatus,
  onDelete,
  isDownloading = false,
  canReview = false,
  canDelete = false,
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getStatusBadge = (status: DealDocumentStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge label="APPROVED" variant="success" size="sm" />;
      case 'UNDER_REVIEW':
        return <Badge label="UNDER REVIEW" variant="gold" size="sm" />;
      case 'SUBMITTED':
        return <Badge label="SUBMITTED" variant="info" size="sm" />;
      case 'REJECTED':
        return <Badge label="REJECTED" variant="danger" size="sm" />;
      default:
        return <Badge label={status} variant="neutral" size="sm" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ');
  };

  return (
    <Card style={styles.card} padding="md">
      {/* Header Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.badgeGroup}>
          <Badge label={getCategoryLabel(document.category)} variant="primary" size="sm" />
          <Badge label={`v${document.currentVersion || 1}`} variant="neutral" size="sm" />
          {document.isInternalOnly && (
            <Badge label="INTERNAL ONLY" variant="danger" size="sm" />
          )}
        </View>
        {getStatusBadge(document.status)}
      </View>

      {/* Title & File Name */}
      <View style={styles.titleRow}>
        <Ionicons name="document-attach-outline" size={24} color={colors.primary.DEFAULT} style={styles.docIcon} />
        <View style={styles.titleContent}>
          <Text style={styles.docTitle} numberOfLines={2}>
            {document.title}
          </Text>
          <Text style={styles.fileName} numberOfLines={1}>
            {document.fileName}
          </Text>
        </View>
      </View>

      {/* Meta info: Uploader, Date, Size */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {formatFileSize(document.fileSize)} • Uploaded {new Date(document.uploadedAt || document.createdAt).toLocaleDateString()}
        </Text>
        {document.uploadedBy?.fullName && (
          <Text style={styles.uploaderText} numberOfLines={1}>
            By: {document.uploadedBy.fullName}
          </Text>
        )}
      </View>

      {/* Reviewer Notes if present */}
      {document.reviewerNotes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Broker Review Notes:</Text>
          <Text style={styles.notesText}>{document.reviewerNotes}</Text>
        </View>
      )}

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, styles.downloadBtn]}
          onPress={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Secure Download</Text>
            </>
          )}
        </Pressable>

        {onUploadVersion && (
          <Pressable style={styles.iconBtn} onPress={onUploadVersion} hitSlop={6}>
            <Ionicons name="git-branch-outline" size={18} color={colors.primary.DEFAULT} />
          </Pressable>
        )}

        {canReview && onUpdateStatus && (
          <Pressable style={styles.iconBtn} onPress={onUpdateStatus} hitSlop={6}>
            <Ionicons name="checkmark-done-circle-outline" size={18} color={colors.accent.teal} />
          </Pressable>
        )}

        {canDelete && onDelete && (
          <Pressable style={styles.iconBtn} onPress={onDelete} hitSlop={6}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  docIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  titleContent: {
    flex: 1,
  },
  docTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  fileName: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  uploaderText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    maxWidth: '40%',
  },
  notesBox: {
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
  },
  notesLabel: {
    ...typography.captionBold,
    color: colors.accent.goldDark,
    fontSize: 11,
    marginBottom: 2,
  },
  notesText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  downloadBtn: {
    backgroundColor: colors.primary.DEFAULT,
    flex: 1,
  },
  downloadBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
