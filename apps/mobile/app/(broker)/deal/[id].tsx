import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Badge, Button, RoleGuard, UpdateStageModal } from '../../../src/components';
import { CrmService } from '../../../src/services/crmService';
import { BrokerageDeal, DealStage } from '../../../src/types/crm';

const STAGE_ORDER: DealStage[] = [
  'NEW_ENQUIRY',
  'INITIAL_CONTACT',
  'QUALIFICATION',
  'BRAND_MATCHING',
  'MEETING_SCHEDULED',
  'NEGOTIATION',
  'DUE_DILIGENCE',
  'AGREEMENT',
  'CLOSED_WON',
];

export default function BrokerDealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [deal, setDeal] = useState<BrokerageDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  const fetchDeal = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await CrmService.getDealById(id);
      setDeal(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load deal record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const handleUpdateStage = async (newStage: DealStage, note?: string) => {
    if (!id) return;
    try {
      const updated = await CrmService.updateDealStage(id, newStage, note);
      setDeal(updated);
      setIsStageModalOpen(false);
      Alert.alert('Stage Updated', `Deal successfully moved to ${newStage.replace('_', ' ')}`);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Unable to update stage');
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getStageIndex = (stage: DealStage) => {
    if (stage === 'CLOSED_LOST') return -1;
    return STAGE_ORDER.indexOf(stage);
  };

  const currentStageIdx = deal ? getStageIndex(deal.stage) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Deal Details" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading deal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !deal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Deal Details" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Deal Not Found</Text>
          <Text style={styles.errorSubtitle}>{error || 'The requested deal does not exist.'}</Text>
          <Button title="Back to Pipeline" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={deal.dealTitle || 'Brokerage Deal'}
          subtitle={deal.franchiseListing?.brandName || 'Expansion Transaction'}
          showBack
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Deal Summary Card */}
          <Card style={styles.summaryCard} padding="lg">
            <View style={styles.topRow}>
              <Badge
                label={deal.stage.replace('_', ' ')}
                variant={deal.stage === 'CLOSED_WON' ? 'success' : deal.stage === 'CLOSED_LOST' ? 'danger' : 'gold'}
                size="md"
              />
              <Badge
                label={`${(deal.paymentStatus || 'pending').toUpperCase()} PAYMENT`}
                variant={deal.paymentStatus === 'paid' ? 'success' : 'neutral'}
                size="sm"
              />
            </View>

            <Text style={styles.dealTitle}>
              {deal.dealTitle || deal.franchiseListing?.brandName || 'Expansion Deal'}
            </Text>
            <Text style={styles.brandSubtitle}>
              Brand: {deal.franchiseListing?.brandName || 'Verified Brand Opportunity'}
            </Text>

            {/* Financial Highlights */}
            <View style={styles.financialGrid}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Deal Value</Text>
                <Text style={styles.financialValue}>{formatCurrency(deal.dealValue)}</Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Expected Commission</Text>
                <Text style={[styles.financialValue, { color: colors.accent.gold }]}>
                  {formatCurrency(deal.expectedCommission)}
                </Text>
                <Text style={styles.commissionRate}>({deal.commissionRate || 0}% rate)</Text>
              </View>
            </View>

            {/* Stage Action Button */}
            <Button
              title="Change Pipeline Stage"
              variant="primary"
              onPress={() => setIsStageModalOpen(true)}
              icon={<Ionicons name="git-network-outline" size={18} color="#FFFFFF" />}
              style={styles.stageButton}
            />
          </Card>

          {/* 10-Stage Visual Step Tracker */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Pipeline Stage Progression</Text>
            <View style={styles.stepTracker}>
              {STAGE_ORDER.map((s, idx) => {
                const isPassed = currentStageIdx >= idx && deal.stage !== 'CLOSED_LOST';
                const isCurrent = s === deal.stage;

                return (
                  <View key={s} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isPassed && !isCurrent ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepDotText, isPassed && styles.stepDotTextPassed]}>
                          {idx + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isPassed && styles.stepLabelPassed,
                      ]}
                    >
                      {s.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Investor Details Card */}
          {deal.investor && (
            <Card style={styles.sectionCard} padding="lg">
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Investor Information</Text>
                <Badge label="BUYER" variant="primary" size="sm" />
              </View>

              <View style={styles.stakeholderInfo}>
                <Text style={styles.stakeholderName}>{deal.investor.fullName}</Text>
                <Text style={styles.stakeholderContact}>{deal.investor.email}</Text>
                {deal.investor.phone && (
                  <Text style={styles.stakeholderContact}>{deal.investor.phone}</Text>
                )}
              </View>

              <View style={styles.actionRow}>
                {deal.investor.phone && (
                  <Button
                    title="Call"
                    size="sm"
                    variant="outline"
                    onPress={() => Linking.openURL(`tel:${deal.investor?.phone}`)}
                    icon={<Ionicons name="call-outline" size={14} color={colors.primary.DEFAULT} />}
                    style={{ flex: 1, marginRight: spacing.xs }}
                  />
                )}
                <Button
                  title="Email"
                  size="sm"
                  variant="outline"
                  onPress={() => Linking.openURL(`mailto:${deal.investor?.email}`)}
                  icon={<Ionicons name="mail-outline" size={14} color={colors.primary.DEFAULT} />}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          )}

          {/* Brand Owner Details */}
          {deal.businessOwner && (
            <Card style={styles.sectionCard} padding="lg">
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Brand Owner Information</Text>
                <Badge label="SELLER" variant="teal" size="sm" />
              </View>

              <View style={styles.stakeholderInfo}>
                <Text style={styles.stakeholderName}>{deal.businessOwner.fullName}</Text>
                <Text style={styles.stakeholderContact}>{deal.businessOwner.email}</Text>
                {deal.businessOwner.phone && (
                  <Text style={styles.stakeholderContact}>{deal.businessOwner.phone}</Text>
                )}
              </View>
            </Card>
          )}

          {/* Stage History Timeline */}
          {deal.stageHistory && deal.stageHistory.length > 0 && (
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Stage History Log</Text>
              {deal.stageHistory.map((item, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStage}>{item.stage.replace('_', ' ')}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {item.note && <Text style={styles.historyNote}>{item.note}</Text>}
                  </View>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>

        {/* Update Stage Modal */}
        <UpdateStageModal
          visible={isStageModalOpen}
          currentStage={deal.stage}
          dealTitle={deal.dealTitle || deal.franchiseListing?.brandName || 'Deal'}
          onClose={() => setIsStageModalOpen(false)}
          onConfirm={handleUpdateStage}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  errorSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  summaryCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dealTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  brandSubtitle: {
    ...typography.captionBold,
    color: colors.accent.teal,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  financialGrid: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  financialItem: {
    alignItems: 'center',
  },
  financialLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  financialValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 16,
  },
  commissionRate: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  financialDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  stageButton: {
    marginTop: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stepTracker: {
    gap: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepDotPassed: {
    backgroundColor: colors.accent.teal,
  },
  stepDotCurrent: {
    backgroundColor: colors.accent.gold,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepDotText: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.text.muted,
  },
  stepDotTextPassed: {
    color: '#FFFFFF',
  },
  stepLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  stepLabelCurrent: {
    color: colors.accent.gold,
    fontWeight: '700',
  },
  stepLabelPassed: {
    color: colors.text.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stakeholderInfo: {
    marginBottom: spacing.md,
  },
  stakeholderName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  stakeholderContact: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.gold,
    marginTop: 5,
    marginRight: spacing.sm,
  },
  historyContent: {
    flex: 1,
  },
  historyStage: {
    ...typography.captionBold,
    color: colors.text.primary,
  },
  historyDate: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  historyNote: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
