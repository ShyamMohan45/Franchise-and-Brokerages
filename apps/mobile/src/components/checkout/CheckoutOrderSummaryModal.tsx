import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { SubscriptionPlanConfig } from '../../types/subscription';

interface BillingDetailsForm {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  gstin: string;
  billingAddress: string;
  city: string;
  state: string;
}

interface CheckoutOrderSummaryModalProps {
  visible: boolean;
  plan: SubscriptionPlanConfig | null;
  billingInterval: 'monthly' | 'yearly';
  initialUser?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isLoading?: boolean;
  onConfirm: (billingDetails: BillingDetailsForm) => void;
  onClose: () => void;
}

export const CheckoutOrderSummaryModal: React.FC<CheckoutOrderSummaryModalProps> = ({
  visible,
  plan,
  billingInterval,
  initialUser,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const { colors } = useTheme();

  const [form, setForm] = useState<BillingDetailsForm>({
    fullName: initialUser?.name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    companyName: '',
    gstin: '',
    billingAddress: '',
    city: '',
    state: '',
  });

  if (!visible || !plan) return null;

  const basePrice = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  const handleSubmit = () => {
    onConfirm(form);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text.primary }]}>Order Summary</Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                Review details before proceeding to payment
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isLoading} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Plan Tier Highlight */}
            <View style={[styles.planCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: colors.text.primary }]}>{plan.name} Tier</Text>
                  <Text style={[styles.planInterval, { color: colors.text.secondary }]}>
                    Billed {billingInterval === 'yearly' ? 'Annually (Save 20%)' : 'Monthly'}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Selected</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Price Breakdown */}
              <View style={styles.lineItem}>
                <Text style={[styles.lineLabel, { color: colors.text.secondary }]}>Base Subscription</Text>
                <Text style={[styles.lineValue, { color: colors.text.primary }]}>₹{basePrice.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={[styles.lineLabel, { color: colors.text.secondary }]}>GST (18% Statutory)</Text>
                <Text style={[styles.lineValue, { color: colors.text.primary }]}>₹{gstAmount.toLocaleString('en-IN')}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.lineItem}>
                <Text style={[styles.totalLabel, { color: colors.text.primary }]}>Total Payable</Text>
                <Text style={[styles.totalValue, { color: '#6366F1' }]}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Billing Details Form */}
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Billing Information</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Full Name / Legal Entity</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text.primary, borderColor: colors.border }]}
                value={form.fullName}
                onChangeText={(t) => setForm((prev) => ({ ...prev, fullName: t }))}
                placeholder="Business Owner Name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text.primary, borderColor: colors.border }]}
                value={form.email}
                onChangeText={(t) => setForm((prev) => ({ ...prev, email: t }))}
                placeholder="billing@company.com"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Mobile Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text.primary, borderColor: colors.border }]}
                value={form.phone}
                onChangeText={(t) => setForm((prev) => ({ ...prev, phone: t }))}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.text.secondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>GSTIN (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text.primary, borderColor: colors.border }]}
                value={form.gstin}
                onChangeText={(t) => setForm((prev) => ({ ...prev, gstin: t.toUpperCase() }))}
                placeholder="22AAAAA0000A1Z5"
                placeholderTextColor={colors.text.secondary}
                autoCapitalize="characters"
              />
            </View>

            {/* Security Guarantee Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityText}>
                Payments are secured by Razorpay 256-bit encryption. Official GST invoice will be generated upon confirmation.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.payButton, isLoading && styles.payButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.payButtonText}>
                    Proceed to Pay ₹{totalAmount.toLocaleString('en-IN')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    padding: 18,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  planInterval: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineLabel: {
    fontSize: 13,
  },
  lineValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 24,
  },
  securityText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
  },
  payButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
