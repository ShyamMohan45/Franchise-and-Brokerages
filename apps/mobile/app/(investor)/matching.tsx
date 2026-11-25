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
import { InvestorSmartMatch } from '../../src/types/matching';
import { useAuth } from '../../src/hooks/useAuth';

export default function InvestorMatchingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, investorProfile } = useAuth();

  const [matches, setMatches] = useState<InvestorSmartMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'priority' | 'verified'>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Introduction Modal State
  const [selectedMatchForIntro, setSelectedMatchForIntro] = useState<InvestorSmartMatch | null>(null);
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introTargetCity, setIntroTargetCity] = useState('');
  const [introTargetState, setIntroTargetState] = useState('');
  const [introBudget, setIntroBudget] = useState('');
  const [introUnits, setIntroUnits] = useState('1');
  const [introMessage, setIntroMessage] = useState('');
  const [isSubmittingIntro, setIsSubmittingIntro] = useState(false);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const result = await MatchingService.getInvestorMatches();
      setMatches(result.matches || []);
    } catch (err: any) {
      console.warn('[InvestorMatchingScreen] Fetch error:', err.message);
      setErrorMessage(err.message || 'Failed to load personalized franchise matches.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleOpenIntroModal = (match: InvestorSmartMatch) => {
    setSelectedMatchForIntro(match);
    const defaultCity =
      match.listing.expansionLocations && match.listing.expansionLocations.length > 0
        ? match.listing.expansionLocations[0]
        : investorProfile?.preferredLocations && investorProfile.preferredLocations.length > 0
        ? investorProfile.preferredLocations[0]
        : 'Bangalore';

    setIntroTargetCity(defaultCity);
    setIntroTargetState('Karnataka');
    setIntroBudget(String(match.listing.totalInvestmentMin || 2500000));
    setIntroUnits('1');
    setIntroMessage(
      `Hello ${match.listing.brandName} team, I am interested in exploring franchise expansion opportunities in ${defaultCity}. My profile matches your investment requirements.`
    );
    setIntroModalVisible(true);
  };

  const handleSendIntroduction = async () => {
    if (!selectedMatchForIntro) return;

    if (!introTargetCity.trim()) {
      Alert.alert('Required Field', 'Please specify a target city for your introduction.');
      return;
    }

    const budgetNum = parseInt(introBudget.replace(/[^0-9]/g, ''), 10);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid investment budget amount.');
      return;
    }

    try {
      setIsSubmittingIntro(true);
      await IntroductionService.createIntroduction({
        franchiseId: selectedMatchForIntro.listing._id,
        targetCity: introTargetCity.trim(),
        targetState: introTargetState.trim() || undefined,
        investmentBudget: budgetNum,
        unitsInterested: parseInt(introUnits, 10) || 1,
        initialMessage: introMessage.trim(),
        compatibilityScore: selectedMatchForIntro.matchAnalysis.totalScore,
      });

      setIntroModalVisible(false);
      Alert.alert(
        '🎉 Introduction Requested!',
        `Your introduction request has been dispatched to ${selectedMatchForIntro.listing.brandName}. Once both parties confirm mutual consent, contact details and Deal Room access will be unlocked.`,
        [
          {
            text: 'Track Introductions',
            onPress: () => router.push('/(investor)/introductions' as any),
          },
          { text: 'Continue Browsing', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      const msg = err.message || 'Failed to dispatch introduction request.';
      if (err.statusCode === 409 || msg.includes('already exists')) {
        Alert.alert(
          'Introduction Already Active',
          'An active introduction request already exists for this brand. Check your Introductions pipeline to view current status.',
          [
            {
              text: 'View Introductions',
              onPress: () => {
                setIntroModalVisible(false);
                router.push('/(investor)/introductions' as any);
              },
            },
            { text: 'Close', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsSubmittingIntro(false);
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((item) => {
    const listing = item.listing;
    const analysis = item.matchAnalysis;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBrand = listing.brandName?.toLowerCase().includes(q);
      const matchCat = listing.category?.toLowerCase().includes(q);
      const matchInd = listing.industry?.toLowerCase().includes(q);
      if (!matchBrand && !matchCat && !matchInd) return false;
    }

    // Score filter
    if (scoreFilter === 'priority' && analysis.totalScore < 85) {
      return false;
    }
    if (scoreFilter === 'verified' && analysis.totalScore < 70) {
      return false;
    }

    return true;
  });

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'teal';
    if (score >= 50) return 'warning';
    return 'neutral';
  };

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Smart Matches"
          subtitle="AI-Powered Compatibility Engine"
          showBack
          onBack={() => router.back()}
        />

        <View style={styles.container}>
          {/* Search & Score Filter Controls */}
          <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
              <Ionicons name="search-outline" size={18} color={colors.slate[400]} />
              <TextInput
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Search matched brands or sectors..."
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

            {/* Quick score pills */}
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

          {/* Match Listings Scroll */}
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
                  Calculating compatibility scores across active franchise listings...
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
                title="No Compatible Matches Found"
                description={
                  searchQuery.length > 0 || scoreFilter !== 'all'
                    ? 'No franchise opportunities match your active filters. Try adjusting your search query or minimum score.'
                    : 'We could not find active franchises matching your investment budget and territory. Update your investment profile to broaden matches.'
                }
                icon="git-compare-outline"
                actionLabel="Update Profile Preferences"
                onAction={() => router.push('/profile')}
              />
            ) : (
              filteredMatches.map((match) => {
                const listing = match.listing;
                const analysis = match.matchAnalysis;
                const isExpanded = expandedMatchId === listing._id;

                return (
                  <Card key={listing._id} style={styles.matchCard} padding="lg">
                    {/* Header: Score & Brand Info */}
                    <View style={styles.matchHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.scoreRow}>
                          <Badge
                            label={`${analysis.totalScore}% COMPATIBILITY`}
                            variant={getScoreBadgeVariant(analysis.totalScore)}
                            size="md"
                          />
                          <Badge
                            label={analysis.introductionStatus.toUpperCase()}
                            variant="primary"
                            size="sm"
                          />
                        </View>
                        <Text style={[styles.brandTitle, { color: colors.text.primary }]}>
                          {listing.brandName}
                        </Text>
                        <Text style={[styles.brandCategory, { color: colors.slate[400] }]}>
                          {listing.industry || listing.category || 'Franchise Opportunity'} • {listing.businessModel || 'FOFO'}
                        </Text>
                      </View>
                    </View>

                    {/* Headline */}
                    {listing.headline && (
                      <Text style={[styles.headlineText, { color: colors.slate[500] }]} numberOfLines={2}>
                        "{listing.headline}"
                      </Text>
                    )}

                    {/* Key Financials Row */}
                    <View style={[styles.financialsBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[50] }]}>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Total Investment</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          ₹{(listing.totalInvestmentMin / 100000).toFixed(1)}L - ₹{(listing.totalInvestmentMax / 100000).toFixed(1)}L
                        </Text>
                      </View>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Franchise Fee</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          {listing.franchiseFee ? `₹${(listing.franchiseFee / 100000).toFixed(1)}L` : 'Included'}
                        </Text>
                      </View>
                      <View style={styles.financialCol}>
                        <Text style={[styles.finLabel, { color: colors.slate[400] }]}>Royalty</Text>
                        <Text style={[styles.finValue, { color: colors.text.primary }]}>
                          {listing.royaltyPercentage ? `${listing.royaltyPercentage}%` : 'Standard'}
                        </Text>
                      </View>
                    </View>

                    {/* Expansion Territories */}
                    {listing.expansionLocations && listing.expansionLocations.length > 0 && (
                      <View style={styles.territoryRow}>
                        <Ionicons name="location-outline" size={15} color={colors.primary.DEFAULT} />
                        <Text style={[styles.territoryText, { color: colors.slate[400] }]} numberOfLines={1}>
                          Expansion: {listing.expansionLocations.slice(0, 3).join(', ')}
                          {listing.expansionLocations.length > 3 ? ` +${listing.expansionLocations.length - 3} more` : ''}
                        </Text>
                      </View>
                    )}

                    {/* Toggle Breakdown Details */}
                    <Pressable
                      style={styles.toggleBreakdownBtn}
                      onPress={() => setExpandedMatchId(isExpanded ? null : listing._id)}
                    >
                      <Text style={[styles.toggleBreakdownText, { color: colors.primary.DEFAULT }]}>
                        {isExpanded ? 'Hide Compatibility Breakdown' : 'View Compatibility Breakdown'}
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
                          5-Vector Scoring Analysis
                        </Text>

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Budget & CapEx</Text>
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
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Territory & Location</Text>
                          <Text style={[styles.scoreBarVal, { color: colors.text.primary }]}>
                            {analysis.locationScore} / 20
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${(analysis.locationScore / 20) * 100}%`, backgroundColor: colors.accent.teal },
                            ]}
                          />
                        </View>

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Industry Fit</Text>
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

                        <View style={styles.scoreBarRow}>
                          <Text style={[styles.scoreBarLabel, { color: colors.slate[400] }]}>Business Experience</Text>
                          <Text style={[styles.scoreBarVal, { color: colors.text.primary }]}>
                            {analysis.experienceScore} / 10
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${(analysis.experienceScore / 10) * 100}%`, backgroundColor: '#8B5CF6' },
                            ]}
                          />
                        </View>

                        {/* Matched Criteria Highlights */}
                        {analysis.matchedCriteria && analysis.matchedCriteria.length > 0 && (
                          <View style={styles.criteriaBox}>
                            <Text style={[styles.criteriaSubhead, { color: colors.success.DEFAULT }]}>
                              Matched Criteria
                            </Text>
                            {analysis.matchedCriteria.map((c, idx) => (
                              <View key={idx} style={styles.criteriaLine}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success.DEFAULT} />
                                <Text style={[styles.criteriaText, { color: colors.text.primary }]}>{c}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Unmatched Criteria */}
                        {analysis.unmatchedCriteria && analysis.unmatchedCriteria.length > 0 && (
                          <View style={styles.criteriaBox}>
                            <Text style={[styles.criteriaSubhead, { color: colors.warning.DEFAULT }]}>
                              Considerations & Variances
                            </Text>
                            {analysis.unmatchedCriteria.map((c, idx) => (
                              <View key={idx} style={styles.criteriaLine}>
                                <Ionicons name="alert-circle" size={14} color={colors.warning.DEFAULT} />
                                <Text style={[styles.criteriaText, { color: colors.slate[400] }]}>{c}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Action Buttons Row */}
                    <View style={styles.actionsRow}>
                      <Button
                        title="Request Introduction"
                        onPress={() => handleOpenIntroModal(match)}
                        variant="primary"
                        size="md"
                        style={{ flex: 1.3 }}
                      />
                      <Button
                        title="View Opportunity"
                        onPress={() => router.push(`/(investor)/franchise/${listing._id}` as any)}
                        variant="outline"
                        size="md"
                        style={{ flex: 1 }}
                      />
                    </View>
                  </Card>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Modal: Request Mutual Introduction */}
        <Modal
          visible={introModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIntroModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Request Introduction</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.slate[400] }]}>
                    {selectedMatchForIntro?.listing.brandName}
                  </Text>
                </View>
                <Pressable onPress={() => setIntroModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.slate[400]} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                <View style={[styles.noticeBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.slate[400] }]}>
                    Contact details remain masked until both you and the brand owner consent to connect.
                  </Text>
                </View>

                {/* Target City */}
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Target Expansion City *</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={introTargetCity}
                  onChangeText={setIntroTargetCity}
                  placeholder="e.g. Bangalore, Mumbai, Pune"
                  placeholderTextColor={colors.slate[400]}
                />

                {/* Target State */}
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>State</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={introTargetState}
                  onChangeText={setIntroTargetState}
                  placeholder="e.g. Karnataka, Maharashtra"
                  placeholderTextColor={colors.slate[400]}
                />

                {/* Investment Budget */}
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Allocated Investment Budget (INR) *</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={introBudget}
                  onChangeText={setIntroBudget}
                  keyboardType="numeric"
                  placeholder="e.g. 2500000"
                  placeholderTextColor={colors.slate[400]}
                />

                {/* Units */}
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Target Units / Outlets</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text.primary, borderColor: colors.border }]}
                  value={introUnits}
                  onChangeText={setIntroUnits}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.slate[400]}
                />

                {/* Message */}
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Initial Message to Founder</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    styles.modalTextArea,
                    { color: colors.text.primary, borderColor: colors.border },
                  ]}
                  value={introMessage}
                  onChangeText={setIntroMessage}
                  multiline
                  numberOfLines={4}
                  placeholder="Introduce your business background and territory readiness..."
                  placeholderTextColor={colors.slate[400]}
                />

                <Button
                  title="Dispatch Introduction Request"
                  onPress={handleSendIntroduction}
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={isSubmittingIntro}
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
    paddingHorizontal: spacing.xl,
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
  headlineText: {
    ...typography.caption,
    fontStyle: 'italic',
    marginTop: spacing.xs,
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
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
