import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { AdminUserItem } from '../../types/admin';

interface UserRowCardProps {
  user: AdminUserItem;
  onEdit?: () => void;
  onPress?: () => void;
  canEdit?: boolean;
}

export const UserRowCard: React.FC<UserRowCardProps> = ({
  user,
  onEdit,
  onPress,
  canEdit = true,
}) => {
  const handleAction = onPress || onEdit;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'primary';
      case 'broker':
        return 'gold';
      case 'brand_owner':
      case 'business_owner':
        return 'teal';
      default:
        return 'info';
    }
  };

  const cardContent = (
    <Card style={styles.card} padding="md">
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.fullName || 'User Profile'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Badge
            label={user.role?.replace(/_/g, ' ').toUpperCase()}
            variant={getRoleBadgeVariant(user.role) as any}
            size="sm"
          />
          <Badge
            label={user.status?.toUpperCase() || 'ACTIVE'}
            variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'neutral'}
            size="sm"
          />
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.metaText}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
          {user.phone ? ` • ${user.phone}` : ''}
        </Text>

        {canEdit && handleAction && (
          <View style={styles.editBtn}>
            <Ionicons name="create-outline" size={14} color={colors.primary.DEFAULT} />
            <Text style={styles.editBtnText}>Manage</Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (handleAction) {
    return (
      <Pressable onPress={handleAction}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 14,
  },
  userEmail: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 1,
  },
  badgeRow: {
    gap: 4,
    alignItems: 'flex-end',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    ...typography.captionBold,
    color: colors.primary.DEFAULT,
    fontSize: 11,
  },
});
