import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { PendingApprovalCard } from '../../src/components/admin/PendingApprovalCard';
import { AdminService } from '../../src/services/adminService';
import { AdminBusinessItem } from '../../src/types/admin';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

export default function AdminApprovalsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'businesses' | 'franchises'>('businesses');
  const [businesses, setBusinesses] = useState<AdminBusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQueue = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await AdminService.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load approval queue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleApproveBusiness = (item: AdminBusinessItem) => {
    Alert.alert(
      'Approve Verification',
      `Are you sure you want to approve "${item.companyName || item.brandName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              const updated = await AdminService.updateBusinessStatus(
                item._id,
                'approved',
                'Verified and approved by platform administration'
              );
              setBusinesses((prev) =>
                prev.map((b) => (b._id === item._id ? updated : b))
              );
              Alert.alert('Success', 'Business approved successfully');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not approve business');
            }
          },
        },
      ]
    );
  };

  const handleRejectBusiness = (item: AdminBusinessItem) => {
    Alert.alert(
      'Reject Verification',
      `Are you sure you want to reject "${item.companyName || item.brandName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = await AdminService.updateBusinessStatus(
                item._id,
                'rejected',
                'Documents or verification details do not satisfy platform requirements'
              );
              setBusinesses((prev) =>
                prev.map((b) => (b._id === item._id ? updated : b))
              );
              Alert.alert('Rejected', 'Business application marked as rejected');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not reject business');
            }
          },
        },
      ]
    );
  };

  // Filter pending items
  const pendingItems = businesses.filter(
    (b) => b.approvalStatus === 'under_review' || b.approvalStatus === 'action_required'
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Approvals & Compliance"
        subtitle={`${pendingItems.length} awaiting review`}
        showBack
        onBack={() => router.back()}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'businesses' && styles.tabActive]}
          onPress={() => setActiveTab('businesses')}
        >
          <Text
            style={[styles.tabText, activeTab === 'businesses' && styles.tabTextActive]}
          >
            Brand Businesses ({pendingItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'franchises' && styles.tabActive]}
          onPress={() => setActiveTab('franchises')}
        >
          <Text
            style={[styles.tabText, activeTab === 'franchises' && styles.tabTextActive]}
          >
            All Registered ({businesses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && !isRefreshing ? (
        <LoadingOverlay visible={true} message="Loading approval queue..." />
      ) : (
        <FlatList
          data={activeTab === 'businesses' ? pendingItems : businesses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PendingApprovalCard
              business={item}
              onApprove={() => handleApproveBusiness(item)}
              onReject={() => handleRejectBusiness(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchQueue(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Queue Clear"
              description="No applications are currently pending your administrative review."
              actionLabel="Refresh"
              onAction={() => fetchQueue(true)}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.DEFAULT,
  },
  tabText: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary.DEFAULT,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
