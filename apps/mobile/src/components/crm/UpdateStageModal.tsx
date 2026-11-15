import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { DealStage } from '../../types/crm';

export interface UpdateStageModalProps {
  visible: boolean;
  currentStage: DealStage;
  dealTitle: string;
  onClose: () => void;
  onConfirm?: (newStage: DealStage, note?: string) => Promise<void>;
  onUpdateStage?: (newStage: DealStage, note?: string) => Promise<void>;
}

const STAGES: Array<{ stage: DealStage; label: string }> = [
  { stage: 'NEW_ENQUIRY', label: '1. New Enquiry' },
  { stage: 'INITIAL_CONTACT', label: '2. Initial Contact' },
  { stage: 'QUALIFICATION', label: '3. Qualification' },
  { stage: 'BRAND_MATCHING', label: '4. Brand Matching' },
  { stage: 'MEETING_SCHEDULED', label: '5. Meeting Scheduled' },
  { stage: 'NEGOTIATION', label: '6. Negotiation' },
  { stage: 'DUE_DILIGENCE', label: '7. Due Diligence' },
  { stage: 'AGREEMENT', label: '8. Agreement' },
  { stage: 'CLOSED_WON', label: '9. Closed Won (Signed)' },
  { stage: 'CLOSED_LOST', label: '10. Closed Lost' },
];

export const UpdateStageModal: React.FC<UpdateStageModalProps> = ({
  visible,
  currentStage,
  dealTitle,
  onClose,
  onConfirm,
  onUpdateStage,
}) => {
  const [selectedStage, setSelectedStage] = useState<DealStage>(currentStage);
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      if (onUpdateStage) {
        await onUpdateStage(selectedStage, note.trim() || undefined);
      } else if (onConfirm) {
        await onConfirm(selectedStage, note.trim() || undefined);
      }
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Update Deal Stage</Text>
              <Text style={styles.dealName} numberOfLines={1}>
                {dealTitle}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.navy[900]} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.sectionLabel}>Select Milestone Pipeline Stage:</Text>
            <View style={styles.stagesList}>
              {STAGES.map((s) => {
                const isSelected = selectedStage === s.stage;
                return (
                  <Pressable
                    key={s.stage}
                    style={[
                      styles.stageItem,
                      isSelected && styles.stageItemActive,
                    ]}
                    onPress={() => setSelectedStage(s.stage)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? colors.primary.DEFAULT : colors.slate[400]}
                    />
                    <Text
                      style={[
                        styles.stageText,
                        isSelected && styles.stageTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Transition Note (Optional)"
              placeholder="e.g. FDD signed, moving to territory discussion"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Cancel" onPress={onClose} variant="outline" size="md" style={{ flex: 1 }} />
            <Button
              title="Confirm Stage"
              onPress={handleUpdate}
              loading={isUpdating}
              variant="primary"
              size="md"
              style={{ flex: 1.5 }}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  title: {
    ...typography.h2,
    color: colors.navy[900],
  },
  dealName: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.slate[600],
    marginBottom: spacing.xs,
  },
  stagesList: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.slate[50],
    gap: spacing.sm,
  },
  stageItemActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.soft,
  },
  stageText: {
    ...typography.body,
    color: colors.slate[700],
    fontSize: 13,
  },
  stageTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
});
