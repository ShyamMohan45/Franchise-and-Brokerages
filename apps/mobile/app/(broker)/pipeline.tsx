import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import {
  Header,
  Input,
  EmptyState,
  DealCard,
  UpdateStageModal,
  RoleGuard,
} from '../../src/components';
import { useDeals } from '../../src/hooks/useDeals';
import { BrokerageDeal, DealStage } from '../../src/types/crm';

const PIPELINE_STAGES: { label: string; value: string }[] = [
  { label: 'All Deals', value: 'ALL' },
  { label: '1. New Enquiry', value: 'NEW_ENQUIRY' },
  { label: '2. Contacted', value: 'INITIAL_CONTACT' },
  { label: '3. Qualification', value: 'QUALIFICATION' },
  { label: '4. Matching', value: 'BRAND_MATCHING' },
  { label: '5. Meeting', value: 'MEETING_SCHEDULED' },
  { label: '6. Negotiation', value: 'NEGOTIATION' },
  { label: '7. Due Diligence', value: 'DUE_DILIGENCE' },
  { label: '8. Agreement', value: 'AGREEMENT' },
  { label: '9. Closed Won', value: 'CLOSED_WON' },
  { label: '10. Lost', value: 'CLOSED_LOST' },
];

export default function BrokerPipelineScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState('ALL');

  // Modal stage update state
  const [selectedDeal, setSelectedDeal] = useState<BrokerageDeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    deals,
    totalPipelineValue,
    activeDealsCount,
    closedWonCount,
    loading,
    refreshing,
    refresh,
    setStage,
    setSearch,
    updateStage,
  } = useDeals({ initialStage: activeStage });

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setSearch(text);
  };

  const handleSelectStage = (stage: string) => {
    setActiveStage(stage);
    setStage(stage);
  };

  const handleDealPress = (deal: BrokerageDeal) => {
    router.push({
      pathname: '/(broker)/deal/[id]',
      params: { id: deal._id },
    } as any);
  };

  const handleOpenStageModal = (deal: BrokerageDeal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleConfirmStageUpdate = async (stage: DealStage, note?: string) => {
    if (!selectedDeal) return;
    try {
      await updateStage(selectedDeal._id, stage, note);
      setIsModalOpen(false);
      Alert.alert('Stage Updated', `Deal stage updated to ${stage.replace('_', ' ')}`);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update deal stage');
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Deal Pipeline"
          subtitle="10-Stage Deal Flow"
          showBack
          onBack={() => router.back()}
        />

        {/* Pipeline Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Deals</Text>
            <Text style={styles.summaryValue}>{activeDealsCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pipeline Value</Text>
            <Text style={[styles.summaryValue, { color: colors.accent.teal }]}>
              {formatCurrency(totalPipelineValue)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Closed Won</Text>
            <Text style={[styles.summaryValue, { color: colors.success.DEFAULT }]}>
              {closedWonCount}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search deals by franchise, investor..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            containerStyle={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Horizontal 10-Stage Filter */}
        <View style={styles.stagesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stagesScroll}
          >
            {PIPELINE_STAGES.map((s) => {
              const isSelected = activeStage === s.value;
              return (
                <Pressable
                  key={s.value}
                  style={[styles.stageChip, isSelected && styles.stageChipActive]}
                  onPress={() => handleSelectStage(s.value)}
                >
                  <Text
                    style={[
                      styles.stageChipText,
                      isSelected && styles.stageChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Deals List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
            <Text style={styles.loadingText}>Loading deals pipeline...</Text>
          </View>
        ) : (
          <FlatList
            data={deals}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DealCard
                deal={item}
                onPress={() => handleDealPress(item)}
                onStageChange={() => handleOpenStageModal(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.accent.gold}
                colors={[colors.accent.gold]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="git-network-outline"
                title="No Deals In Stage"
                description={
                  searchQuery
                    ? `No deals matched "${searchQuery}".`
                    : 'There are currently no deals in this pipeline stage.'
                }
                actionLabel="View All Deals"
                onAction={() => {
                  setSearchQuery('');
                  handleSelectStage('ALL');
                }}
              />
            }
          />
        )}

        {/* Update Stage Modal */}
        {selectedDeal && (
          <UpdateStageModal
            visible={isModalOpen}
            currentStage={selectedDeal.stage}
            dealTitle={selectedDeal.dealTitle || selectedDeal.franchiseListing?.brandName || 'Deal'}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmStageUpdate}
          />
        )}
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 16,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  stagesWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stagesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  stageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  stageChipText: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  stageChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});
