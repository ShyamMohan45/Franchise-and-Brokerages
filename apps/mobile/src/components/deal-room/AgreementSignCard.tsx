import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { SignatureRequest, SignatureParticipant } from '../../types/dealRoom';

interface AgreementSignCardProps {
  signatureRequest: SignatureRequest;
  currentUserId: string;
  onSign: () => void;
  isSigning?: boolean;
}

export const AgreementSignCard: React.FC<AgreementSignCardProps> = ({
  signatureRequest,
  currentUserId,
  onSign,
  isSigning = false,
}) => {
  const isCompleted = signatureRequest.status === 'completed';
  const participants = signatureRequest.participants || [];

  const currentUserParticipant = participants.find(
    (p) => p.userId?.toString() === currentUserId
  );
  const hasUserSigned = currentUserParticipant?.status === 'signed';

  return (
    <Card style={styles.card} padding="lg">
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="document-text" size={24} color={colors.accent.gold} />
          <View>
            <Text style={styles.title}>
              {signatureRequest.documentTitle || 'Franchise Master Agreement'}
            </Text>
            <Text style={styles.subtitle}>E-Signature Execution Workflow</Text>
          </View>
        </View>
        <Badge
          label={isCompleted ? 'COMPLETED' : signatureRequest.status.replace(/_/g, ' ').toUpperCase()}
          variant={isCompleted ? 'success' : 'gold'}
          size="sm"
        />
      </View>

      {/* Participants Sign Status */}
      <Text style={styles.sectionHeading}>Signatory Parties ({participants.length}):</Text>

      <View style={styles.participantsList}>
        {participants.length === 0 ? (
          <Text style={styles.emptyText}>Signatories will be assigned upon document drafting.</Text>
        ) : (
          participants.map((p: SignatureParticipant, idx: number) => {
            const isSigned = p.status === 'signed';
            return (
              <View key={idx} style={styles.participantRow}>
                <View
                  style={[
                    styles.statusIcon,
                    isSigned ? styles.statusIconSigned : styles.statusIconPending,
                  ]}
                >
                  <Ionicons
                    name={isSigned ? 'checkmark' : 'time-outline'}
                    size={14}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{p.name}</Text>
                  <Text style={styles.participantRole}>
                    {p.role?.toUpperCase()} • {p.email}
                  </Text>
                  {isSigned && p.signedAt && (
                    <Text style={styles.signedDate}>
                      Signed on {new Date(p.signedAt).toLocaleDateString()} at{' '}
                      {new Date(p.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>

                <Badge
                  label={isSigned ? 'SIGNED' : 'PENDING'}
                  variant={isSigned ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>
            );
          })
        )}
      </View>

      {/* Action Button */}
      {!hasUserSigned && !isCompleted ? (
        <Button
          title="Sign Agreement Now"
          variant="primary"
          loading={isSigning}
          onPress={onSign}
          icon={<Ionicons name="pencil" size={16} color="#FFFFFF" />}
          style={styles.signButton}
        />
      ) : hasUserSigned ? (
        <View style={styles.signedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success.DEFAULT} />
          <Text style={styles.signedBadgeText}>You have digitally executed this agreement.</Text>
        </View>
      ) : null}

      {/* Legal disclaimer */}
      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
        <Text style={styles.disclaimerText}>
          E-signature captures cryptographic participant timestamp, IP address, and role consent.
          Final statutory execution requires formal counsel review.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sectionHeading: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  participantsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  statusIconSigned: {
    backgroundColor: colors.success.DEFAULT,
  },
  statusIconPending: {
    backgroundColor: colors.slate[400],
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 13,
  },
  participantRole: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  signedDate: {
    ...typography.caption,
    color: colors.success.text,
    fontSize: 10,
    marginTop: 1,
  },
  emptyText: {
    ...typography.caption,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  signButton: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success.soft,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  signedBadgeText: {
    ...typography.captionBold,
    color: colors.success.text,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
