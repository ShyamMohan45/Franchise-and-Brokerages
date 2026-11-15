import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import {
  Header,
  FranchiseCard,
  FilterModal,
  EmptyState,
  RoleGuard,
  Badge,
} from '../../src/components';
import { useFranchises } from '../../src/hooks/useFranchises';
import { useSavedFranchises } from '../../src/hooks/useSavedFranchises';
import { FranchiseListing } from '../../src/types/franchise';

const QUICK_CATEGORIES = [
  'All',
  'Food & Beverage',
  'Retail',
  'Healthcare',
  'Education',
  'Fitness & Wellness',
  'Automotive',
];

export default function InvestorMarketplaceScreen() {
  const router = useRouter();
  const {
    listings,
    meta,
    filters,
    isLoading,
    isRefreshing,
    error,
    updateFilters,
    refresh,
    loadMore,
  } = useFranchises({ limit: 10 });

  const { savedItems, toggleSave } = useSavedFranchises();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const savedIdSet = new Set(
    savedItems.map((item) => item.franchise?._id || item.franchise)
  );

  const activeFilterCount = [
    filters.industry && filters.industry !== 'All',
    filters.minInvestment !== undefined,
    filters.maxInvestment !== undefined,
    filters.sort && filters.sort !== 'recent',
  ].filter(Boolean).length;

  const handleCategoryPress = (category: string) => {
    updateFilters({ industry: category === 'All' ? undefined : category });
  };

  const handleSearchSubmit = () => {
    updateFilters({ search: searchInput.trim() || undefined });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: undefined });
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search & Filter Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.slate[400]} />
          <Pressable
            style={styles.searchPressArea}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.searchText,
                !searchInput && styles.searchPlaceholder,
              ]}
              numberOfLines={1}
            >
              {searchInput || 'Search by brand, concept, keyword...'}
            </Text>
          </Pressable>
          {searchInput ? (
            <Pressable onPress={handleClearSearch} hitSlop={6}>
              <Ionicons name="close-circle" size={18} color={colors.slate[400]} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setIsFilterModalOpen(true)}
          hitSlop={6}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFilterCount > 0 ? colors.white : colors.navy[900]}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Horizontal Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {QUICK_CATEGORIES.map((cat) => {
          const isSelected =
            (!filters.industry && cat === 'All') || filters.industry === cat;
          return (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results Header Count */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          {meta.total} verified franchise{meta.total === 1 ? '' : 's'} available
        </Text>
        {filters.sort && (
          <Text style={styles.sortIndicatorText}>
            Sorted: {filters.sort.replace('_', ' ')}
          </Text>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return <View style={{ height: spacing.xl }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
        <Text style={styles.loaderText}>Loading more franchises...</Text>
      </View>
    );
  };

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Marketplace"
          subtitle="Explore Franchise Investments"
          showBack
          onBack={() => router.replace('/(investor)/dashboard')}
          rightAction={
            <Pressable
              onPress={() => router.push('/(investor)/saved')}
              style={styles.savedShortcut}
              hitSlop={8}
            >
              <Ionicons name="heart" size={20} color={colors.danger.DEFAULT} />
              {savedItems.length > 0 && (
                <View style={styles.savedCountPill}>
                  <Text style={styles.savedCountText}>{savedItems.length}</Text>
                </View>
              )}
            </Pressable>
          }
        />

        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <FranchiseCard
              listing={item}
              onPress={() => router.push(`/(investor)/franchise/${item._id}`)}
              isSaved={savedIdSet.has(item._id)}
              onToggleSave={() => toggleSave(item._id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                title="No Franchises Found"
                description={
                  error ||
                  'No opportunities match your current filters. Try resetting search or categories.'
                }
                actionLabel="Reset Filters"
                onAction={() => updateFilters({ search: undefined, industry: undefined })}
                icon="search"
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />

        {/* Filter Modal */}
        <FilterModal
          visible={isFilterModalOpen}
          filters={filters}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(applied) => updateFilters(applied)}
          onReset={() => updateFilters({ industry: undefined, minInvestment: undefined, maxInvestment: undefined, sort: 'recent' })}
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
  savedShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  savedCountPill: {
    marginLeft: 3,
    backgroundColor: colors.danger.DEFAULT,
    borderRadius: borderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  savedCountText: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 10,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  listHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  searchPressArea: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  searchText: {
    ...typography.body,
    color: colors.navy[900],
  },
  searchPlaceholder: {
    color: colors.slate[400],
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent.gold,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.captionBold,
    color: colors.navy[900],
    fontSize: 10,
  },
  categoryScroll: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  categoryChipActive: {
    backgroundColor: colors.navy[900],
    borderColor: colors.navy[900],
  },
  categoryChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.slate[600],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultsCountText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.slate[500],
  },
  sortIndicatorText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary.DEFAULT,
    textTransform: 'capitalize',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  loaderText: {
    ...typography.caption,
    color: colors.slate[500],
  },
});
