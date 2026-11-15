import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import { FranchiseListing } from '../../types/franchise';
import { CreateEnquiryPayload } from '../../types/enquiry';
import { EnquiryService } from '../../services/enquiryService';

interface EnquiryModalProps {
  visible: boolean;
  listing: FranchiseListing;
  onClose: () => void;
  onSuccess: (referenceNumber: string) => void;
}

const TIMELINES = [
  'Immediate (0-3 months)',
  '3 - 6 months',
  '6 - 12 months',
  'Exploring for next fiscal year',
];

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  visible,
  listing,
  onClose,
  onSuccess,
}) => {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [units, setUnits] = useState('1');
  const [budget, setBudget] = useState(String(listing.totalInvestmentMin || 2500000));
  const [liquidCapital, setLiquidCapital] = useState(String(listing.initialFranchiseFee || 1000000));
  const [timeline, setTimeline] = useState(TIMELINES[0]);
  const [background, setBackground] = useState('Experienced Retail / Business Investor');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!city.trim()) {
      errs.city = 'Target city is required';
    } else if (city.trim().length < 2) {
      errs.city = 'City must be at least 2 characters';
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 1000) {
      errs.budget = 'Valid investment budget is required (min ₹1,000)';
    }

    const liquidNum = parseFloat(liquidCapital);
    if (isNaN(liquidNum) || liquidNum < 0) {
      errs.liquidCapital = 'Liquid capital cannot be negative';
    }

    if (!consent) {
      errs.consent = 'You must consent to sharing details with the brokerage team';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const payload: CreateEnquiryPayload = {
        franchiseId: listing._id,
        proposedLocationCity: city.trim(),
        proposedLocationState: state.trim() || undefined,
        unitsInterested: parseInt(units) || 1,
        investmentBudget: parseFloat(budget),
        availableLiquidCapital: parseFloat(liquidCapital),
        timeline,
        businessBackgroundSummary: background.trim() || 'Investor Profile',
        additionalMessage: message.trim() || undefined,
        privacyConsentGiven: true,
      };

      const application = await EnquiryService.submitEnquiry(payload);
      onSuccess(application.referenceNumber);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Submit Franchise Enquiry</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {listing.brandName} • {listing.opportunityTitle || 'Opportunity'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.navy[900]} />
            </Pressable>
          </View>

          {generalError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            <Card style={styles.infoBox} padding="sm">
              <Ionicons name="information-circle-outline" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.infoText}>
                Your verified contact credentials will be securely shared with FranchiseBridge brokerage and brand directors.
              </Text>
            </Card>

            <Input
              label="Proposed City *"
              placeholder="e.g. Bengaluru, Pune, Delhi"
              value={city}
              onChangeText={(val) => {
                setCity(val);
                if (errors.city) setErrors((p) => ({ ...p, city: '' }));
              }}
              error={errors.city}
              leftIcon={<Ionicons name="location-outline" size={18} color={colors.slate[400]} />}
            />

            <Input
              label="State / Region (Optional)"
              placeholder="e.g. Karnataka, Maharashtra"
              value={state}
              onChangeText={setState}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Investment Budget (₹) *"
                  placeholder="e.g. 3500000"
                  value={budget}
                  onChangeText={(val) => {
                    setBudget(val);
                    if (errors.budget) setErrors((p) => ({ ...p, budget: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.budget}
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Liquid Capital (₹) *"
                  placeholder="e.g. 2000000"
                  value={liquidCapital}
                  onChangeText={(val) => {
                    setLiquidCapital(val);
                    if (errors.liquidCapital) setErrors((p) => ({ ...p, liquidCapital: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.liquidCapital}
                />
              </View>
            </View>

            <Input
              label="Units Interested"
              placeholder="1"
              value={units}
              onChangeText={setUnits}
              keyboardType="number-pad"
            />

            {/* Timeline Picker */}
            <Text style={styles.inputLabel}>Target Investment Timeline</Text>
            <View style={styles.timelineRow}>
              {TIMELINES.map((t) => (
                <Pressable
                  key={t}
                  style={[
                    styles.timelineChip,
                    timeline === t && styles.timelineChipActive,
                  ]}
                  onPress={() => setTimeline(t)}
                >
                  <Text
                    style={[
                      styles.timelineText,
                      timeline === t && styles.timelineTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Business Background"
              placeholder="Brief summary of professional experience"
              value={background}
              onChangeText={setBackground}
              multiline
              numberOfLines={2}
            />

            <Input
              label="Additional Message to Brand (Optional)"
              placeholder="Specific questions about site selection, territory, etc."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
            />

            {/* Consent Checkbox */}
            <Pressable
              style={styles.consentRow}
              onPress={() => setConsent(!consent)}
            >
              <Ionicons
                name={consent ? 'checkbox' : 'square-outline'}
                size={22}
                color={consent ? colors.primary.DEFAULT : colors.slate[400]}
              />
              <Text style={styles.consentText}>
                I authorize FranchiseBridge to process this enquiry and share my profile with the franchisor for diligence review.
              </Text>
            </Pressable>
            {errors.consent && (
              <Text style={styles.consentError}>{errors.consent}</Text>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title="Submit Enquiry"
              onPress={handleSubmit}
              loading={isSubmitting}
              variant="primary"
              size="md"
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    maxHeight: '90%',
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
  subtitle: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.soft,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.primary.dark,
    flex: 1,
    lineHeight: 16,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  timelineChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.slate[50],
  },
  timelineChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  timelineText: {
    ...typography.caption,
    color: colors.slate[700],
  },
  timelineTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  consentText: {
    ...typography.caption,
    color: colors.slate[600],
    flex: 1,
    lineHeight: 18,
  },
  consentError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
});
