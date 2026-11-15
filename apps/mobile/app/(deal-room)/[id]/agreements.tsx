import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Badge, RoleGuard, AgreementSignCard } from '../../../src/components';
import { DealRoomService } from '../../../src/services/dealRoomService';
import { useAuth } from '../../../src/hooks/useAuth';
import { DealRoom } from '../../../src/types/dealRoom';

export default function DealRoomAgreementsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [room, setRoom] = useState<DealRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(
    async (isRefresh = false) => {
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
        setError(err?.message || 'Failed to load agreement details');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const handleConfirmSign = () => {
    Alert.alert(
      'Electronic Agreement Acknowledgment',
      'By proceeding, you electronically acknowledge and sign this franchise agreement. Your identity, timestamp, and network IP will be permanently recorded in the audit trail. (Commercial platform execution — does not replace statutory stamping/notarization where mandated).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Now',
          onPress: async () => {
            if (!id) return;
            try {
              setIsSigning(true);
              const updated = await DealRoomService.signAgreement(id);
              setRoom(updated);
              Alert.alert('Agreement Signed', 'Your signature has been recorded in the deal room audit log.');
            } catch (err: any) {
              Alert.alert('Signing Failed', err?.message || 'Could not sign agreement');
            } finally {
              setIsSigning(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Agreements & Signing" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading agreement details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Agreements & Signing" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Record Not Found</Text>
          <Text style={styles.errorSubtitle}>{error || 'Agreement data is unavailable.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          title="Agreements & Signing"
          subtitle={room.roomName || 'Contract Execution'}
          showBack
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRoom(true)}
              tintColor={colors.accent.gold}
              colors={[colors.accent.gold]}
            />
          }
        >
          {/* Main Agreement Sign Card */}
          {room.signatureRequest ? (
            <AgreementSignCard
              signatureRequest={room.signatureRequest}
              currentUserId={user?.id || user?._id || ''}
              onSign={handleConfirmSign}
              isSigning={isSigning}
            />
          ) : (
            <Card style={styles.emptyCard} padding="lg">
              <Ionicons name="document-text-outline" size={36} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>Agreement Drafting in Progress</Text>
              <Text style={styles.emptyDesc}>
                The master agreement is currently being drafted by the brokerage legal counsel. Once
                finalized, it will be dispatched for e-signature.
              </Text>
            </Card>
          )}

          {/* Legal Counsel Execution Summary */}
          <Card style={styles.summaryCard} padding="lg">
            <Text style={styles.summaryTitle}>Transaction Legal Architecture</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Territory Exclusivity:</Text>
              <Text style={styles.summaryValue}>{room.targetTerritory || 'Prime Metro'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Transaction Stage:</Text>
              <Text style={styles.summaryValue}>{room.stage.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mutual NDA:</Text>
              <Text style={[styles.summaryValue, { color: colors.success.DEFAULT }]}>
                {room.ndaSigned ? 'Executed & Logged' : 'Pending'}
              </Text>
            </View>
          </Card>

          {/* Disclaimers */}
          <View style={styles.disclaimerContainer}>
            <Ionicons name="shield-outline" size={20} color={colors.accent.goldDark} />
            <Text style={styles.disclaimerText}>
              Important Notice: FranchiseBridge agreement workflows capture cryptographic
              signatures, IP addresses, and participant timestamps. E-signatures serve as
              commercial intent confirmation. Full legal execution should follow standard statutory
              stamp duty and notarization guidelines where mandated by local jurisdictions.
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  summaryValue: {
    ...typography.captionBold,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accent.goldLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent.gold,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.accent.goldDark,
    lineHeight: 18,
    flex: 1,
    fontSize: 11,
  },
});
