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
  RazorpayWebViewModal,
} from '../../src/components';
import { FranchiseService } from '../../src/services/franchiseService';
import { SubscriptionService } from '../../src/services/subscriptionService';
import { PaymentService } from '../../src/services/paymentService';
import { useSubscription } from '../../src/hooks/useSubscription';
import { useCheckout } from '../../src/hooks/useCheckout';
import { useAuth } from '../../src/hooks/useAuth';
import { FranchiseListing } from '../../src/types/franchise';
import { FeaturedListingPackage } from '../../src/types/subscription';
import { PaymentTransactionItem } from '../../src/types/payment';

export default function FeaturedListingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const { subscription, refresh: refreshSubscription } = useSubscription();

  const [listings, setListings] = useState<FranchiseListing[]>([]);
  const [packages, setPackages] = useState<FeaturedListingPackage[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'packages' | 'history'>('listings');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Promotion Modal
  const [promoteModalVisible, setPromoteModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FranchiseListing | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<FeaturedListingPackage | null>(null);

  const {
    isProcessing,
    isVerifying,
    webViewOptions,
    isWebViewVisible,
    startCheckout,
    cancelWebView,
    handleWebViewSuccess,
    handleWebViewError,
  } = useCheckout();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const [myListings, plansData, history] = await Promise.all([
        FranchiseService.getMyFranchises(),
        SubscriptionService.getSubscriptionPlans(),
        PaymentService.getPaymentHistory(),
      ]);

      setListings(myListings || []);
      setPackages(plansData?.featuredPackages || [
        {
          id: '14_days',
          name: '14-Day Priority Showcase',
          durationDays: 14,
          priceINR: 4999,
          currency: 'INR',
          description: 'Homepage placement & priority search rank boost',
        },
        {
          id: '30_days',
          name: '30-Day Growth Acceleration',
          durationDays: 30,
          priceINR: 8999,
          currency: 'INR',
          description: '30-day top tier placement with investor badge highlight',
        },
        {
          id: '90_days',
          name: 'Quarterly Expansion Spotlight',
          durationDays: 90,
          priceINR: 19999,
          currency: 'INR',
          description: 'Full quarter featured status across web & mobile catalog',
        },
      ]);

      const featuredTx = (history || []).filter((tx) => tx.purpose === 'featured_listing');
      setTransactions(featuredTx);
    } catch (err: any) {
      console.warn('[FeaturedListingsScreen] Fetch error:', err.message);
      setErrorMessage(err.message || 'Failed to load featured listings data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenPromoteModal = (listing: FranchiseListing) => {
    setSelectedListing(listing);
    setSelectedPackage(packages[0] || null);
    setPromoteModalVisible(true);
  };

  const handleApplyIncludedSlot = async (listingId: string) => {
    Alert.alert(
      'Apply Included Featured Slot',
      'Use 1 included featured slot from your subscription plan to promote this listing for 30 days?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply Slot',
          onPress: async () => {
            try {
              setActionLoadingId(listingId);
              await SubscriptionService.applyFeaturedSlot(listingId);
              Alert.alert('🎉 Listing Promoted!', 'Your featured slot has been applied successfully.');
              refreshSubscription();
              fetchData(true);
            } catch (err: any) {
              Alert.alert('Slot Error', err.message || 'Could not apply included slot.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleConfirmPurchase = async () => {
    if (!selectedListing || !selectedPackage) return;

    setPromoteModalVisible(false);

    try {
      const result = await startCheckout(
        {
          purpose: 'featured_listing',
          packageId: selectedPackage.id,
          entityId: selectedListing._id,
          entityType: 'FranchiseListing',
        },
        {
          title: `Featured Showcase: ${selectedListing.brandName}`,
          description: `${selectedPackage.name} (${selectedPackage.durationDays} Days Featured Promotion)`,
          billingDetails: {
            fullName: user?.fullName || 'Brand Founder',
            email: user?.email || '',
            phone: user?.phone || '',
          },
        }
      );

      if (result.success) {
        Alert.alert(
          '🎉 Featured Showcase Active!',
          `Your opportunity ${selectedListing.brandName} is now featured for ${selectedPackage.durationDays} days. It will receive top priority placement on the investor marketplace.`,
          [
            {
              text: 'View Listings',
              onPress: () => {
                setActiveTab('listings');
                fetchData(true);
              },
            },
          ]
        );
        fetchData(true);
      } else if (!result.cancelled && result.error) {
        Alert.alert('Payment Status', result.error);
      }
    } catch (err: any) {
      Alert.alert('Promotion Error', err?.message || 'Unable to complete featured placement checkout.');
    }
  };

  const remainingSlots = Math.max(
    0,
    (subscription?.limits?.featuredListingSlots || 0) - (subscription?.usage?.featuredSlotsUsed || 0)
  );

  return (
    <RoleGuard allowedRoles={['business_owner', 'brand_owner', 'admin', 'super_admin']}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header
          title="Featured Showcase"
          subtitle="Priority Placement & Marketplace Spotlight"
          showBack
          onBack={() => router.back()}
        />

        {/* Tab Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.tabItem, activeTab === 'listings' && styles.activeTabItem]}
            onPress={() => setActiveTab('listings')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'listings' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'listings' && styles.activeTabText,
              ]}
            >
              My Listings ({listings.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'packages' && styles.activeTabItem]}
            onPress={() => setActiveTab('packages')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'packages' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'packages' && styles.activeTabText,
              ]}
            >
              Showcase Packages
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'history' && styles.activeTabItem]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? colors.primary.DEFAULT : colors.slate[400] },
                activeTab === 'history' && styles.activeTabText,
              ]}
            >
              Promotion Invoices
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {isLoading && !isRefreshing ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={[styles.loadingText, { color: colors.slate[400] }]}>
                Loading featured listings & package pricing...
              </Text>
            </View>
          ) : errorMessage ? (
            <Card style={styles.errorCard} padding="lg">
              <Ionicons name="alert-circle-outline" size={32} color={colors.danger.DEFAULT} />
              <Text style={styles.errorTitle}>Error Loading Featured Listings</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <Button
                title="Retry"
                onPress={() => fetchData(false)}
                size="sm"
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <>
              {/* TAB 1: LISTINGS & ELIGIBILITY */}
              {activeTab === 'listings' && (
                <View style={styles.tabContent}>
                  {/* Included Subscription Slots Banner */}
                  <Card style={styles.quotaBanner} padding="md">
                    <View style={styles.quotaRow}>
                      <View style={styles.quotaIconCircle}>
                        <Ionicons name="sparkles" size={22} color="#D97706" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quotaTitle}>Included Featured Slots</Text>
                        <Text style={styles.quotaSubtitle}>
                          {remainingSlots > 0
                            ? `You have ${remainingSlots} unused featured slot${remainingSlots > 1 ? 's' : ''} available on your ${subscription?.planName || 'active'} tier.`
                            : `0 complimentary slots remaining. Upgrade your subscription or purchase an à la carte showcase package below.`}
                        </Text>
                      </View>
                    </View>
                  </Card>

                  {listings.length === 0 ? (
                    <EmptyState
                      title="No Listings Found"
                      description="Create and publish a franchise listing first to unlock featured marketplace placement."
                      icon="storefront-outline"
                      actionLabel="Create Listing"
                      onAction={() => router.push('/(brand)/create-listing' as any)}
                    />
                  ) : (
                    listings.map((item) => {
                      const isPublished = item.status === 'published' || item.status === 'PUBLISHED';
                      const isFeatured =
                        Boolean(item.isFeatured) &&
                        (!item.featuredUntil || new Date(item.featuredUntil) > new Date());
                      const isActionLoading = actionLoadingId === item._id;

                      return (
                        <Card key={item._id} style={styles.listingCard} padding="lg">
                          <View style={styles.cardHeader}>
                            <View style={{ flex: 1, marginRight: spacing.sm }}>
                              <View style={styles.badgeRow}>
                                {isFeatured ? (
                                  <Badge label="FEATURED SHOWCASE" variant="gold" size="sm" />
                                ) : isPublished ? (
                                  <Badge label="ELIGIBLE TO PROMOTE" variant="success" size="sm" />
                                ) : (
                                  <Badge label={item.status.toUpperCase()} variant="neutral" size="sm" />
                                )}
                              </View>
                              <Text style={[styles.brandTitle, { color: colors.text.primary }]}>
                                {item.brandName}
                              </Text>
                              <Text style={[styles.oppTitle, { color: colors.slate[400] }]}>
                                {item.opportunityTitle || item.category || 'Franchise Opportunity'}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.statusIconCircle,
                                { backgroundColor: isFeatured ? 'rgba(245, 158, 11, 0.15)' : colors.slate[100] },
                              ]}
                            >
                              <Ionicons
                                name={isFeatured ? 'star' : 'star-outline'}
                                size={22}
                                color={isFeatured ? '#D97706' : colors.slate[400]}
                              />
                            </View>
                          </View>

                          {/* Expiry Info if Featured */}
                          {isFeatured && item.featuredUntil && (
                            <View style={[styles.expiryBox, { backgroundColor: isDark ? colors.slate[800] : colors.slate[50] }]}>
                              <Ionicons name="time-outline" size={16} color="#D97706" />
                              <Text style={[styles.expiryText, { color: colors.text.primary }]}>
                                Featured active until{' '}
                                {new Date(item.featuredUntil).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </Text>
                            </View>
                          )}

                          {/* Action Buttons */}
                          <View style={styles.cardActions}>
                            {isFeatured ? (
                              <Button
                                title="Extend / Renew Showcase"
                                onPress={() => handleOpenPromoteModal(item)}
                                variant="primary"
                                fullWidth
                                size="md"
                              />
                            ) : isPublished ? (
                              <View style={styles.actionButtonGroup}>
                                {remainingSlots > 0 && (
                                  <Button
                                    title="Apply Included Slot"
                                    onPress={() => handleApplyIncludedSlot(item._id)}
                                    variant="outline"
                                    size="md"
                                    loading={isActionLoading}
                                    style={{ flex: 1 }}
                                  />
                                )}
                                <Button
                                  title="Promote Listing"
                                  onPress={() => handleOpenPromoteModal(item)}
                                  variant="primary"
                                  size="md"
                                  style={{ flex: 1 }}
                                />
                              </View>
                            ) : (
                              <Text style={[styles.ineligibleNote, { color: colors.slate[400] }]}>
                                This listing is in {item.status} status. Only published listings are eligible for featured showcase placement.
                              </Text>
                            )}
                          </View>
                        </Card>
                      );
                    })
                  )}
                </View>
              )}

              {/* TAB 2: PACKAGES & PRICING */}
              {activeTab === 'packages' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>
                    À La Carte Showcase Packages
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.slate[400] }]}>
                    Boost your franchise inquiries by up to 4.2x with top marketplace ranking.
                  </Text>

                  {packages.map((pkg) => (
                    <Card key={pkg.id} style={styles.packageCard} padding="lg">
                      <View style={styles.pkgHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pkgName, { color: colors.text.primary }]}>{pkg.name}</Text>
                          <Text style={[styles.pkgDuration, { color: colors.slate[400] }]}>
                            {pkg.durationDays} Days High-Visibility Promotion
                          </Text>
                        </View>
                        <Text style={[styles.pkgPrice, { color: colors.primary.DEFAULT }]}>
                          ₹{pkg.priceINR.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <Text style={[styles.pkgDesc, { color: colors.slate[500] }]}>{pkg.description}</Text>

                      <View style={styles.pkgBenefits}>
                        <View style={styles.benefitRow}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
                          <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                            Homepage placement & top category rank
                          </Text>
                        </View>
                        <View style={styles.benefitRow}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
                          <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                            Gold featured badge & priority search ranking
                          </Text>
                        </View>
                        <View style={styles.benefitRow}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.success.DEFAULT} />
                          <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                            Real-time investor view & lead telemetry
                          </Text>
                        </View>
                      </View>

                      <Button
                        title={`Select Package (₹${pkg.priceINR.toLocaleString('en-IN')})`}
                        onPress={() => {
                          const eligible = listings.find(
                            (l) => l.status === 'published' || l.status === 'PUBLISHED'
                          );
                          if (!eligible) {
                            Alert.alert(
                              'No Published Listing',
                              'Please publish a franchise listing first to purchase a featured package.'
                            );
                            return;
                          }
                          setSelectedListing(eligible);
                          setSelectedPackage(pkg);
                          setPromoteModalVisible(true);
                        }}
                        variant="primary"
                        fullWidth
                        size="md"
                        style={{ marginTop: spacing.md }}
                      />
                    </Card>
                  ))}
                </View>
              )}

              {/* TAB 3: PROMOTION HISTORY */}
              {activeTab === 'history' && (
                <View style={styles.tabContent}>
                  {transactions.length === 0 ? (
                    <EmptyState
                      title="No Promotion Invoices"
                      description="Receipts and transaction records for featured listing purchases will appear here."
                      icon="receipt-outline"
                    />
                  ) : (
                    transactions.map((tx) => (
                      <Card key={tx._id} style={styles.txCard} padding="md">
                        <View style={styles.txHeader}>
                          <View>
                            <Text style={[styles.txTitle, { color: colors.text.primary }]}>
                              Featured Listing Showcase
                            </Text>
                            <Text style={[styles.txDate, { color: colors.slate[400] }]}>
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                          <Badge
                            label={tx.status.toUpperCase()}
                            variant={tx.status === 'captured' ? 'success' : tx.status === 'refunded' ? 'danger' : 'warning'}
                            size="sm"
                          />
                        </View>

                        <View style={styles.txFooter}>
                          <Text style={[styles.txRef, { color: colors.slate[400] }]}>
                            Ref: {tx.gatewayOrderId || tx._id.slice(-8)}
                          </Text>
                          <Text style={[styles.txAmount, { color: colors.text.primary }]}>
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </Card>
                    ))
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Modal: Select Package & Confirm Checkout */}
        <Modal
          visible={promoteModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPromoteModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Promote Opportunity</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.slate[400] }]}>
                    {selectedListing?.brandName}
                  </Text>
                </View>
                <Pressable onPress={() => setPromoteModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.slate[400]} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Choose Showcase Duration</Text>

                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  return (
                    <Pressable
                      key={pkg.id}
                      style={[
                        styles.packageOption,
                        { borderColor: isSelected ? colors.primary.DEFAULT : colors.border },
                        isSelected && { backgroundColor: 'rgba(37, 99, 235, 0.05)' },
                      ]}
                      onPress={() => setSelectedPackage(pkg)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionName, { color: colors.text.primary }]}>{pkg.name}</Text>
                        <Text style={[styles.optionDuration, { color: colors.slate[400] }]}>
                          {pkg.durationDays} Days Featured Placement
                        </Text>
                      </View>
                      <Text style={[styles.optionPrice, { color: colors.primary.DEFAULT }]}>
                        ₹{pkg.priceINR.toLocaleString('en-IN')}
                      </Text>
                    </Pressable>
                  );
                })}

                <View style={[styles.checkoutNotice, { backgroundColor: isDark ? colors.slate[800] : colors.slate[100] }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary.DEFAULT} />
                  <Text style={[styles.noticeText, { color: colors.slate[400] }]}>
                    Payment is processed securely via Razorpay Standard Checkout. Featured placement activates immediately upon cryptographic confirmation.
                  </Text>
                </View>

                <Button
                  title={
                    selectedPackage
                      ? `Proceed to Payment (₹${selectedPackage.priceINR.toLocaleString('en-IN')})`
                      : 'Select a Package'
                  }
                  onPress={handleConfirmPurchase}
                  disabled={!selectedPackage || isProcessing || isVerifying}
                  loading={isProcessing || isVerifying}
                  variant="primary"
                  fullWidth
                  size="lg"
                  style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Razorpay WebView Fallback Modal */}
        <RazorpayWebViewModal
          visible={isWebViewVisible}
          options={webViewOptions}
          onSuccess={handleWebViewSuccess}
          onError={handleWebViewError}
          onCancel={cancelWebView}
        />
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
    paddingBottom: spacing['3xl'],
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
  tabContent: {
    gap: spacing.lg,
  },
  quotaBanner: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  quotaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  quotaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotaTitle: {
    ...typography.bodyBold,
    fontWeight: '700',
    color: '#14243A',
  },
  quotaSubtitle: {
    ...typography.caption,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  listingCard: {
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  brandTitle: {
    ...typography.h2,
    fontWeight: '700',
  },
  oppTitle: {
    ...typography.caption,
    marginTop: 2,
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  expiryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  cardActions: {
    marginTop: spacing.md,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ineligibleNote: {
    ...typography.caption,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  sectionHeading: {
    ...typography.h2,
    fontWeight: '700',
  },
  sectionSub: {
    ...typography.caption,
    marginTop: -spacing.sm,
  },
  packageCard: {
    borderRadius: borderRadius.lg,
  },
  pkgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pkgName: {
    ...typography.h3,
    fontWeight: '700',
  },
  pkgDuration: {
    ...typography.caption,
    marginTop: 2,
  },
  pkgPrice: {
    ...typography.h2,
    fontWeight: '800',
  },
  pkgDesc: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  pkgBenefits: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  benefitText: {
    ...typography.caption,
    fontWeight: '600',
  },
  txCard: {
    borderRadius: borderRadius.md,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txTitle: {
    ...typography.bodyBold,
    fontWeight: '700',
  },
  txDate: {
    ...typography.caption,
    marginTop: 2,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.sm,
  },
  txRef: {
    ...typography.caption,
  },
  txAmount: {
    ...typography.h3,
    fontWeight: '700',
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
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  packageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  optionName: {
    ...typography.bodyBold,
    fontWeight: '700',
  },
  optionDuration: {
    ...typography.caption,
    marginTop: 2,
  },
  optionPrice: {
    ...typography.bodyBold,
    fontWeight: '800',
  },
  checkoutNotice: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 16,
  },
});
