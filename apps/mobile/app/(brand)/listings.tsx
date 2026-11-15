import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Header, Card, Badge, Button, EmptyState, RoleGuard } from '../../src/components';
import { FranchiseService } from '../../src/services/franchiseService';
import { FranchiseListing } from '../../src/types/franchise';
import { formatCurrencyINR } from '../../src/components/marketplace';

export default function BrandListingsScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<FranchiseListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchListings = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await FranchiseService.getMyFranchises();
      setListings(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load brand listings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSubmitForReview = async (id: string) => {
    setActionLoadingId(id);
    try {
      await FranchiseService.submitFranchise(id);
      Alert.alert('Submitted', 'Your franchise listing has been submitted for admin review.');
      fetchListings(true);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not submit listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoadingId(id);
    try {
      await FranchiseService.publishFranchise(id);
      Alert.alert('Published', 'Your franchise opportunity is now live in the investor marketplace!');
      fetchListings(true);
    } catch (err: any) {
      Alert.alert('Publish Error', err.message || 'Could not publish listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'PUBLISHED':
        return <Badge label="PUBLISHED" variant="success" size="sm" />;
      case 'APPROVED':
        return <Badge label="APPROVED" variant="primary" size="sm" />;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Badge label="IN REVIEW" variant="warning" size="sm" />;
      case 'REJECTED':
        return <Badge label="REJECTED" variant="danger" size="sm" />;
      case 'DRAFT':
      default:
        return <Badge label="DRAFT" variant="neutral" size="sm" />;
    }
  };

  const renderListingCard = ({ item }: { item: FranchiseListing }) => {
    const isActionLoading = actionLoadingId === item._id;
    const s = item.status.toUpperCase();

    return (
      <Card style={styles.card} padding="md">
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {item.brandName}
            </Text>
            <Text style={styles.opportunityTitle} numberOfLines={1}>
              {item.opportunityTitle || item.tagline}
            </Text>
          </View>
          {getStatusBadge(item.status)}
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsBox}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>INVESTMENT</Text>
            <Text style={styles.metricVal}>
              {formatCurrencyINR(item.totalInvestmentMin)} - {formatCurrencyINR(item.totalInvestmentMax)}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>ENQUIRIES</Text>
            <Text style={styles.metricVal}>{item.enquiriesCount || 0} leads</Text>
          </View>
        </View>

        {/* Rejection / Correction Notices if any */}
        {item.rejectionReason && (
          <View style={styles.rejectionNotice}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.rejectionText}>
              Review Feedback: {item.rejectionReason}
            </Text>
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <Button
            title="Edit Details"
            onPress={() => router.push(`/(brand)/edit-listing/${item._id}`)}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />

          {s === 'DRAFT' && (
            <Button
              title="Submit for Review"
              onPress={() => handleSubmitForReview(item._id)}
              loading={isActionLoading}
              variant="primary"
              size="sm"
              style={{ flex: 1.3 }}
            />
          )}

          {s === 'APPROVED' && (
            <Button
              title="Publish to Market"
              onPress={() => handlePublish(item._id)}
              loading={isActionLoading}
              variant="primary"
              size="sm"
              style={{ flex: 1.3 }}
            />
          )}

          {s === 'PUBLISHED' && (
            <Button
              title="View Public Card"
              onPress={() => router.push(`/(investor)/franchise/${item._id}`)}
              variant="secondary"
              size="sm"
              style={{ flex: 1.3 }}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Franchise Listings"
          subtitle="Manage Brand Opportunities"
          showBack
          onBack={() => router.replace('/(brand)/dashboard')}
          rightAction={
            <Button
              title="+ New"
              onPress={() => router.push('/(brand)/create-listing')}
              variant="primary"
              size="sm"
            />
          }
        />

        {isLoading && !isRefreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading brand listings...</Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(item) => item._id}
            renderItem={renderListingCard}
            ListEmptyComponent={
              <EmptyState
                title="No Franchise Listings"
                description="You haven't listed any franchise opportunities yet. Create your first opportunity to receive vetted investor inquiries."
                actionLabel="Create Opportunity Listing"
                onAction={() => router.push('/(brand)/create-listing')}
                icon="storefront"
              />
            }
            contentContainerStyle={styles.listContent}
            refreshing={isRefreshing}
            onRefresh={() => fetchListings(true)}
            showsVerticalScrollIndicator={false}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.slate[500],
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  brandTitle: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  opportunityTitle: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 1,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  metricCol: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.slate[200],
    marginHorizontal: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.slate[400],
    marginBottom: 2,
  },
  metricVal: {
    ...typography.captionBold,
    color: colors.navy[900],
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  rejectionText: {
    ...typography.caption,
    color: colors.error,
    fontSize: 11,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
