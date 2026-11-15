import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, Card, Badge, Button, Input, RoleGuard, TaskItem, MeetingCard } from '../../../src/components';
import { CrmService } from '../../../src/services/crmService';
import { Lead, CrmTask, CrmMeeting, LeadStatus } from '../../../src/types/crm';

const LEAD_STATUSES: { label: string; value: LeadStatus }[] = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Meeting Scheduled', value: 'meeting_scheduled' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Converted', value: 'converted' },
  { label: 'Lost', value: 'lost' },
  { label: 'Not Qualified', value: 'not_qualified' },
];

export default function BrokerLeadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [meetings, setMeetings] = useState<CrmMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('new');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await CrmService.getLeadById(id);
      setLead(data.lead);
      setTasks(data.tasks || []);
      setMeetings(data.meetings || []);
      if (data.lead) {
        setSelectedStatus(data.lead.status);
        setInternalNotes(data.lead.internalNotes || '');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      const updated = await CrmService.updateLead(id, {
        status: selectedStatus,
        internalNotes,
      });
      setLead(updated);
      setIsModalOpen(false);
      Alert.alert('Success', 'Lead status updated successfully');
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Unable to update lead');
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
    if (lead?.phone) {
      Linking.openURL(`tel:${lead.phone}`);
    } else {
      Alert.alert('Phone Unavailable', 'No phone number on record for this lead.');
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      Linking.openURL(`mailto:${lead.email}`);
    } else {
      Alert.alert('Email Unavailable', 'No email address on record for this lead.');
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <Badge label="NEW PROSPECT" variant="info" size="sm" />;
      case 'contacted':
        return <Badge label="CONTACTED" variant="warning" size="sm" />;
      case 'qualified':
        return <Badge label="QUALIFIED" variant="success" size="sm" />;
      case 'meeting_scheduled':
        return <Badge label="MEETING" variant="gold" size="sm" />;
      case 'negotiation':
        return <Badge label="NEGOTIATION" variant="gold" size="sm" />;
      case 'converted':
        return <Badge label="CONVERTED" variant="success" size="sm" />;
      case 'lost':
      case 'not_qualified':
        return <Badge label={status.replace('_', ' ').toUpperCase()} variant="danger" size="sm" />;
      default:
        return <Badge label={String(status).toUpperCase()} variant="neutral" size="sm" />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Lead Details" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading lead record...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lead) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Lead Details" showBack onBack={() => router.back()} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Record Not Found</Text>
          <Text style={styles.errorSubtitle}>{error || 'The requested lead does not exist.'}</Text>
          <Button title="Back to Leads" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const isInvestor =
    lead.leadType === 'investor' ||
    lead.leadType === 'franchise_investor' ||
    lead.leadType === 'multi_unit_operator' ||
    lead.leadType === 'institutional';

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={lead.fullName || 'Lead Details'}
          subtitle={lead.email || 'Expansion Prospect'}
          showBack
          onBack={() => router.back()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <Card style={styles.mainCard} padding="lg">
            <View style={styles.cardTopRow}>
              <View style={styles.badgeRow}>
                {getStatusBadge(lead.status)}
                <Badge
                  label={lead.leadType.replace('_', ' ').toUpperCase()}
                  variant={isInvestor ? 'primary' : 'teal'}
                  size="sm"
                />
              </View>
              <Pressable
                style={styles.editStatusBtn}
                onPress={() => setIsModalOpen(true)}
              >
                <Ionicons name="create-outline" size={16} color={colors.accent.gold} />
                <Text style={styles.editStatusText}>Update Status</Text>
              </Pressable>
            </View>

            <Text style={styles.leadName}>{lead.fullName || 'Anonymous Prospect'}</Text>
            {lead.company && <Text style={styles.leadCompany}>Company: {lead.company}</Text>}
            <Text style={styles.leadSource}>
              Source: {lead.source?.toUpperCase() || 'DIRECT APPLICATION'}
            </Text>

            {/* Quick Contact Actions */}
            <View style={styles.contactActions}>
              <Button
                title="Call Lead"
                variant="outline"
                size="sm"
                onPress={handleCall}
                icon={<Ionicons name="call-outline" size={16} color={colors.primary.DEFAULT} />}
                style={styles.contactBtn}
              />
              <Button
                title="Send Email"
                variant="outline"
                size="sm"
                onPress={handleEmail}
                icon={<Ionicons name="mail-outline" size={16} color={colors.primary.DEFAULT} />}
                style={styles.contactBtn}
              />
            </View>
          </Card>

          {/* Investment Criteria & Profile */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Expansion Criteria & Background</Text>

            {(lead.budgetMin || lead.budgetMax) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Budget Range:</Text>
                <Text style={styles.infoValue}>
                  ₹{(lead.budgetMin || 0).toLocaleString('en-IN')} - ₹
                  {(lead.budgetMax || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {(lead.preferredCity || lead.preferredState) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Preferred Region:</Text>
                <Text style={styles.infoValue}>
                  {[lead.preferredCity, lead.preferredState].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}

            {(lead.targetIndustry || lead.preferredIndustry) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Target Industry:</Text>
                <Text style={styles.infoValue}>
                  {lead.targetIndustry || lead.preferredIndustry}
                </Text>
              </View>
            )}

            {lead.investmentTimeline && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Timeline:</Text>
                <Text style={styles.infoValue}>{lead.investmentTimeline}</Text>
              </View>
            )}

            {lead.businessExperience && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience:</Text>
                <Text style={styles.infoValue}>{lead.businessExperience}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Qualification Status:</Text>
              <Text style={[styles.infoValue, { color: colors.accent.teal }]}>
                {lead.qualificationStatus}
              </Text>
            </View>
          </Card>

          {/* Internal Broker Notes */}
          <Card style={styles.sectionCard} padding="lg">
            <View style={styles.notesHeader}>
              <Text style={styles.sectionTitle}>Internal Broker Notes</Text>
              <Pressable onPress={() => setIsModalOpen(true)}>
                <Text style={styles.editNotesText}>Edit Notes</Text>
              </Pressable>
            </View>
            <Text style={styles.notesBody}>
              {lead.internalNotes || 'No notes added yet. Tap to add qualification notes.'}
            </Text>
          </Card>

          {/* Linked Tasks */}
          {tasks.length > 0 && (
            <View style={styles.linkedSection}>
              <Text style={styles.sectionTitle}>Linked CRM Tasks ({tasks.length})</Text>
              {tasks.map((task) => (
                <TaskItem key={task._id} task={task} onToggleComplete={() => {}} />
              ))}
            </View>
          )}

          {/* Linked Meetings */}
          {meetings.length > 0 && (
            <View style={styles.linkedSection}>
              <Text style={styles.sectionTitle}>Scheduled Meetings ({meetings.length})</Text>
              {meetings.map((m) => (
                <MeetingCard key={m._id} meeting={m} />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Update Status Modal */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Lead Status</Text>
                <Pressable onPress={() => setIsModalOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Select Status:</Text>
              <View style={styles.statusChipsGrid}>
                {LEAD_STATUSES.map((s) => {
                  const isSelected = selectedStatus === s.value;
                  return (
                    <Pressable
                      key={s.value}
                      style={[styles.modalStatusChip, isSelected && styles.modalStatusChipActive]}
                      onPress={() => setSelectedStatus(s.value)}
                    >
                      <Text
                        style={[
                          styles.modalStatusText,
                          isSelected && styles.modalStatusTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Internal Notes:</Text>
              <Input
                placeholder="Enter notes about phone calls, investor qualifications..."
                value={internalNotes}
                onChangeText={setInternalNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsModalOpen(false)}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Save Update"
                  variant="primary"
                  loading={updating}
                  onPress={handleUpdateStatus}
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
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.gold,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  editStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editStatusText: {
    ...typography.captionBold,
    color: colors.accent.gold,
  },
  leadName: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: '700',
  },
  leadCompany: {
    ...typography.bodyBold,
    color: colors.text.secondary,
    marginTop: 2,
  },
  leadSource: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  contactBtn: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.muted,
    flex: 1,
  },
  infoValue: {
    ...typography.captionBold,
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editNotesText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
  },
  notesBody: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  linkedSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
  modalLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalStatusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modalStatusChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  modalStatusText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  modalStatusTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
