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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import {
  Header,
  EmptyState,
  RoleGuard,
  DueDiligenceItemCard,
  UpdateDiligenceModal,
} from '../../../src/components';
import { useDueDiligence } from '../../../src/hooks/useDueDiligence';
import { useAuth } from '../../../src/hooks/useAuth';
import { DueDiligenceCategoryItem } from '../../../src/types/dealRoom';

const STATUS_FILTERS = [
  { label: 'All Items', value: 'ALL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Clarification Needed', value: 'NEEDS_CLARIFICATION' },
  { label: 'Pending', value: 'PENDING' },
];

export default function DealRoomDueDiligenceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [selectedItem, setSelectedItem] = useState<DueDiligenceCategoryItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const {
    items,
    selectedStatus,
    setSelectedStatus,
    loading,
    refreshing,
    refresh,
    updateItem,
    approvedCount,
    pendingCount,
    flaggedCount,
    completionPercentage,
  } = useDueDiligence(id || '');

  const isBrokerOrAdmin =
    user?.role === 'broker' || user?.role === 'admin' || user?.role === 'super_admin';

  const handleOpenUpdateModal = (item: DueDiligenceCategoryItem) => {
    setSelectedItem(item);
    setIsUpdateModalOpen(true);
  };

  return (
    <RoleGuard
      allowedRoles={[
        'investor',
        'business_owner',
        'brand_owner',
        'broker',
        'admin',
        'super_admin',
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Due Diligence"
          subtitle="11 Statutory & Commercial Checks"
          showBack
          onBack={() => router.back()}
        />

        {/* Progress & Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent.teal }]}>
              {completionPercentage}%
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success.DEFAULT }]}>
              {approvedCount}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.slate[600] }]}>
              {pendingCount}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning.DEFAULT }]}>
              {flaggedCount}
            </Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {STATUS_FILTERS.map((f) => {
              const isSelected = selectedStatus === f.value;
              return (
                <Pressable
                  key={f.value}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedStatus(f.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Diligence Items List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.teal} />
            <Text style={styles.loadingText}>Loading due diligence checklist...</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.itemId}
            renderItem={({ item }) => (
              <DueDiligenceItemCard
                item={item}
                canEdit={true}
                onUpdateStatus={() => handleOpenUpdateModal(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.accent.teal}
                colors={[colors.accent.teal]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="checkbox-outline"
                title="No Checks In Status"
                description="There are currently no diligence checklist items matching this status filter."
                actionLabel="Show All Checks"
                onAction={() => setSelectedStatus('ALL')}
              />
            }
            ListFooterComponent={
              <View style={styles.disclaimerContainer}>
                <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
                <Text style={styles.disclaimerText}>
                  Due diligence verification marks administrative reviews conducted within the
                  brokerage portal. Uploads and status changes do not represent statutory legal
                  certifications or warranties.
                </Text>
              </View>
            }
          />
        )}

        {/* Update Diligence Modal */}
        <UpdateDiligenceModal
          visible={isUpdateModalOpen}
          item={selectedItem}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={updateItem}
          isInternalPrivileged={isBrokerOrAdmin}
        />
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  filtersWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent.teal,
    borderColor: colors.accent.teal,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  filterChipTextActive: {
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
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
