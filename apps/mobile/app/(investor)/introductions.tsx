import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, typography, spacing, borderRadius } from '../../src/theme';
import {
  Header,
  Card,
  Badge,
  Button,
  RoleGuard,
  EmptyState,
} from '../../src/components';
import { IntroductionService, IntroductionRequestItem } from '../../src/services/introductionService';
import { useAuth } from '../../src/hooks/useAuth';

export default function InvestorIntroductionsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [introductions, setIntroductions] = useState<IntroductionRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'mutual' | 'closed'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchIntroductions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const items = await IntroductionService.getMyIntroductions();
      setIntroductions(items || []);
    } catch (err: any) {
      console.warn('[InvestorIntroductionsScreen] Fetch error:', err.message);
      setErrorMessage(err.message || 'Failed to load introduction requests.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIntroductions();
  }, [fetchIntroductions]);

  const handleRespond = async (id: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => {
    const actionLabel = action === 'ACCEPT' ? 'Accept' : action === 'REJECT' ? 'Decline' : 'Cancel';
    Alert.alert(
      `${actionLabel} Introduction`,
      action === 'ACCEPT'
        ? 'Confirm mutual consent to connect with this brand? Direct contact info and Deal Room will be unlocked.'
        : action === 'REJECT'
        ? 'Are you sure you want to decline this introduction?'
        : 'Are you sure you want to cancel your introduction request?',
      [
        { text: 'Back', style: 'cancel' },
        {
          text: `Confirm ${actionLabel}`,
          style: action === 'ACCEPT' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(id);
              await IntroductionService.respondToIntroduction(id, action);
              Alert.alert('Status Updated', `Introduction successfully ${action.toLowerCase()}ed.`);
              fetchIntroductions(true);
            } catch (err: any) {
              Alert.alert('Action Failed', err.message || 'Could not update introduction.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleEnterDealRoom = async (intro: IntroductionRequestItem) => {
    try {
      setActionLoadingId(intro._id);
      const res = await IntroductionService.createDealRoom(intro._id);
      const dealRoomId = res.dealRoom?._id || intro.dealRoom;
      if (dealRoomId) {
        router.push(`/(deal-room)/${dealRoomId}` as any);
      } else {
        router.push('/(deal-room)' as any);
      }
    } catch (err: any) {
      Alert.alert('Deal Room Error', err.message || 'Failed to open Deal Room.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = introductions.filter((item) => {
    if (activeTab === 'pending') {
      return ['PENDING', 'ADMIN_REVIEW', 'ACCEPTED_BY_FRANCHISOR', 'ACCEPTED_BY_INVESTOR'].includes(
        item.status
      );
    }
    if (activeTab === 'mutual') {
      return ['MUTUALLY_ACCEPTED', 'DEAL_ROOM_CREATED'].includes(item.status);
    }
    if (activeTab === 'closed') {
      return ['REJECTED', 'CANCELLED'].includes(item.status);
    }
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'MUTUALLY_ACCEPTED':
      case 'DEAL_ROOM_CREATED':
        return 'success';
      case 'ACCEPTED_BY_FRANCHISOR':
      case 'ACCEPTED_BY_INVESTOR':
        return 'primary';
      case 'PENDING':
      case 'ADMIN_REVIEW':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      case 'CANCELLED':
      default:
        return 'neutral';
    }
  };

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Introductions Pipeline"
          subtitle="Mutual Consents & Deal Progressions"
          showBack
          onBack={() => router.back()}
        />

        {/* Tab Filter Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.tabItem, activeTab === 'all' && styles.activeTabItem]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'all' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              All ({introductions.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'pending' && styles.activeTabItem]}
            onPress={() => setActiveTab('pending')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'pending' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'pending' && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'mutual' && styles.activeTabItem]}
            onPress={() => setActiveTab('mutual')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'mutual' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'mutual' && styles.activeTabText,
              ]}
            >
              Mutual Consent
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'closed' && styles.activeTabItem]}
            onPress={() => setActiveTab('closed')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'closed' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'closed' && styles.activeTabText,
              ]}
            >
              Closed
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchIntroductions(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {isLoading && !isRefreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                Loading introduction requests...
              </Text>
            </View>
          ) : errorMessage ? (
            <Card style={styles.errorCard} padding="lg">
              <Ionicons name="alert-circle-outline" size={32} color={colors.danger.DEFAULT} />
              <Text style={styles.errorTitle}>Error Loading Introductions</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <Button
                title="Retry"
                onPress={() => fetchIntroductions(false)}
                size="sm"
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Introductions Found"
              description={
                activeTab === 'all'
                  ? 'You have not submitted or received any introduction requests yet. Explore Smart Matches to connect with vetted franchise brands.'
                  : `No introduction requests match the "${activeTab}" filter.`
              }
              icon="mail-unread-outline"
              actionLabel="Explore Smart Matches"
              onAction={() => router.push('/(investor)/matching' as any)}
            />
          ) : (
            filteredItems.map((intro) => {
              const isMutual =
                intro.status === 'MUTUALLY_ACCEPTED' || intro.status === 'DEAL_ROOM_CREATED';
              const isAwaitingMyConsent = intro.status === 'ACCEPTED_BY_FRANCHISOR';
              const isPending = intro.status === 'PENDING' || intro.status === 'ADMIN_REVIEW';
              const isActionLoading = actionLoadingId === intro._id;

              return (
                <Card key={intro._id} style={styles.introCard} padding="lg">
                  {/* Top Bar: Reference & Status */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.refNumber, { color: colors.slate[400] }]}>
                        {intro.referenceNumber || `REF-${intro._id.slice(-6).toUpperCase()}`}
                      </Text>
                      <Text style={[styles.brandTitle, { color: colors.text.primary }]}>
                        {intro.brandName}
                      </Text>
                    </View>
                    <Badge
                      label={intro.status.replace(/_/g, ' ')}
                      variant={getStatusBadgeVariant(intro.status)}
                      size="sm"
                    />
                  </View>

                  {/* Territory & Budget Details */}
                  <View style={[styles.detailsBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[50] }]}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.slate[400] }]}>Target City</Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        {intro.targetCity} {intro.targetState ? `, ${intro.targetState}` : ''}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.slate[400] }]}>Budget Allocated</Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        ₹{intro.investmentBudget ? intro.investmentBudget.toLocaleString('en-IN') : 'N/A'}
                      </Text>
                    </View>

                    {intro.compatibilityScore ? (
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.slate[400] }]}>Match Score</Text>
                        <Text style={[styles.detailValue, { color: colors.primary.DEFAULT }]}>
                          {intro.compatibilityScore}% Compatibility
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Mutual Consent Status Banner */}
                  {isMutual ? (
                    <View style={[styles.consentBanner, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                      <Ionicons name="checkmark-done-circle" size={20} color={colors.success.DEFAULT} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consentTitle, { color: colors.success.DEFAULT }]}>
                          Mutual Consent Established
                        </Text>
                        <Text style={[styles.consentDesc, { color: colors.text.primary }]}>
                          Direct contact details and Deal Room access are unlocked.
                        </Text>
                        {intro.businessOwnerUser && !intro.businessOwnerUser.isMasked && (
                          <View style={styles.contactDetails}>
                            {intro.businessOwnerUser.fullName && (
                              <Text style={[styles.contactLine, { color: colors.text.primary }]}>
                                Contact: {intro.businessOwnerUser.fullName}
                              </Text>
                            )}
                            {intro.businessOwnerUser.email && (
                              <Text style={[styles.contactLine, { color: colors.text.primary }]}>
                                Email: {intro.businessOwnerUser.email}
                              </Text>
                            )}
                            {intro.businessOwnerUser.phone && (
                              <Text style={[styles.contactLine, { color: colors.text.primary }]}>
                                Phone: {intro.businessOwnerUser.phone}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  ) : isAwaitingMyConsent ? (
                    <View style={[styles.consentBanner, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                      <Ionicons name="notifications-outline" size={20} color={colors.primary.DEFAULT} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consentTitle, { color: colors.primary.DEFAULT }]}>
                          Brand Consented to Connect
                        </Text>
                        <Text style={[styles.consentDesc, { color: colors.slate[400] }]}>
                          {intro.brandName} has approved your introduction request. Accept to exchange direct contacts and open your Deal Room.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.consentBanner, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                      <Ionicons name="lock-closed-outline" size={18} color={colors.warning.DEFAULT} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consentTitle, { color: colors.warning.DEFAULT }]}>
                          Privacy Masking Active
                        </Text>
                        <Text style={[styles.consentDesc, { color: colors.slate[400] }]}>
                          Contact details remain masked until both parties establish mutual consent.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    {isMutual && (
                      <Button
                        title={intro.status === 'DEAL_ROOM_CREATED' ? 'Open Deal Room' : 'Enter Deal Room'}
                        onPress={() => handleEnterDealRoom(intro)}
                        variant="primary"
                        fullWidth
                        size="md"
                        loading={isActionLoading}
                      />
                    )}

                    {isAwaitingMyConsent && (
                      <View style={styles.dualActionRow}>
                        <Button
                          title="Accept Introduction"
                          onPress={() => handleRespond(intro._id, 'ACCEPT')}
                          variant="primary"
                          size="md"
                          loading={isActionLoading}
                          style={{ flex: 1.2 }}
                        />
                        <Button
                          title="Decline"
                          onPress={() => handleRespond(intro._id, 'REJECT')}
                          variant="outline"
                          size="md"
                          disabled={isActionLoading}
                          style={{ flex: 1 }}
                        />
                      </View>
                    )}

                    {isPending && intro.initiatedBy === 'investor' && (
                      <Button
                        title="Cancel Request"
                        onPress={() => handleRespond(intro._id, 'CANCEL')}
                        variant="outline"
                        size="sm"
                        loading={isActionLoading}
                      />
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.huge,
  },
  centerBox: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: '#EF4444',
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    ...typography.caption,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  introCard: {
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refNumber: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  brandTitle: {
    ...typography.h3,
    fontWeight: '700',
    marginTop: 2,
  },
  detailsBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.caption,
  },
  detailValue: {
    ...typography.caption,
    fontWeight: '700',
  },
  consentBanner: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  consentTitle: {
    ...typography.caption,
    fontWeight: '700',
  },
  consentDesc: {
    ...typography.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  contactDetails: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 2,
  },
  contactLine: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    marginTop: spacing.md,
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
