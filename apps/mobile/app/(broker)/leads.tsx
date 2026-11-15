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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Header, Input, EmptyState, LeadCard, RoleGuard } from '../../src/components';
import { useLeads } from '../../src/hooks/useLeads';
import { Lead } from '../../src/types/crm';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Meeting', value: 'meeting_scheduled' },
  { label: 'Dropped', value: 'dropped' },
];

export default function BrokerLeadsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');

  const { leads, loading, refreshing, refresh, setSearch, setStatus } = useLeads({
    initialStatus: activeStatus,
  });

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setSearch(text);
  };

  const handleSelectStatus = (status: string) => {
    setActiveStatus(status);
    setStatus(status);
  };

  const handleLeadPress = (lead: Lead) => {
    router.push({
      pathname: '/(broker)/lead/[id]',
      params: { id: lead._id },
    } as any);
  };

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Lead Management"
          subtitle="Track & Qualify Brokerage Leads"
          showBack
          onBack={() => router.back()}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search leads by name, email, phone..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            containerStyle={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.text.muted} />}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {STATUS_FILTERS.map((f) => {
              const isSelected = activeStatus === f.value;
              return (
                <Pressable
                  key={f.value}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => handleSelectStatus(f.value)}
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

        {/* Leads List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
            <Text style={styles.loadingText}>Loading assigned leads...</Text>
          </View>
        ) : (
          <FlatList
            data={leads}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <LeadCard lead={item} onPress={() => handleLeadPress(item)} />
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
                icon="people-outline"
                title="No Leads Found"
                description={
                  searchQuery
                    ? `No leads matched "${searchQuery}". Try a different keyword.`
                    : 'There are currently no assigned leads in this status filter.'
                }
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  handleSelectStatus('ALL');
                }}
              />
            }
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
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
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
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
});
