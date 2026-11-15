import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/Header';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { NotificationItem } from '../../src/components/notifications/NotificationItem';
import { useNotifications } from '../../src/hooks/useNotifications';
import { AppNotification } from '../../src/types/notification';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (err) {
        // quiet error
      }
    }

    // Contextual routing based on notification metadata
    const entityType = notification.metadata?.entityType || notification.type;
    const entityId = notification.metadata?.entityId;

    if (entityId) {
      if (entityType.includes('deal') || entityType.includes('deal_room')) {
        router.push({
          pathname: '/deal-room/[id]',
          params: { id: entityId },
        });
      } else if (entityType.includes('commission')) {
        router.push({
          pathname: '/(broker)/commission-details/[id]',
          params: { id: entityId },
        });
      } else if (entityType.includes('lead')) {
        router.push({
          pathname: '/(broker)/lead/[id]',
          params: { id: entityId },
        });
      }
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not mark all notifications as read');
    }
  };

  const renderHeaderRight = () => (
    <View style={styles.headerActions}>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => router.push('/notifications/preferences')}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={22} color={colors.navy[900]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        showBack
        onBack={() => router.back()}
        rightAction={renderHeaderRight()}
      />

      {isLoading && !isRefreshing ? (
        <LoadingOverlay visible={true} message="Loading notifications..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item)}
              onMarkAsRead={() => markAsRead(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Notifications"
              description="You're completely caught up! We'll alert you about deals, leads, and messages here."
              actionLabel="Refresh"
              onAction={refresh}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.DEFAULT + '15',
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  settingsBtn: {
    padding: 4,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
