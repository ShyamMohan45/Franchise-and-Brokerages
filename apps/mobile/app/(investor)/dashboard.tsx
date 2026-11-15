import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Card, Badge, Button, RoleGuard } from '../../src/components';
import { useAuth } from '../../src/hooks/useAuth';

export default function InvestorDashboard() {
  const router = useRouter();
  const { user, investorProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <RoleGuard allowedRoles={['investor']}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          {/* Role Status Banner */}
          <Card style={styles.roleCard} padding="md">
            <View style={styles.roleRow}>
              <View style={styles.roleIcon}>
                <Ionicons name="wallet-outline" size={24} color={colors.accent.teal} />
              </View>
              <View style={styles.roleTextContainer}>
                <View style={styles.badgeLine}>
                  <Text style={styles.roleTitle}>Investor Portal</Text>
                  <Badge label="ACTIVE INVESTOR" variant="success" size="sm" />
                </View>
                <Text style={styles.roleEmail}>{user?.email}</Text>
              </View>
            </View>
          </Card>

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
            <Pressable onPress={() => router.push('/(investor)/marketplace')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="search" size={22} color={colors.primary.DEFAULT} />
                  <Badge label="ACTIVE" variant="success" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Franchise Marketplace</Text>
                <Text style={styles.actionDesc}>Browse verified franchise listings and financial benchmarks</Text>
              </Card>
            </Pressable>

            <Pressable onPress={() => router.push('/(investor)/saved')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="heart-outline" size={22} color={colors.danger.DEFAULT} />
                  <Badge label="ACTIVE" variant="primary" size="sm" />
                </View>
                <Text style={styles.actionTitle}>Saved Opportunities</Text>
                <Text style={styles.actionDesc}>Access your shortlisted franchise investments</Text>
              </Card>
            </Pressable>

            <Pressable onPress={() => router.push('/(investor)/enquiries')}>
              <Card style={styles.actionCard} padding="md">
                <View style={styles.actionHeader}>
                  <Ionicons name="chatbubbles-outline" size={22} color={colors.primary.DEFAULT} />
                  <Badge label="ACTIVE" variant="primary" size="sm" />
                </View>
                <Text style={styles.actionTitle}>My Enquiries</Text>
                <Text style={styles.actionDesc}>Track responses and diligence status on submitted brands</Text>
              </Card>
            </Pressable>

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
