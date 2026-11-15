import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Badge } from '../Badge';
import { CrmTask } from '../../types/crm';

interface TaskItemProps {
  task: CrmTask;
  onToggleComplete: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete }) => {
  const isCompleted = task.status === 'completed';

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const isOverdue =
    !isCompleted && new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      <Pressable onPress={onToggleComplete} style={styles.checkboxArea} hitSlop={8}>
        <Ionicons
          name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isCompleted ? colors.success.DEFAULT : colors.slate[400]}
        />
      </Pressable>

      <View style={styles.textContainer}>
        <Text
          style={[styles.titleText, isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text style={styles.descText} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.dueRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isOverdue ? colors.error : colors.slate[400]}
            />
            <Text
              style={[
                styles.dueText,
                isOverdue && { color: colors.error, fontWeight: '700' },
              ]}
            >
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <Badge
            label={task.priority.toUpperCase()}
            variant={getPriorityVariant(task.priority)}
            size="sm"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  containerCompleted: {
    backgroundColor: colors.slate[50],
    borderColor: colors.slate[100],
    opacity: 0.8,
  },
  checkboxArea: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    ...typography.bodyBold,
    color: colors.navy[900],
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.slate[400],
  },
  descText: {
    ...typography.caption,
    color: colors.slate[500],
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
});
