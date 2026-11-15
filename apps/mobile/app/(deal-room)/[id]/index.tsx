import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Badge, Button, RoleGuard } from '../../../src/components';
import { DealRoomService } from '../../../src/services/dealRoomService';
import { DealRoom, DealMilestone } from '../../../src/types/dealRoom';

export default function DealRoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [room, setRoom] = useState<DealRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async (isRefresh = false) => {
    if (!id) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await DealRoomService.getDealRoomById(id);
      setRoom(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load deal room details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const onRefresh = () => fetchRoom(true);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Deal Room" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent.teal} />
          <Text style={styles.loadingText}>Initializing secure workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Deal Room" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Access Restricted</Text>
          <Text style={styles.errorSubtitle}>
            {error || 'You do not have authorization to view this private workspace.'}
          </Text>
          <Button
            title="Back to Deal Rooms"
            variant="outline"
            onPress={() => router.back()}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const completionPct = room.completionPercentage || 0;
  const milestones: DealMilestone[] = room.dealMilestones || [];

  return (
    <RoleGuard
      allowedRoles={[
        'investor',
        'business_owner',
        'brand_owner',
        'broker',
        'admin',
        'super_admin',
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={room.franchiseListing?.brandName || 'Deal Room'}
          subtitle={room.roomName || 'Confidential Due Diligence'}
          showBack
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.teal}
              colors={[colors.accent.teal]}
            />
          }
        >
          {/* Main Workspace Card */}
          <Card style={styles.mainCard} padding="lg">
            <View style={styles.topRow}>
              <View style={styles.badgeRow}>
                <Badge
                  label={room.stage.replace(/_/g, ' ').toUpperCase()}
                  variant="gold"
                  size="sm"
                />
                <Badge
                  label={room.ndaSigned ? 'NDA EXECUTED' : 'NDA PENDING'}
                  variant={room.ndaSigned ? 'success' : 'warning'}
                  size="sm"
                />
              </View>
            </View>

            <Text style={styles.roomTitle}>{room.roomName}</Text>
            <Text style={styles.territoryText}>
              <Ionicons name="location-outline" size={14} color={colors.accent.teal} />{' '}
              {room.targetTerritory || 'Prime Metro Expansion Zone'}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Due Diligence Audit Progress</Text>
                <Text style={styles.progressPercent}>{completionPct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, completionPct))}%` },
                    completionPct === 100 && { backgroundColor: colors.success.DEFAULT },
                  ]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {room.outstandingCount !== undefined ? `${room.outstandingCount} statutory items pending review` : '11 audit categories initialized'}
              </Text>
            </View>
          </Card>

          {/* 4 Feature Modules */}
          <Text style={styles.sectionHeading}>Workspace Modules</Text>

          <View style={styles.modulesGrid}>
            {/* 1. Documents Vault */}
            <Pressable
              style={styles.moduleCardWrapper}
              onPress={() =>
                router.push({
                  pathname: '/(deal-room)/[id]/documents',
                  params: { id: room._id },
                } as any)
              }
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(49, 94, 251, 0.1)' }]}>
                  <Ionicons name="folder-open-outline" size={24} color={colors.primary.DEFAULT} />
                </View>
                <Text style={styles.moduleTitle}>Document Vault</Text>
                <Text style={styles.moduleSubtitle}>
                  FDD, audited P&Ls, drafts & private storage
                </Text>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleBadge}>
                    {room.documentsCount !== undefined ? `${room.documentsCount} Files` : 'Vault Access'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            {/* 2. Due Diligence Checklist */}
            <Pressable
              style={styles.moduleCardWrapper}
              onPress={() =>
                router.push({
                  pathname: '/(deal-room)/[id]/due-diligence',
                  params: { id: room._id },
                } as any)
              }
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(21, 157, 139, 0.1)' }]}>
                  <Ionicons name="checkbox-outline" size={24} color={colors.accent.teal} />
                </View>
                <Text style={styles.moduleTitle}>Due Diligence</Text>
                <Text style={styles.moduleSubtitle}>
                  11 statutory checks, audit notes & evidence
                </Text>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleBadge}>{completionPct}% Complete</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            {/* 3. Deal Messages */}
            <Pressable
              style={styles.moduleCardWrapper}
              onPress={() =>
                router.push({
                  pathname: '/(deal-room)/[id]/messages',
                  params: { id: room._id },
                } as any)
              }
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#6366F1" />
                </View>
                <Text style={styles.moduleTitle}>Communications</Text>
                <Text style={styles.moduleSubtitle}>
                  Deal dialogue, Q&A & confidential broker notes
                </Text>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleBadge}>Live Feed</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>

            {/* 4. Agreements & E-Sign */}
            <Pressable
              style={styles.moduleCardWrapper}
              onPress={() =>
                router.push({
                  pathname: '/(deal-room)/[id]/agreements',
                  params: { id: room._id },
                } as any)
              }
            >
              <Card style={styles.moduleCard} padding="md">
                <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="document-text-outline" size={24} color={colors.accent.gold} />
                </View>
                <Text style={styles.moduleTitle}>E-Signature</Text>
                <Text style={styles.moduleSubtitle}>
                  Franchise agreement execution & audit log
                </Text>
                <View style={styles.moduleFooter}>
                  <Text style={styles.moduleBadge}>
                    {room.signatureRequest?.status === 'completed' ? 'Executed' : 'Out For Signature'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
              </Card>
            </Pressable>
          </View>

          {/* Deal Milestones */}
          {milestones.length > 0 && (
            <Card style={styles.milestonesCard} padding="lg">
              <Text style={styles.cardHeading}>Transaction Milestones</Text>
              <View style={styles.milestonesList}>
                {milestones.map((m, idx) => (
                  <View key={idx} style={styles.milestoneItem}>
                    <View
                      style={[
                        styles.milestoneDot,
                        m.completed ? styles.milestoneDotDone : styles.milestoneDotPending,
                      ]}
                    >
                      {m.completed ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.milestoneNumber}>{idx + 1}</Text>
                      )}
                    </View>
                    <View style={styles.milestoneTextContainer}>
                      <Text
                        style={[
                          styles.milestoneTitle,
                          m.completed && styles.milestoneTitleDone,
                        ]}
                      >
                        {m.title}
                      </Text>
                      {m.completed && m.completedAt && (
                        <Text style={styles.milestoneDate}>
                          Completed on {new Date(m.completedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Authorized Participants */}
          <Card style={styles.participantsCard} padding="lg">
            <Text style={styles.cardHeading}>Workspace Stakeholders</Text>

            <View style={styles.participantRow}>
              <Ionicons name="person-circle-outline" size={24} color={colors.primary.DEFAULT} />
              <View style={styles.participantDetails}>
                <Text style={styles.participantName}>
                  {room.investor?.fullName || 'Assigned Investor'}
                </Text>
                <Text style={styles.participantMeta}>
                  Investor • {room.investor?.email || 'Confidential'}
                </Text>
              </View>
              <Badge label="BUYER" variant="primary" size="sm" />
            </View>

            <View style={styles.participantRow}>
              <Ionicons name="business-outline" size={24} color={colors.accent.teal} />
              <View style={styles.participantDetails}>
                <Text style={styles.participantName}>
                  {(room.franchisor || room.businessOwner)?.fullName || 'Brand Partner'}
                </Text>
                <Text style={styles.participantMeta}>
                  Brand Owner • {(room.franchisor || room.businessOwner)?.email || 'Confidential'}
                </Text>
              </View>
              <Badge label="SELLER" variant="teal" size="sm" />
            </View>

            <View style={styles.participantRow}>
              <Ionicons name="briefcase-outline" size={24} color={colors.accent.gold} />
              <View style={styles.participantDetails}>
                <Text style={styles.participantName}>
                  {(room.assignedBroker || room.broker)?.fullName || 'Assigned Broker'}
                </Text>
                <Text style={styles.participantMeta}>
                  Licensed Broker • {(room.assignedBroker || room.broker)?.email || 'Brokerage'}
                </Text>
              </View>
              <Badge label="BROKER" variant="gold" size="sm" />
            </View>
          </Card>

          {/* Legal Disclaimer Banner */}
          <View style={styles.disclaimerBanner}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent.teal} />
            <Text style={styles.disclaimerBannerText}>
              All document exchanges and diligence evaluations are conducted under execute NDAs.
              Private files are encrypted in storage and accessible only by verified participants.
            </Text>
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
  mainCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.teal,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roomTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  territoryText: {
    ...typography.captionBold,
    color: colors.accent.teal,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    ...typography.captionBold,
    color: colors.text.secondary,
  },
  progressPercent: {
    ...typography.bodyBold,
    color: colors.accent.teal,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate[200],
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent.teal,
  },
  progressSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  moduleCardWrapper: {
    width: '47.5%',
  },
  moduleCard: {
    height: 160,
    justifyContent: 'space-between',
  },
  moduleIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  moduleSubtitle: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  moduleBadge: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 11,
  },
  milestonesCard: {
    marginBottom: spacing.lg,
  },
  cardHeading: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  milestonesList: {
    gap: spacing.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  milestoneDotDone: {
    backgroundColor: colors.success.DEFAULT,
  },
  milestoneDotPending: {
    backgroundColor: colors.slate[200],
  },
  milestoneNumber: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.text.muted,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.primary,
  },
  milestoneTitleDone: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  milestoneDate: {
    ...typography.caption,
    fontSize: 11,
    color: colors.success.text,
    marginTop: 2,
  },
  participantsCard: {
    marginBottom: spacing.lg,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 13,
  },
  participantMeta: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(21, 157, 139, 0.08)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(21, 157, 139, 0.2)',
  },
  disclaimerBannerText: {
    ...typography.caption,
    color: colors.accent.tealDark,
    lineHeight: 18,
    flex: 1,
  },
});
