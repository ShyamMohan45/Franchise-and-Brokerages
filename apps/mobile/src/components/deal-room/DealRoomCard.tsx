import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { DealRoom, DealRoomStage } from '../../types/dealRoom';

interface DealRoomCardProps {
  room: DealRoom;
  onPress: () => void;
}

export const DealRoomCard: React.FC<DealRoomCardProps> = ({ room, onPress }) => {
  const getStageBadge = (stage: DealRoomStage) => {
    switch (stage) {
      case 'deal_finalized':
      case 'CLOSED_WON':
        return <Badge label="DEAL FINALIZED" variant="success" size="sm" />;
      case 'out_for_signature':
      case 'AGREEMENT':
        return <Badge label="OUT FOR SIGNATURE" variant="gold" size="sm" />;
      case 'agreement_drafting':
      case 'NEGOTIATION':
        return <Badge label="AGREEMENT DRAFTING" variant="primary" size="sm" />;
      case 'fdd_and_sop_disclosure':
      case 'territory_and_financials':
      case 'DUE_DILIGENCE':
        return <Badge label="DUE DILIGENCE" variant="teal" size="sm" />;
      case 'cancelled':
      case 'CLOSED_LOST':
        return <Badge label="CANCELLED" variant="danger" size="sm" />;
      default:
        return <Badge label={stage.replace(/_/g, ' ').toUpperCase()} variant="info" size="sm" />;
    }
  };

  const completionPct = room.completionPercentage || 0;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Card style={styles.card} padding="lg">
        {/* Top Header */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.iconBox}>
              <Ionicons name="business-outline" size={20} color={colors.accent.teal} />
            </View>
            <View style={styles.brandDetails}>
              <Text style={styles.roomName} numberOfLines={1}>
                {room.roomName || 'Franchise Deal Room'}
              </Text>
              <Text style={styles.brandName} numberOfLines={1}>
                {room.franchiseListing?.brandName || 'Brand Expansion Workspace'}
              </Text>
            </View>
          </View>
          {getStageBadge(room.stage)}
        </View>

        {/* Territory & Workspace Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.text.muted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {room.targetTerritory || 'Prime Metro Territory'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color={colors.text.muted} />
            <Text style={styles.metaText}>
              {room.documentsCount !== undefined ? `${room.documentsCount} Docs` : 'Private Vault'}
            </Text>
          </View>
        </View>

        {/* Due Diligence Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Due Diligence Completion</Text>
            <Text style={styles.progressValue}>{completionPct}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, completionPct))}%` },
                completionPct === 100 && { backgroundColor: colors.success.DEFAULT },
              ]}
            />
          </View>
        </View>

        {/* Participants Summary */}
        <View style={styles.participantsRow}>
          <View style={styles.participant}>
            <Text style={styles.participantRole}>Investor</Text>
            <Text style={styles.participantName} numberOfLines={1}>
              {room.investor?.fullName || 'Assigned Investor'}
            </Text>
          </View>
          <View style={styles.participantDivider} />
          <View style={styles.participant}>
            <Text style={styles.participantRole}>Broker</Text>
            <Text style={styles.participantName} numberOfLines={1}>
              {(room.assignedBroker || room.broker)?.fullName || 'Assigned Broker'}
            </Text>
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
    borderLeftColor: colors.accent.teal,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(21, 157, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  brandDetails: {
    flex: 1,
  },
  roomName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  brandName: {
    ...typography.captionBold,
    color: colors.accent.teal,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  progressValue: {
    ...typography.captionBold,
    color: colors.text.primary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.slate[200],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent.teal,
  },
  participantsRow: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  participant: {
    flex: 1,
  },
  participantRole: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  participantName: {
    ...typography.captionBold,
    color: colors.text.primary,
    marginTop: 1,
  },
  participantDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
