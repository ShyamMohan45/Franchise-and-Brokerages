import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Card, Badge, Button, RoleGuard } from '../../src/components';
import { useAuth } from '../../src/hooks/useAuth';
import { useSubscription } from '../../src/hooks/useSubscription';

export default function InvestorDashboard() {
  const router = useRouter();
  const { user, investorProfile, logout } = useAuth();
  const { subscription, isRefreshing, refresh } = useSubscription();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const isInvestorPremium =
    subscription?.planId === 'investor_premium' &&
    subscription?.status === 'active' &&
    new Date(subscription.currentPeriodEnd) > new Date();

  return (
    <RoleGuard allowedRoles={['investor']}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeSubtitle}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Investor'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Pressable
                style={styles.profileAvatar}
                onPress={() => router.push('/notifications' as any)}
                hitSlop={8}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.primary.DEFAULT} />
              </Pressable>
              <Pressable
                style={styles.profileAvatar}
                onPress={() => router.push('/profile')}
                hitSlop={8}
              >
                <Ionicons name="person" size={22} color={colors.primary.DEFAULT} />
              </Pressable>
            </View>
          </View>

          {/* Role & Status Card */}
          <Card style={styles.roleCard} padding="md">
            <View style={styles.roleRow}>
              <View style={styles.roleIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.accent.teal} />
              </View>
              <View style={styles.roleTextContainer}>
                <View style={styles.badgeLine}>
                  <Text style={styles.roleTitle}>Investor Portal</Text>
                  <Badge
                    label={isInvestorPremium ? 'PRO INTELLIGENCE' : 'ACTIVE INVESTOR'}
                    variant={isInvestorPremium ? 'success' : 'teal'}
                    size="sm"
                  />
                </View>
                <Text style={styles.roleEmail}>{user?.email}</Text>
              </View>
            </View>
          </Card>

          {/* Investor Premium Membership Callout / Banner */}
          {isInvestorPremium ? (
            <Card style={styles.premiumActiveBanner} padding="md">
              <View style={styles.premiumBannerRow}>
                <View style={styles.premiumSparkleCircle}>
                  <Ionicons name="shield-checkmark" size={22} color={colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.premiumBannerTitle}>Investor Pro Active</Text>
                    <Badge label="VERIFIED MEMBER" variant="success" size="sm" />
                  </View>
                  <Text style={styles.premiumBannerDesc}>
                    5-Vector compatibility scores, FDD due diligence analytics, and priority introductions are enabled.
                  </Text>
                  {subscription?.currentPeriodEnd && (
                    <Text style={styles.premiumExpiryText}>
                      Renews:{' '}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
              </View>
              <Button
                title="Manage Membership"
                onPress={() => router.push('/(investor)/subscription')}
                variant="outline"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          ) : (
            <Card style={styles.upgradeBanner} padding="md">
              <View style={styles.upgradeBannerRow}>
                <View style={styles.upgradeIconCircle}>
                  <Ionicons name="sparkles" size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upgradeBannerTitle}>Upgrade to Investor Premium</Text>
                  <Text style={styles.upgradeBannerDesc}>
                    Unlock proprietary AI match scores, full FDD unit economics benchmarks, and priority introduction queues.
                  </Text>
                </View>
              </View>
              <Button
                title="Explore Pro Membership (₹4,999/mo)"
                onPress={() => router.push('/(investor)/subscription')}
                variant="primary"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          )}

          {/* Investor Profile Summary (Real backend fields) */}
          <Card style={styles.metricsCard} padding="lg">
            <Text style={styles.sectionTitle}>Investment Profile</Text>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Investor Type</Text>
                <Text style={styles.profileValue}>
                  {investorProfile?.investorType || 'Individual / Family Office'}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Target Timeline</Text>
                <Text style={styles.profileValue}>
                  {investorProfile?.investmentTimeline || 'Immediate (0 - 3 months)'}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Liquid Capital</Text>
                <Text style={styles.profileValue}>
                  {investorProfile?.liquidCapital ? `₹${investorProfile.liquidCapital.toLocaleString('en-IN')}` : 'Ready for Deployment'}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Preferred Industries</Text>
                <Text style={styles.profileValue}>
                  {investorProfile?.targetIndustries?.join(', ') || 'F&B, Retail, Healthcare'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Navigation Quick Links */}
          <Text style={styles.modulesTitle}>Investor Modules</Text>
          <View style={styles.actionGrid}>
            {/* Smart Matches */}
            <Pressable onPress={() => router.push('/(investor)/matching')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="sparkles" size={22} color={colors.primary.DEFAULT} />
                  <Badge label="AI MATCH" variant="primary" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Smart Matches & Scoring</Text>
                <Text style={styles.actionDesc}>
                  Personalized 5-vector compatibility scores across verified franchise opportunities
                </Text>
              </Card>
            </Pressable>

            {/* Introductions Pipeline */}
            <Pressable onPress={() => router.push('/(investor)/introductions')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="mail-open-outline" size={22} color={colors.accent.teal} />
                  <Badge label="PIPELINE" variant="teal" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Introductions Pipeline</Text>
                <Text style={styles.actionDesc}>
                  Track mutual consents, verified founder contact details & Deal Room progressions
                </Text>
              </Card>
            </Pressable>

            {/* Franchise Marketplace */}
            <Pressable onPress={() => router.push('/(investor)/marketplace')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="search" size={22} color={colors.primary.DEFAULT} />
                  <Badge label="CATALOG" variant="success" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Franchise Marketplace</Text>
                <Text style={styles.actionDesc}>Browse verified franchise listings and financial benchmarks</Text>
              </Card>
            </Pressable>

            {/* Saved Opportunities */}
            <Pressable onPress={() => router.push('/(investor)/saved')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="heart-outline" size={22} color={colors.danger.DEFAULT} />
                  <Badge label="SAVED" variant="primary" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Saved Opportunities</Text>
                <Text style={styles.actionDesc}>Access your shortlisted franchise investments</Text>
              </Card>
            </Pressable>

            {/* My Enquiries */}
            <Pressable onPress={() => router.push('/(investor)/enquiries')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="chatbubbles-outline" size={22} color={colors.primary.DEFAULT} />
                  <Badge label="INQUIRIES" variant="primary" size="sm" />
                </View>
                <Text style={styles.actionTitle}>My Enquiries</Text>
                <Text style={styles.actionDesc}>Track responses and diligence status on submitted brands</Text>
              </Card>
            </Pressable>

            {/* Deal Rooms & Due Diligence */}
            <Pressable onPress={() => router.push('/(deal-room)' as any)}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="briefcase-outline" size={22} color={colors.accent.teal} />
                  <Badge label="PRIVATE" variant="teal" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Deal Rooms & Due Diligence</Text>
                <Text style={styles.actionDesc}>Review FDD, legal audits, private documents & sign contracts</Text>
              </Card>
            </Pressable>

            {/* Investor Membership & Invoices */}
            <Pressable onPress={() => router.push('/(investor)/subscription')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="card-outline" size={22} color={colors.primary.DEFAULT} />
                  <Badge
                    label={isInvestorPremium ? 'PRO' : 'FREE'}
                    variant={isInvestorPremium ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>
                <Text style={styles.actionTitle}>Investor Membership & Invoices</Text>
                <Text style={styles.actionDesc}>
                  Manage subscription tier, compare intelligence features & view payment receipts
                </Text>
              </Card>
            </Pressable>
          </View>

          {/* Account Actions */}
          <View style={styles.accountActions}>
            <Button
              title="View Account Profile"
              onPress={() => router.push('/profile')}
              variant="outline"
              fullWidth
              size="md"
              style={styles.profileButton}
            />

            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="danger"
              fullWidth
              size="md"
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeSubtitle: {
    ...typography.caption,
    color: colors.slate[500],
  },
  userName: {
    ...typography.h1,
    color: colors.navy[900],
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[200],
  },
  roleCard: {
    backgroundColor: colors.navy[900],
    marginBottom: spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roleTextContainer: {
    flex: 1,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleTitle: {
    ...typography.h3,
    color: colors.white,
  },
  roleEmail: {
    ...typography.caption,
    color: colors.slate[400],
  },
  premiumActiveBanner: {
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  premiumBannerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  premiumSparkleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBannerTitle: {
    ...typography.bodyBold,
    fontWeight: '700',
    color: colors.navy[900],
  },
  premiumBannerDesc: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
    lineHeight: 16,
  },
  premiumExpiryText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.slate[400],
    marginTop: 4,
  },
  upgradeBanner: {
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  upgradeBannerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  upgradeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBannerTitle: {
    ...typography.bodyBold,
    fontWeight: '700',
    color: colors.navy[900],
  },
  upgradeBannerDesc: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
    lineHeight: 16,
  },
  metricsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy[900],
    marginBottom: spacing.md,
  },
  profileGrid: {
    gap: spacing.md,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
    paddingBottom: spacing.sm,
  },
  profileLabel: {
    ...typography.caption,
    color: colors.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  profileValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.navy[900],
  },
  modulesTitle: {
    ...typography.h3,
    color: colors.navy[900],
    marginBottom: spacing.sm,
  },
  actionGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.navy[900],
    marginTop: spacing.xs,
  },
  actionDesc: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
  },
  accountActions: {
    gap: spacing.sm,
  },
  profileButton: {
    marginBottom: spacing.xs,
  },
});
