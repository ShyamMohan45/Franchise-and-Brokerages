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
import { FranchiseFilters } from '../../types/franchise';

interface FilterModalProps {
  visible: boolean;
  filters: FranchiseFilters;
  onClose: () => void;
  onApply: (appliedFilters: Partial<FranchiseFilters>) => void;
  onReset: () => void;
}

const INDUSTRIES = [
  'All',
  'Food & Beverage',
  'Retail',
  'Healthcare',
  'Education',
  'Fitness & Wellness',
  'Automotive',
  'B2B Services',
];

const SORT_OPTIONS: Array<{ label: string; value: FranchiseFilters['sort'] }> = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Investment: Low to High', value: 'investment_asc' },
  { label: 'Investment: High to Low', value: 'investment_desc' },
  { label: 'Most Popular', value: 'popular' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [industry, setIndustry] = useState(filters.industry || 'All');
  const [minInvestment, setMinInvestment] = useState(
    filters.minInvestment ? String(filters.minInvestment) : ''
  );
  const [maxInvestment, setMaxInvestment] = useState(
    filters.maxInvestment ? String(filters.maxInvestment) : ''
  );
  const [sort, setSort] = useState<FranchiseFilters['sort']>(filters.sort || 'recent');

  const handleApply = () => {
    onApply({
      industry: industry === 'All' ? undefined : industry,
      minInvestment: minInvestment ? parseFloat(minInvestment) : undefined,
      maxInvestment: maxInvestment ? parseFloat(maxInvestment) : undefined,
      sort,
    });
    onClose();
  };

  const handleReset = () => {
    setIndustry('All');
    setMinInvestment('');
    setMaxInvestment('');
    setSort('recent');
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Marketplace</Text>
              <Text style={styles.subtitle}>Refine franchise opportunities</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.navy[900]} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Sort Order */}
            <Text style={styles.sectionTitle}>Sort Opportunities</Text>
            <View style={styles.chipsWrap}>
              {SORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.chip,
                    sort === opt.value && styles.chipActive,
                  ]}
                  onPress={() => setSort(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      sort === opt.value && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Industry Filter */}
            <Text style={styles.sectionTitle}>Industry Sector</Text>
            <View style={styles.chipsWrap}>
              {INDUSTRIES.map((ind) => (
                <Pressable
                  key={ind}
                  style={[
                    styles.chip,
                    industry === ind && styles.chipActive,
                  ]}
                  onPress={() => setIndustry(ind)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      industry === ind && styles.chipTextActive,
                    ]}
                  >
                    {ind}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Investment Range */}
            <Text style={styles.sectionTitle}>Investment Budget (₹)</Text>
            <View style={styles.investmentRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Min Investment (₹)"
                  placeholder="e.g. 1000000"
                  value={minInvestment}
                  onChangeText={setMinInvestment}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Max Investment (₹)"
                  placeholder="e.g. 5000000"
                  value={maxInvestment}
                  onChangeText={setMaxInvestment}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <Button
              title="Reset All"
              onPress={handleReset}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollArea: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.navy[900],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.slate[50],
  },
  chipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.slate[700],
  },
  chipTextActive: {
    color: colors.white,
  },
  investmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
});
