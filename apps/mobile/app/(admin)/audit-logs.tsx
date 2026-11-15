import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { AuditLogRow } from '../../src/components/admin/AuditLogRow';
import { AdminService } from '../../src/services/adminService';
import { AuditLogItem } from '../../src/types/admin';
import { colors, spacing, typography } from '../../src/theme';

export default function AdminAuditLogsScreen() {
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await AdminService.getAuditLogs({ limit: 50 });
      setLogs(res.logs);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Security Audit Logs"
        subtitle="Platform Access & Mutation Audit Trail"
        showBack
        onBack={() => router.back()}
      />

      {isLoading && !isRefreshing ? (
        <LoadingOverlay visible={true} message="Loading audit trail..." />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <AuditLogRow log={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchLogs(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Audit Logs"
              description="No platform mutations or security events recorded yet."
              actionLabel="Refresh"
              onAction={() => fetchLogs(true)}
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
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
