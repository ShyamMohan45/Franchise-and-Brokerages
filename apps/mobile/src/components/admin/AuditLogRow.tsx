import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Badge } from '../Badge';
import { AuditLogItem } from '../../types/admin';

interface AuditLogRowProps {
  log: AuditLogItem;
}

export const AuditLogRow: React.FC<AuditLogRowProps> = ({ log }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary.DEFAULT} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.actionText}>{log.action}</Text>
          <Badge label={log.entityType || 'SYSTEM'} variant="neutral" size="sm" />
        </View>

        <Text style={styles.actorText}>
          By: {log.actorEmail || 'System Process'} ({log.actorRole || 'admin'})
        </Text>

        <Text style={styles.timeText}>
          {new Date(log.createdAt).toLocaleDateString()} at{' '}
          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(49, 94, 251, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    ...typography.captionBold,
    color: colors.text.primary,
    fontSize: 12,
  },
  actorText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 1,
  },
  timeText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },
});
