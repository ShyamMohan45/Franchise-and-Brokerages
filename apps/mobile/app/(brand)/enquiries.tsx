import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Header, Card, Badge, EmptyState, RoleGuard } from '../../src/components';
import { useEnquiries } from '../../src/hooks/useEnquiries';
import { formatCurrencyINR } from '../../src/components/marketplace';
import { FranchiseApplication } from '../../src/types/enquiry';

export default function BrandEnquiriesScreen() {
  const router = useRouter();
  const { enquiries, isLoading, isRefreshing, error, refresh } = useEnquiries('brand');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
      case 'SUBMITTED':
        return 'primary';
      case 'QUALIFIED':
      case 'APPROVED_FOR_DEAL':
      case 'CONVERTED':
        return 'success';
      case 'IN_PROGRESS':
      case 'IN_DISCUSSION':
      case 'UNDER_REVIEW':
        return 'warning';
      case 'REJECTED':
      case 'CLOSED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const renderEnquiryCard = ({ item }: { item: FranchiseApplication }) => {
    const investorName =
      typeof item.investorUser === 'object' && item.investorUser?.fullName
        ? item.investorUser.fullName
        : 'Qualified Investor';

    return (
      <Card style={styles.card} padding="md">
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.investorName}>{investorName}</Text>
            <Text style={styles.brandTitle}>
              For: {item.brandName || (typeof item.franchise === 'object' ? item.franchise?.brandName : 'Franchise')}
            </Text>
            <Text style={styles.refNumber}>{item.referenceNumber}</Text>
          </View>
          <Badge
            label={item.status.replace('_', ' ').toUpperCase()}
            variant={getStatusBadgeVariant(item.status)}
            size="sm"
          />
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target City:</Text>
            <Text style={styles.detailValue}>
              {item.proposedLocationCity}
              {item.proposedLocationState ? `, ${item.proposedLocationState}` : ''}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Units Interested:</Text>
            <Text style={styles.detailValue}>{item.unitsInterested} unit(s)</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Declared Budget:</Text>
            <Text style={styles.detailHighlight}>
              {formatCurrencyINR(item.investmentBudget)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Liquid Capital:</Text>
            <Text style={styles.detailValue}>
              {formatCurrencyINR(item.availableLiquidCapital)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Received Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {item.additionalMessage ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Investor Note:</Text>
            <Text style={styles.messageText}>{item.additionalMessage}</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Received Inquiries"
          subtitle="Investor Pipeline"
          showBack
          onBack={() => router.back()}
        />

        {isLoading && !isRefreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading received inquiries...</Text>
          </View>
        ) : (
          <FlatList
            data={enquiries}
            keyExtractor={(item) => item._id}
            renderItem={renderEnquiryCard}
            ListEmptyComponent={
              <EmptyState
                title="No Inquiries Yet"
                description={
                  error ||
                  'Your brand has not received any investor inquiries yet. Ensure your franchise opportunities are published to the marketplace.'
                }
                actionLabel="View Franchise Listings"
                onAction={() => router.replace('/(brand)/listings')}
                icon="mail-unread"
              />
            }
            contentContainerStyle={styles.listContent}
            refreshing={isRefreshing}
            onRefresh={refresh}
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
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  investorName: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  brandTitle: {
    ...typography.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    marginTop: 1,
  },
  refNumber: {
    ...typography.caption,
    fontSize: 11,
    color: colors.slate[400],
    marginTop: 1,
  },
  detailsBox: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.slate[500],
  },
  detailValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.navy[900],
  },
  detailHighlight: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
  },
  messageBox: {
    marginTop: spacing.xs,
    padding: spacing.xs + 2,
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.sm,
  },
  messageLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate[500],
    textTransform: 'uppercase',
  },
  messageText: {
    ...typography.caption,
    color: colors.slate[700],
    marginTop: 2,
  },
});
