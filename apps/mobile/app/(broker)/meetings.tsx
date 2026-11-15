import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Header, Input, Button, EmptyState, MeetingCard, RoleGuard } from '../../src/components';
import { useMeetings } from '../../src/hooks/useMeetings';
import { MeetingStatus } from '../../src/types/crm';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const MEETING_TYPES = [
  { label: 'Video Call', value: 'video_call' },
  { label: 'Phone Call', value: 'phone_call' },
  { label: 'In Person', value: 'in_person' },
];

export default function BrokerMeetingsScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('ALL');

  // New meeting modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingType, setMeetingType] = useState('video_call');
  const [submitting, setSubmitting] = useState(false);

  const {
    meetings,
    scheduledCount,
    completedCount,
    cancelledCount,
    loading,
    refreshing,
    refresh,
    updateMeetingStatus,
    scheduleMeeting,
    setStatusFilter,
  } = useMeetings();

  const handleSelectStatus = (status: string) => {
    setActiveStatus(status);
    setStatusFilter(status);
  };

  const handleUpdateStatus = async (id: string, status: MeetingStatus) => {
    try {
      await updateMeetingStatus(id, status);
      Alert.alert('Status Updated', `Meeting marked as ${status}`);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Unable to update meeting');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!title.trim() || !agenda.trim()) {
      Alert.alert('Validation Error', 'Title and agenda are required');
      return;
    }

    try {
      setSubmitting(true);
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(11, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(12, 0, 0, 0);

      await scheduleMeeting({
        title: title.trim(),
        agenda: agenda.trim(),
        meetingType,
        scheduledStartTime: startTime.toISOString(),
        scheduledEndTime: endTime.toISOString(),
      });

      setTitle('');
      setAgenda('');
      setIsModalOpen(false);
      Alert.alert('Success', 'Meeting scheduled successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Meetings & Consultations"
          subtitle="Investor Pitches & Brand Intros"
          showBack
          onBack={() => router.back()}
          rightAction={
            <Pressable
              style={styles.addBtn}
              onPress={() => setIsModalOpen(true)}
              hitSlop={8}
            >
              <Ionicons name="add" size={24} color={colors.accent.gold} />
            </Pressable>
          }
        />

        {/* Counter Bar */}
        <View style={styles.counterBar}>
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, { color: colors.accent.teal }]}>
              {scheduledCount}
            </Text>
            <Text style={styles.counterLabel}>Scheduled</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, { color: colors.success.DEFAULT }]}>
              {completedCount}
            </Text>
            <Text style={styles.counterLabel}>Completed</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, { color: colors.text.muted }]}>
              {cancelledCount}
            </Text>
            <Text style={styles.counterLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {STATUS_FILTERS.map((f) => {
              const isSelected = activeStatus === f.value;
              return (
                <Pressable
                  key={f.value}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => handleSelectStatus(f.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Meetings List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
            <Text style={styles.loadingText}>Loading meetings schedule...</Text>
          </View>
        ) : (
          <FlatList
            data={meetings}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <MeetingCard
                meeting={item}
                onUpdateStatus={(status) => handleUpdateStatus(item._id, status)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.accent.gold}
                colors={[colors.accent.gold]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="No Meetings Scheduled"
                description="There are no consultations or discovery sessions in this view."
                actionLabel="Schedule Meeting"
                onAction={() => setIsModalOpen(true)}
              />
            }
          />
        )}

        {/* Schedule Meeting Modal */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Schedule Consultation</Text>
                <Pressable onPress={() => setIsModalOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </Pressable>
              </View>

              <Input
                label="Meeting Title *"
                placeholder="e.g. Initial Discovery Call with Investor"
                value={title}
                onChangeText={setTitle}
              />

              <Input
                label="Agenda / Key Topics *"
                placeholder="Discuss investment parameters, territory exclusivity..."
                value={agenda}
                onChangeText={setAgenda}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.typeLabel}>Meeting Channel</Text>
              <View style={styles.typeRow}>
                {MEETING_TYPES.map((t) => {
                  const isSelected = meetingType === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      style={[styles.typeChip, isSelected && styles.typeChipActive]}
                      onPress={() => setMeetingType(t.value)}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          isSelected && styles.typeTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsModalOpen(false)}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Schedule"
                  variant="primary"
                  loading={submitting}
                  onPress={handleScheduleMeeting}
                  style={{ flex: 1 }}
                />
              </View>
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
    backgroundColor: colors.background,
  },
  addBtn: {
    padding: spacing.xs,
  },
  counterBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  counterItem: {
    alignItems: 'center',
  },
  counterValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 18,
  },
  counterLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  filtersWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  typeLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  typeChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  typeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
  },
});
