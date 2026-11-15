import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Badge, Button, RoleGuard } from '../../../src/components';
import { FranchiseService } from '../../../src/services/franchiseService';
import { FranchiseListing } from '../../../src/types/franchise';
import { EnquiryModal, formatCurrencyINR } from '../../../src/components/marketplace';

export default function FranchiseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listing, setListing] = useState<FranchiseListing | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await FranchiseService.getFranchiseBySlugOrId(id);
        if (isMounted) {
          setListing(data.listing);
          setIsSaved(data.isSaved);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to load franchise details');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleToggleSave = async () => {
    if (!listing) return;
    try {
      const newState = await FranchiseService.toggleSaveFranchise(listing._id);
      setIsSaved(newState);
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Could not update saved status');
    }
  };

  const handleEnquirySuccess = (refNumber: string) => {
    setSubmittedReference(refNumber);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Opportunity Details" showBack onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading opportunity specifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Opportunity Details" showBack onBack={() => router.back()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Opportunity Not Found</Text>
          <Text style={styles.errorSubtitle}>{error || 'This listing may have been unlisted.'}</Text>
          <Button
            title="Back to Marketplace"
            onPress={() => router.replace('/(investor)/marketplace')}
            variant="primary"
            size="md"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initials = listing.brandName
    ? listing.brandName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FB';

  return (
    <RoleGuard allowedRoles={['investor', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={listing.brandName}
          subtitle="Franchise Opportunity"
          showBack
          onBack={() => router.back()}
          rightAction={
            <Pressable onPress={handleToggleSave} hitSlop={8} style={styles.headerSaveBtn}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={24}
                color={isSaved ? colors.danger.DEFAULT : colors.navy[900]}
              />
            </Pressable>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Reference Submission Toast */}
          {submittedReference && (
            <Card style={styles.successCard} padding="md">
              <Ionicons name="checkmark-circle" size={24} color={colors.accent.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Enquiry Successfully Submitted!</Text>
                <Text style={styles.successRef}>
                  Reference: <Text style={{ fontWeight: '700' }}>{submittedReference}</Text>
                </Text>
                <Text style={styles.successDesc}>
                  Our brokerage lead director will reach out within 24 business hours.
                </Text>
              </View>
            </Card>
          )}

          {/* Brand Identity Hero Card */}
          <Card style={styles.heroCard} padding="lg">
            <View style={styles.heroRow}>
              <View style={styles.heroLogo}>
                <Text style={styles.heroLogoText}>{initials}</Text>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.brandTitle}>{listing.brandName}</Text>
                <Text style={styles.brandTagline}>{listing.tagline}</Text>
                <View style={styles.heroBadges}>
                  <Badge
                    label={listing.industry || 'Food & Beverage'}
                    variant="primary"
                    size="sm"
                  />
                  {listing.businessModel && (
                    <Badge label={listing.businessModel} variant="neutral" size="sm" />
                  )}
                </View>
              </View>
            </View>
          </Card>

          {/* Financial Requirements Grid */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Financial Requirements</Text>
            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Investment</Text>
                <Text style={styles.metricHighlight}>
                  {formatCurrencyINR(listing.totalInvestmentMin)} - {formatCurrencyINR(listing.totalInvestmentMax)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Initial Franchise Fee</Text>
                <Text style={styles.metricValue}>
                  {listing.initialFranchiseFee ? formatCurrencyINR(listing.initialFranchiseFee) : 'Disclosed on NDA'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Royalty Structure</Text>
                <Text style={styles.metricValue}>
                  {listing.royaltyPercentage !== undefined ? `${listing.royaltyPercentage}% of Gross Sales` : 'Standard'}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Estimated Payback (ROI)</Text>
                <Text style={styles.metricValue}>
                  {listing.estimatedRoiMonths ? `${listing.estimatedRoiMonths} Months` : '18 - 24 Months'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Commercial Space & Operations */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Space & Unit Operations</Text>
            <View style={styles.specList}>
              <View style={styles.specRow}>
                <Ionicons name="business-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.specLabel}>Commercial Space:</Text>
                <Text style={styles.specValue}>
                  {listing.commercialSpaceMinSqFt || 400} - {listing.commercialSpaceMaxSqFt || 1200} sq ft
                </Text>
              </View>

              <View style={styles.specRow}>
                <Ionicons name="people-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.specLabel}>Staff Required:</Text>
                <Text style={styles.specValue}>
                  {listing.staffRequiredMin || 2} to {listing.staffRequiredMax || 8} team members
                </Text>
              </View>

              <View style={styles.specRow}>
                <Ionicons name="school-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={styles.specLabel}>Training Duration:</Text>
                <Text style={styles.specValue}>
                  {listing.trainingDurationWeeks || 2} Weeks On-site & Headquarters
                </Text>
              </View>

              {listing.trainingSupportDetails && (
                <View style={styles.specRow}>
                  <Ionicons name="ribbon-outline" size={18} color={colors.primary.DEFAULT} />
                  <Text style={styles.specLabel}>Support Details:</Text>
                  <Text style={styles.specValue}>{listing.trainingSupportDetails}</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Opportunity Overview */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Opportunity Overview</Text>
            <Text style={styles.paragraph}>{listing.summary}</Text>

            {listing.brandStory && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Brand Story</Text>
                <Text style={styles.paragraph}>{listing.brandStory}</Text>
              </>
            )}
          </Card>

          {/* Ideal Franchisee Profile */}
          {listing.idealFranchiseeProfile && (
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Ideal Franchisee Profile</Text>
              <Text style={styles.paragraph}>{listing.idealFranchiseeProfile}</Text>
            </Card>
          )}

          {/* Expansion Locations */}
          {listing.expansionLocations && listing.expansionLocations.length > 0 && (
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Available Expansion Markets</Text>
              <View style={styles.locationsWrap}>
                {listing.expansionLocations.map((loc, idx) => (
                  <View key={idx} style={styles.locationChip}>
                    <Ionicons name="pin" size={12} color={colors.primary.DEFAULT} />
                    <Text style={styles.locationChipText}>{loc}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <Pressable
            style={styles.bottomSaveBtn}
            onPress={handleToggleSave}
            hitSlop={8}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? colors.danger.DEFAULT : colors.slate[600]}
            />
            <Text style={styles.bottomSaveText}>{isSaved ? 'Saved' : 'Save'}</Text>
          </Pressable>

          <Button
            title="Submit Enquiry / Apply"
            onPress={() => setIsEnquiryModalOpen(true)}
            variant="primary"
            size="lg"
            style={{ flex: 1 }}
          />
        </View>

        {/* Enquiry Modal */}
        <EnquiryModal
          visible={isEnquiryModalOpen}
          listing={listing}
          onClose={() => setIsEnquiryModalOpen(false)}
          onSuccess={handleEnquirySuccess}
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
  headerSaveBtn: {
    padding: spacing.xs,
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
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginTop: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.slate[600],
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge + spacing.xl,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.tealLight,
    borderWidth: 1,
    borderColor: colors.accent.teal,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successTitle: {
    ...typography.bodyBold,
    color: colors.accent.tealDark,
  },
  successRef: {
    ...typography.caption,
    color: colors.navy[900],
    marginTop: 2,
  },
  successDesc: {
    ...typography.caption,
    color: colors.slate[600],
    marginTop: 2,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLogo: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  heroLogoText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  heroInfo: {
    flex: 1,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.navy[900],
  },
  brandTagline: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy[900],
    marginBottom: spacing.md,
  },
  metricGrid: {
    gap: spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  metricLabel: {
    ...typography.body,
    color: colors.slate[600],
  },
  metricHighlight: {
    ...typography.bodyBold,
    color: colors.primary.DEFAULT,
  },
  metricValue: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  specList: {
    gap: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  specLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.slate[700],
    minWidth: 120,
  },
  specValue: {
    ...typography.body,
    color: colors.slate[600],
    flex: 1,
  },
  paragraph: {
    ...typography.body,
    color: colors.slate[700],
    lineHeight: 22,
  },
  locationsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  locationChipText: {
    ...typography.caption,
    color: colors.navy[900],
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bottomSaveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  bottomSaveText: {
    ...typography.caption,
    color: colors.slate[600],
    fontSize: 10,
    marginTop: 2,
  },
});
