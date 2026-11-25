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
  TextInput,
  Modal,
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
import { MatchingService } from '../../src/services/matchingService';
import { IntroductionService } from '../../src/services/introductionService';
import { FranchisorSmartMatch } from '../../src/types/matching';

export default function FranchisorInvestorMatchingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [matches, setMatches] = useState<FranchisorSmartMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'priority' | 'verified'>('all');
  const [expandedInvestorId, setExpandedInvestorId] = useState<string | null>(null);

  // Invite Modal
  const [selectedInvestor, setSelectedInvestor] = useState<FranchisorSmartMatch | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteCity, setInviteCity] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const result = await MatchingService.getFranchisorMatches();
      setMatches(result.matches || []);
    } catch (err: any) {
      console.warn('[FranchisorInvestorMatchingScreen] Fetch error:', err.message);
      setErrorMessage(err.message || 'Failed to load matching investor profiles.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleOpenInviteModal = (match: FranchisorSmartMatch) => {
    setSelectedInvestor(match);
    const defaultCity =
      match.investor.preferredLocations && match.investor.preferredLocations.length > 0
        ? match.investor.preferredLocations[0]
        : match.investor.city || 'Bangalore';

    setInviteCity(defaultCity);
    setInviteMessage(
      `We noticed your investment criteria and capital allocation align with our franchise unit economics. We would like to introduce our opportunity to you.`
    );
    setInviteModalVisible(true);
  };

  const handleSendInvite = async () => {
    if (!selectedInvestor) return;

    if (!inviteCity.trim()) {
      Alert.alert('Required Field', 'Please provide a target expansion city for this invitation.');
      return;
    }

    try {
      setIsSubmittingInvite(true);
      await IntroductionService.createIntroduction({
        investorProfileId: selectedInvestor.investor._id,
        targetCity: inviteCity.trim(),
        investmentBudget: selectedInvestor.investor.investmentBudgetMin,
        initialMessage: inviteMessage.trim(),
        compatibilityScore: selectedInvestor.matchAnalysis.totalScore,
      });

      setInviteModalVisible(false);
      Alert.alert(
        '🎉 Invitation Dispatched!',
        `Your invitation has been sent to candidate ${selectedInvestor.investor.anonymizedId}. Direct contact info and Deal Room access will be unlocked once mutual consent is established.`
      );
    } catch (err: any) {
      const msg = err.message || 'Failed to dispatch introduction request.';
      if (err.statusCode === 409 || msg.includes('already exists')) {
        Alert.alert(
          'Introduction Already Active',
          'An active introduction request or invitation already exists for this investor.'
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const filteredMatches = matches.filter((item) => {
    const inv = item.investor;
    const analysis = item.matchAnalysis;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = inv.anonymizedId?.toLowerCase().includes(q);
      const matchCity = inv.city?.toLowerCase().includes(q);
      const matchType = inv.investorType?.toLowerCase().includes(q);
      if (!matchId && !matchCity && !matchType) return false;
    }

    if (scoreFilter === 'priority' && analysis.totalScore < 85) return false;
    if (scoreFilter === 'verified' && analysis.totalScore < 70) return false;

    return true;
  });

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'teal';
    if (score >= 50) return 'warning';
    return 'neutral';
  };

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Investor Matchmaking"
          subtitle="Anonymized Acquisitor Discovery"
          showBack
          onBack={() => router.back()}
        />

        <View style={styles.container}>
          {/* Filter Bar */}
          <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
              <Ionicons name="search-outline" size={18} color={colors.slate[400]} />
              <TextInput
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Search investor ID, city, type..."
                placeholderTextColor={colors.slate[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={colors.slate[400]} />
                </Pressable>
              )}
            </View>

            <View style={styles.pillsRow}>
              <Pressable
                style={[
                  styles.pill,
                  scoreFilter === 'all' && { backgroundColor: colors.primary.DEFAULT },
                  scoreFilter !== 'all' && { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] },
                ]}
                onPress={() => setScoreFilter('all')}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: scoreFilter === 'all' ? '#FFFFFF' : colors.slate[400] },
                  ]}
                >
                  All Matches ({matches.length})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.pill,
                  scoreFilter === 'priority' && { backgroundColor: colors.success.DEFAULT },
                  scoreFilter !== 'priority' && { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] },
                ]}
                onPress={() => setScoreFilter('priority')}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: scoreFilter === 'priority' ? '#FFFFFF' : colors.slate[400] },
                  ]}
                >
                  Priority (85%+)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.pill,
                  scoreFilter === 'verified' && { backgroundColor: colors.accent.teal },
                  scoreFilter !== 'verified' && { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] },
                ]}
                onPress={() => setScoreFilter('verified')}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: scoreFilter === 'verified' ? '#FFFFFF' : colors.slate[400] },
                  ]}
                >
                  Verified (70%+)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Matches List */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchMatches(true)}
                colors={[colors.primary.DEFAULT]}
                tintColor={colors.primary.DEFAULT}
              />
            }
          >
            {isLoading && !isRefreshing ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                  Searching anonymized investor pool for your brand...
                </Text>
              </View>
            ) : errorMessage ? (
              <Card style={styles.errorCard} padding="lg">
                <Ionicons name="alert-circle-outline" size={32} color={colors.danger.DEFAULT} />
                <Text style={styles.errorTitle}>Error Loading Matches</Text>
                <Text style={styles.errorSubtitle}>{errorMessage}</Text>
                <Button
                  title="Retry"
                  onPress={() => fetchMatches(false)}
                  size="sm"
                  variant="outline"
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            ) : filteredMatches.length === 0 ? (
              <EmptyState
                title="No Matching Investors Found"
                description={
                  searchQuery.length > 0 || scoreFilter !== 'all'
                    ? 'No investor profiles match your active filters. Try broadening your criteria.'
                    : 'No registered investors match your brand capital requirements currently. As new investors register, compatible profiles will appear here.'
                }
                icon="people-outline"
              />
            ) : (
              filteredMatches.map((match) => {
                const inv = match.investor;
                const analysis = match.matchAnalysis;
                const isExpanded = expandedInvestorId === inv._id;

                return (
                  <Card key={inv._id} style={styles.matchCard} padding="lg">
                    {/* Header */}
                    <View style={styles.matchHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.scoreRow}>
                          <Badge
                            label={`${analysis.totalScore}% COMPATIBILITY`}
                            variant={getScoreBadgeVariant(analysis.totalScore)}
                            size="md"
                          />
                          <Badge
                            label={inv.isVerified ? 'VERIFIED INVESTOR' : 'ANONYMIZED'}
                            variant="success"
                            size="sm"
                          />
                        </View>
                        <Text style={[styles.brandTitle, { color: colors.text.primary }]}>
                          {inv.anonymizedId}
                        </Text>
                        <Text style={[styles.brandCategory, { color: colors.slate[400] }]}>
                          {inv.investorType || 'Individual Investor'} • {inv.city || 'India'}
                        </Text>
                      </View>
                    </View>

                    {/* Financial Alignment Box */}
                    <View style={[styles.financialsBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[50] }]}>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Budget Min</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          ₹{(inv.investmentBudgetMin / 100000).toFixed(1)}L
                        </Text>
                      </View>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Budget Max</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          ₹{(inv.investmentBudgetMax / 100000).toFixed(1)}L
                        </Text>
                      </View>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Liquid Capital</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          {inv.liquidCapital ? `₹${(inv.liquidCapital / 100000).toFixed(1)}L` : 'Available'}
                        </Text>
                      </View>
                    </View>

                    {/* Preferred Locations */}
                    {inv.preferredLocations && inv.preferredLocations.length > 0 && (
                      <View style={styles.territoryRow}>
                        <Ionicons name="location-outline" size={15} color={colors.primary.DEFAULT} />
                        <Text style={[styles.territoryText, { color: colors.slate[400] }]} numberOfLines={1}>
                          Target Markets: {inv.preferredLocations.slice(0, 3).join(', ')}
                        </Text>
                      </View>
                    )}

                    {/* Toggle Breakdown */}
                    <Pressable
                      style={styles.toggleBreakdownBtn}
                      onPress={() => setExpandedInvestorId(isExpanded ? null : inv._id)}
                    >
                      <Text style={[styles.toggleBreakdownText, { color: colors.primary.DEFAULT }]}>
                        {isExpanded ? 'Hide Score Breakdown' : 'View Compatibility Breakdown'}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.primary.DEFAULT}
                      />
                    </Pressable>

                    {/* Expanded Breakdown */}
                    {isExpanded && (
                      <View style={[styles.breakdownContainer, { borderTopColor: colors.border }]}>
                        <Text style={[styles.breakdownHeading, { color: colors.text.primary }]}>
                          Match Breakdown
                        </Text>

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Budget Score</Text>
                          <Text style={[styles.scoreBarVal, { color: colors.text.primary }]}>
                            {analysis.budgetScore} / 30
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${(analysis.budgetScore / 30) * 100}%`, backgroundColor: colors.primary.DEFAULT },
                            ]}
                          />
                        </View>

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Location Fit</Text>
                          <Text style={[styles.scoreBarVal, { color: colors.text.primary }]}>
                            {analysis.locationScore} / 25
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${(analysis.locationScore / 25) * 100}%`, backgroundColor: colors.accent.teal },
                            ]}
                          />
                        </View>

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Sector Fit</Text>
                          <Text style={[styles.scoreBarVal, { color: colors.text.primary }]}>
                            {analysis.industryScore} / 20
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${(analysis.industryScore / 20) * 100}%`, backgroundColor: colors.success.DEFAULT },
                            ]}
                          />
                        </View>

                        {/* Matched Criteria */}
                        {analysis.matchedCriteria && analysis.matchedCriteria.length > 0 && (
                          <View style={styles.criteriaBox}>
                            <Text style={[styles.criteriaSubhead, { color: colors.success.DEFAULT }]}>
                              Matched Alignment
                            </Text>
                            {analysis.matchedCriteria.map((c, idx) => (
                              <View key={idx} style={styles.criteriaLine}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success.DEFAULT} />
                                <Text style={[styles.criteriaText, { color: colors.text.primary }]}>{c}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Invite Button */}
                    <Button
                      title="Invite Investor to Connect"
                      onPress={() => handleOpenInviteModal(match)}
                      variant="primary"
                      fullWidth
                      size="md"
                      style={{ marginTop: spacing.md }}
                    />
                  </Card>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Modal: Invite Investor */}
        <Modal
          visible={inviteModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Invite Investor</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.slate[400] }]}>
                    Candidate: {selectedInvestor?.investor.anonymizedId}
                  </Text>
                </View>
                <Pressable onPress={() => setInviteModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.slate[400]} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                <View style={[styles.noticeBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.slate[400] }]}>
                    Candidate personal contact details are unlocked once mutual consent is established.
                  </Text>
                </View>

                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Target Expansion City *</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={inviteCity}
                  onChangeText={setInviteCity}
                  placeholder="e.g. Bangalore, Hyderabad"
                  placeholderTextColor={colors.slate[400]}
                />

                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Invitation Message</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, { color: colors.text.primary, borderColor: colors.border }]}
                  value={inviteMessage}
                  onChangeText={setInviteMessage}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe unit economics and market demand in this territory..."
                  placeholderTextColor={colors.slate[400]}
                />

                <Button
                  title="Send Invitation"
                  onPress={handleSendInvite}
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={isSubmittingInvite}
                  style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  pillText: {
    ...typography.caption,
    fontWeight: '600',
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
    textAlign: 'center',
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
  matchCard: {
    borderRadius: borderRadius.lg,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  brandTitle: {
    ...typography.h2,
    fontWeight: '700',
  },
  brandCategory: {
    ...typography.caption,
    marginTop: 2,
  },
  financialsBox: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  financialCol: {
    flex: 1,
  },
  finLabel: {
    ...typography.caption,
    fontSize: 11,
  },
  finValue: {
    ...typography.bodyBold,
    fontWeight: '700',
    marginTop: 2,
  },
  territoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  territoryText: {
    ...typography.caption,
    flex: 1,
  },
  toggleBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  toggleBreakdownText: {
    ...typography.caption,
    fontWeight: '600',
  },
  breakdownContainer: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  breakdownHeading: {
    ...typography.bodyBold,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  scoreBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  scoreBarLabel: {
    ...typography.caption,
  },
  scoreBarVal: {
    ...typography.caption,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    marginTop: 3,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  criteriaBox: {
    marginTop: spacing.sm,
    gap: 4,
  },
  criteriaSubhead: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: 2,
  },
  criteriaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  criteriaText: {
    ...typography.caption,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...typography.caption,
  },
  modalForm: {
    gap: spacing.xs,
  },
  noticeBox: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 16,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
