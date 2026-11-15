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
import { Header, Input, Button, EmptyState, TaskItem, RoleGuard } from '../../src/components';
import { useTasks } from '../../src/hooks/useTasks';
import { TaskPriority } from '../../src/types/crm';

const FILTER_TABS = [
  { label: 'All Tasks', type: undefined, status: 'ALL' },
  { label: 'Today', type: 'today' as const, status: 'pending' },
  { label: 'Overdue', type: 'overdue' as const, status: 'pending' },
  { label: 'Upcoming', type: 'upcoming' as const, status: 'pending' },
  { label: 'Completed', type: undefined, status: 'completed' },
];

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export default function BrokerTasksScreen() {
  const router = useRouter();
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // New task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const {
    tasks,
    pendingCount,
    completedCount,
    overdueCount,
    loading,
    refreshing,
    refresh,
    toggleTaskStatus,
    createTask,
    setStatusFilter,
    setFilterType,
  } = useTasks();

  const handleSelectTab = (idx: number) => {
    setActiveTabIdx(idx);
    const tab = FILTER_TABS[idx];
    setStatusFilter(tab.status);
    setFilterType(tab.type);
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTaskStatus(id);
    } catch (err: any) {
      Alert.alert('Action Failed', err?.message || 'Unable to update task');
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        dueDate: tomorrow.toISOString(),
      });

      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setIsModalOpen(false);
      Alert.alert('Success', 'Task created successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['broker', 'admin', 'super_admin']}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Tasks & Action Items"
          subtitle="Follow-ups & Diligence Checklists"
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

        {/* Status Counters */}
        <View style={styles.counterBar}>
          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{pendingCount}</Text>
            <Text style={styles.counterLabel}>Pending</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, { color: colors.error }]}>{overdueCount}</Text>
            <Text style={styles.counterLabel}>Overdue</Text>
          </View>
          <View style={styles.counterDivider} />
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, { color: colors.success.DEFAULT }]}>{completedCount}</Text>
            <Text style={styles.counterLabel}>Completed</Text>
          </View>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {FILTER_TABS.map((tab, idx) => {
              const isSelected = activeTabIdx === idx;
              return (
                <Pressable
                  key={tab.label}
                  style={[styles.tabChip, isSelected && styles.tabChipActive]}
                  onPress={() => handleSelectTab(idx)}
                >
                  <Text
                    style={[
                      styles.tabChipText,
                      isSelected && styles.tabChipTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Tasks List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
            <Text style={styles.loadingText}>Loading CRM tasks...</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggleComplete={() => handleToggleTask(item._id)}
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
                icon="checkbox-outline"
                title="No Tasks Found"
                description="All tasks are up to date in this view. Tap '+' to create a new action item."
                actionLabel="Create Task"
                onAction={() => setIsModalOpen(true)}
              />
            }
          />
        )}

        {/* New Task Modal */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Action Item</Text>
                <Pressable onPress={() => setIsModalOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </Pressable>
              </View>

              <Input
                label="Task Title *"
                placeholder="e.g. Call investor regarding FDD review"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />

              <Input
                label="Description"
                placeholder="Key talking points or action items..."
                value={taskDesc}
                onChangeText={setTaskDesc}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.priorityLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = taskPriority === p.value;
                  return (
                    <Pressable
                      key={p.value}
                      style={[styles.priorityChip, isSelected && styles.priorityChipActive]}
                      onPress={() => setTaskPriority(p.value)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected && styles.priorityTextActive,
                        ]}
                      >
                        {p.label}
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
                  title="Create"
                  variant="primary"
                  loading={submitting}
                  onPress={handleCreateTask}
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
  tabsWrapper: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  tabChipText: {
    ...typography.captionBold,
    color: colors.text.muted,
  },
  tabChipTextActive: {
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
  priorityLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  priorityChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  priorityText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priorityTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
  },
});
