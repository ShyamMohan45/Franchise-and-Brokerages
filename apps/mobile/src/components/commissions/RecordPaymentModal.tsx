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
import { RecordPaymentPayload } from '../../services/commissionService';
import { CommissionMilestone } from '../../types/commission';

interface RecordPaymentModalProps {
  visible: boolean;
  agreementId: string;
  milestones?: CommissionMilestone[];
  expectedBalance?: number;
  onClose: () => void;
  onRecord?: (payload: RecordPaymentPayload) => Promise<any>;
  onSubmit?: (payload: RecordPaymentPayload) => Promise<any>;
  submitting?: boolean;
}

const PAYMENT_METHODS = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque', 'Direct Transfer'];

export function RecordPaymentModal({
  visible,
  agreementId,
  milestones = [],
  expectedBalance,
  onClose,
  onRecord,
  onSubmit,
  submitting = false,
}: RecordPaymentModalProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('NEFT');
  const [payerName, setPayerName] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!paymentReference.trim()) {
      Alert.alert('Validation Error', 'Transaction / UTR reference number is required');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount in INR');
      return;
    }
    if (!payerName.trim()) {
      Alert.alert('Validation Error', 'Payer entity or name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const handler = onSubmit || onRecord;
      if (handler) {
        await handler({
          agreementId,
          paymentReference: paymentReference.trim(),
          amount: numAmount,
          paymentMethod,
          payerName: payerName.trim(),
          milestoneTitle: selectedMilestone || undefined,
          invoiceNumber: invoiceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      // Reset
      setPaymentReference('');
      setAmount('');
      setPayerName('');
      setNotes('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Record Commission Payment</Text>
              <Text style={styles.subtitle}>Verified Bank UTR / Receipt Entry</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text.muted} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Input
              label="Payment / UTR Reference *"
              placeholder="e.g. UTR8273641092837 or CHQ-9281"
              value={paymentReference}
              onChangeText={setPaymentReference}
            />

            <Input
              label="Amount in INR (₹) *"
              placeholder="e.g. 500000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <Input
              label="Payer Entity / Name *"
              placeholder="e.g. Organic Greens Hospitality Pvt Ltd"
              value={payerName}
              onChangeText={setPayerName}
            />

            {/* Payment Method Selector */}
            <Text style={styles.fieldLabel}>Payment Method *</Text>
            <View style={styles.methodGrid}>
              {PAYMENT_METHODS.map((m) => {
                const isSelected = paymentMethod === m;
                return (
                  <Pressable
                    key={m}
                    style={[styles.methodChip, isSelected && styles.methodChipActive]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.methodChipText,
                        isSelected && styles.methodChipTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Milestone Allocation if available */}
            {milestones.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Milestone Allocation (Optional)</Text>
                <View style={styles.milestoneGrid}>
                  {milestones.map((ms) => {
                    const isSelected = selectedMilestone === ms.title;
                    return (
                      <Pressable
                        key={ms.title}
                        style={[styles.msChip, isSelected && styles.msChipActive]}
                        onPress={() => setSelectedMilestone(isSelected ? '' : ms.title)}
                      >
                        <Text
                          style={[styles.msChipText, isSelected && styles.msChipTextActive]}
                          numberOfLines={1}
                        >
                          {ms.title} (₹{ms.amount.toLocaleString('en-IN')})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <Input
              label="Tax Invoice Number (Optional)"
              placeholder="e.g. INV-2026-081"
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
            />

            <Input
              label="Audit Notes (Optional)"
              placeholder="Bank branch, clearing confirmation, remarks..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
              <Text style={styles.disclaimerText}>
                Recorded offline payment vouchers are submitted for administrative reconciliation.
                This acknowledges receipt of payment details and does not constitute an automated banking settlement.
              </Text>
            </View>
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
              title="Record Payment"
              variant="primary"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  methodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  methodChipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  methodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  milestoneGrid: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  msChip: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.border,
  },
  msChipActive: {
    borderColor: colors.accent.teal,
    backgroundColor: 'rgba(21, 157, 139, 0.08)',
  },
  msChipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  msChipTextActive: {
    fontWeight: '700',
    color: colors.accent.teal,
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
  },
});
