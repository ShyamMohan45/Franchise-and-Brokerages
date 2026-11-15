import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { DueDiligenceCategoryItem, DueDiligenceItemStatus } from '../../types/dealRoom';
import { UpdateDiligenceItemParams } from '../../services/dealRoomService';

interface UpdateDiligenceModalProps {
  visible: boolean;
  item: DueDiligenceCategoryItem | null;
  onClose: () => void;
  onUpdate: (itemId: string, params: UpdateDiligenceItemParams) => Promise<any>;
  isInternalPrivileged?: boolean;
}

const STATUS_OPTIONS: { label: string; value: DueDiligenceItemStatus; color: string }[] = [
  { label: 'Pending Review', value: 'PENDING', color: colors.slate[500] },
  { label: 'Under Review', value: 'UNDER_REVIEW', color: colors.accent.gold },
  { label: 'Approved & Verified', value: 'APPROVED', color: colors.success.DEFAULT },
  { label: 'Clarification Required', value: 'NEEDS_CLARIFICATION', color: colors.warning.DEFAULT },
  { label: 'Rejected / Flagged', value: 'REJECTED', color: colors.error },
];

export const UpdateDiligenceModal: React.FC<UpdateDiligenceModalProps> = ({
  visible,
  item,
  onClose,
  onUpdate,
  isInternalPrivileged = false,
}) => {
  if (!item) return null;

  const [status, setStatus] = useState<DueDiligenceItemStatus>(item.status || 'PENDING');
  const [notes, setNotes] = useState(item.notes || '');
  const [reviewerNotes, setReviewerNotes] = useState(item.reviewerNotes || '');
  const [clarificationRequest, setClarificationRequest] = useState(
    item.clarificationRequest || ''
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await onUpdate(item.itemId, {
        status,
        notes: notes.trim() || undefined,
        reviewerNotes: reviewerNotes.trim() || undefined,
        clarificationRequest: clarificationRequest.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update diligence item');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text.muted} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Status Selection */}
            <Text style={styles.fieldLabel}>Checklist Status *</Text>
            <View style={styles.statusList}>
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = status.toUpperCase() === opt.value.toUpperCase();
                // Non-privileged users (investors/brand) cannot approve or reject
                const isDisabled =
                  !isInternalPrivileged && (opt.value === 'APPROVED' || opt.value === 'REJECTED');

                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.statusOption,
                      isSelected && styles.statusOptionActive,
                      isDisabled && styles.statusOptionDisabled,
                    ]}
                    disabled={isDisabled}
                    onPress={() => setStatus(opt.value)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                    <Text
                      style={[
                        styles.statusOptionText,
                        isSelected && styles.statusOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary.DEFAULT} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Clarification Request */}
            <Input
              label="Action / Clarification Required"
              placeholder="Specify requirements or missing documentation..."
              value={clarificationRequest}
              onChangeText={setClarificationRequest}
              multiline
              numberOfLines={2}
            />

            {/* Notes */}
            <Input
              label="Audit Notes"
              placeholder="Add audit observations or compliance findings..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Reviewer Notes (for brokers / admins) */}
            {isInternalPrivileged && (
              <Input
                label="Internal Broker Audit Log"
                placeholder="Private broker notes..."
                value={reviewerNotes}
                onChangeText={setReviewerNotes}
                multiline
                numberOfLines={2}
              />
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.actionsRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              title="Save Status"
              variant="primary"
              loading={isUpdating}
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryLabel: {
    ...typography.captionBold,
    color: colors.accent.teal,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: 2,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statusList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOptionActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(49, 94, 251, 0.05)',
  },
  statusOptionDisabled: {
    opacity: 0.4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusOptionText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  statusOptionTextActive: {
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  actionsRow: {
    flexDirection: 'row',
  },
});
