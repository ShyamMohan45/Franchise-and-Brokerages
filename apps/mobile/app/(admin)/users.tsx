import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../src/components/Header';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { UserRowCard } from '../../src/components/admin/UserRowCard';
import { AdminService } from '../../src/services/adminService';
import { AdminUserItem } from '../../src/types/admin';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '../../src/theme';

const ROLE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Investors', value: 'investor' },
  { label: 'Brands', value: 'brand_owner' },
  { label: 'Brokers', value: 'broker' },
  { label: 'Admins', value: 'admin' },
];

const AVAILABLE_ROLES = ['investor', 'brand_owner', 'broker', 'admin', 'super_admin'];
const AVAILABLE_STATUSES = ['active', 'pending', 'suspended', 'inactive'];

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit User Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [modalRole, setModalRole] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await AdminService.getUsers({
          role: selectedRole || undefined,
          search: searchQuery.trim() || undefined,
        });
        setUsers(res.users);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedRole, searchQuery]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user: AdminUserItem) => {
    setSelectedUser(user);
    setModalRole(user.role);
    setModalStatus(user.status);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    if (currentUser?.role !== 'super_admin') {
      Alert.alert(
        'Permission Denied',
        'Only Super Administrators have permission to modify user roles and statuses.'
      );
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await AdminService.updateUserRoleAndStatus(selectedUser._id, {
        role: modalRole,
        status: modalStatus,
      });

      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? updated : u))
      );
      Alert.alert('Success', 'User profile updated successfully');
      setSelectedUser(null);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update user');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="User Management"
        subtitle={`${users.length} registered accounts`}
        showBack
        onBack={() => router.back()}
      />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search-outline"
        />
      </View>

      {/* Role Filter Chips */}
      <View style={styles.filterRow}>
        {ROLE_FILTERS.map((f) => {
          const isSelected = selectedRole === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedRole(f.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Users List */}
      {isLoading && !isRefreshing ? (
        <LoadingOverlay visible={true} message="Loading platform users..." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserRowCard user={item} onPress={() => handleOpenEdit(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchUsers(true)}
              colors={[colors.primary.DEFAULT]}
              tintColor={colors.primary.DEFAULT}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Users Found"
              description="No user accounts match your search and filter criteria."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedRole('');
                setSearchQuery('');
              }}
            />
          }
        />
      )}

      {/* Edit Role/Status Modal */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Manage User Account</Text>
                <Text style={styles.modalSubtitle}>{selectedUser?.email}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedUser(null)}
                style={styles.closeBtn}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Role Selection */}
              <Text style={styles.fieldLabel}>ASSIGNED ROLE</Text>
              <View style={styles.optionsWrap}>
                {AVAILABLE_ROLES.map((r) => {
                  const isSelected = modalRole === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.optionChip, isSelected && styles.optionChipActive]}
                      onPress={() => setModalRole(r)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextActive,
                        ]}
                      >
                        {r.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Status Selection */}
              <Text style={styles.fieldLabel}>ACCOUNT STATUS</Text>
              <View style={styles.optionsWrap}>
                {AVAILABLE_STATUSES.map((s) => {
                  const isSelected = modalStatus === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.optionChip, isSelected && styles.optionChipActive]}
                      onPress={() => setModalStatus(s)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextActive,
                        ]}
                      >
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {currentUser?.role !== 'super_admin' && (
                <Text style={styles.permissionWarning}>
                  Notice: Super Administrator privileges are required to modify user roles and statuses.
                </Text>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setSelectedUser(null)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title={isUpdating ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveUser}
                disabled={isUpdating}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
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
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  optionText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.surface,
  },
  permissionWarning: {
    ...typography.caption,
    color: colors.warning.text,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});
