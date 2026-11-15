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

export default function InvestorEnquiriesScreen() {
  const router = useRouter();
  const { enquiries, isLoading, isRefreshing, error, refresh } = useEnquiries('investor');

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

  const renderEnquiryCard = ({ item }: { item: FranchiseApplication }) => (
    <Card style={styles.card} padding="md">
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>{item.brandName}</Text>
          <Text style={styles.refNumber}>{item.referenceNumber}</Text>
        </View>
        <Badge
          label={item.status.replace('_', ' ').toUpperCase()}
          variant={getStatusBadgeVariant(item.status)}
          size="sm"
        />
      </View>

      {/* Details Grid */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Target Location:</Text>
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
          <Text style={styles.detailLabel}>Investment Budget:</Text>
          <Text style={styles.detailHighlight}>
            {formatCurrencyINR(item.investmentBudget)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Submitted On:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Broker Assignment status */}
      {item.assignedBroker ? (
        <View style={styles.brokerBox}>
          <Ionicons name="person-circle" size={18} color={colors.primary.DEFAULT} />
          <Text style={styles.brokerText}>
            Assigned Broker: <Text style={{ fontWeight: '600' }}>{item.assignedBroker.fullName}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.brokerPendingBox}>
          <Ionicons name="time-outline" size={16} color={colors.slate[400]} />
          <Text style={styles.brokerPendingText}>Broker Assignment in progress</Text>
        </View>
      )}
    </Card>
  );

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="My Enquiries"
          subtitle="Application History & Pipeline"
          showBack
          onBack={() => router.back()}
        />

        {isLoading && !isRefreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading submitted enquiries...</Text>
          </View>
        ) : (
          <FlatList
            data={enquiries}
            keyExtractor={(item) => item._id}
            renderItem={renderEnquiryCard}
            ListEmptyComponent={
              <EmptyState
                title="No Enquiries Submitted"
                description={
                  error ||
                  'You have not submitted enquiries for any franchise brands yet. Browse the marketplace to apply.'
                }
                actionLabel="Browse Marketplace"
                onAction={() => router.push('/(investor)/marketplace')}
                icon="document-text"
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
  brandTitle: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  refNumber: {
    ...typography.caption,
    fontSize: 11,
    color: colors.slate[400],
    marginTop: 1,
  },
  detailsBox: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
  brokerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.soft,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  brokerText: {
    ...typography.caption,
    color: colors.primary.dark,
  },
  brokerPendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  brokerPendingText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
});
