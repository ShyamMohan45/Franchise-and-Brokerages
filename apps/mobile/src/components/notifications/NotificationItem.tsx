import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { AppNotification, NotificationType } from '../../types/notification';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'deal':
      case 'deal_stage_changed':
        return { name: 'git-network-outline', color: colors.primary.DEFAULT, bg: 'rgba(49, 94, 251, 0.1)' };
      case 'commission_due':
      case 'commission_payment_received':
        return { name: 'cash-outline', color: colors.accent.gold, bg: 'rgba(245, 158, 11, 0.1)' };
      case 'document':
      case 'document_approved':
      case 'document_review_requested':
      case 'document_submission':
        return { name: 'document-text-outline', color: colors.accent.teal, bg: 'rgba(21, 157, 139, 0.1)' };
      case 'meeting':
      case 'meeting_invite':
      case 'upcoming_meeting':
        return { name: 'calendar-outline', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' };
      case 'task':
      case 'TASK_ASSIGNED':
      case 'task_reminder':
        return { name: 'checkbox-outline', color: colors.warning.DEFAULT, bg: 'rgba(245, 158, 11, 0.1)' };
      case 'application':
      case 'application_received':
      case 'new_enquiry':
      case 'lead_assigned':
        return { name: 'people-outline', color: colors.accent.teal, bg: 'rgba(21, 157, 139, 0.1)' };
      default:
        return { name: 'notifications-outline', color: colors.slate[500], bg: colors.slate[100] };
    }
  };

  const iconInfo = getNotificationIcon(notification.type);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        !notification.isRead && styles.containerUnread,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
        <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, !notification.isRead && styles.titleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        <Text style={styles.timestamp}>
          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerUnread: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    ...typography.captionBold,
    color: colors.text.secondary,
    fontSize: 13,
    flex: 1,
  },
  titleUnread: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginLeft: spacing.xs,
  },
  message: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
});
