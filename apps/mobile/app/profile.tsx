import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../src/theme';
import { Card, Badge, Button, Input, Header } from '../src/components';
import { useAuth } from '../src/hooks/useAuth';
import { AuthService } from '../src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, businessProfile, investorProfile, logout, refreshProfile } = useAuth();

  // Change Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleChangePassword = async () => {
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});
    setPasswordSuccess(null);

    try {
      const msg = await AuthService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(msg || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordErrors({ general: err.message || 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'gold';
      case 'investor':
        return 'primary';
      case 'broker':
        return 'gold';
      case 'brand_owner':
      case 'business_owner':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FB';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Account Profile"
        subtitle="Identity & Security"
        showBack
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Identity Card */}
          <Card style={styles.identityCard} padding="lg">
            <View style={styles.avatarRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.identityDetails}>
                <Text style={styles.fullName}>{user?.fullName || 'Authenticated User'}</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
                <View style={styles.badgeWrap}>
                  <Badge
                    label={user?.role?.toUpperCase().replace('_', ' ') || 'USER'}
                    variant={getRoleBadgeVariant(user?.role)}
                    size="sm"
                  />
                  <Badge
                    label={user?.emailVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                    variant={user?.emailVerified ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </View>
            </View>
          </Card>

          {/* Account Details (Actual Backend Fields) */}
          <Card style={styles.sectionCard} padding="lg">
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>User ID</Text>
              <Text style={styles.fieldValueMono}>{user?.id || 'N/A'}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Full Legal Name</Text>
              <Text style={styles.fieldValue}>{user?.fullName || 'Not provided'}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Registered Email</Text>
              <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>{user?.phone || 'Not provided'}</Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Account Status</Text>
              <Text style={styles.fieldValue}>
                {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
              </Text>
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Email Verification Status</Text>
              <Text style={styles.fieldValue}>
                {user?.emailVerified ? 'Confirmed & Active' : 'Unverified (Action Required)'}
              </Text>
            </View>

            {user?.createdAt && (
              <View style={[styles.fieldItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.fieldLabel}>Registration Date</Text>
                <Text style={styles.fieldValue}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </Card>

          {/* Role Profile Details (if present) */}
          {businessProfile && (
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Brand Enterprise Profile</Text>

              <View style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>Brand Name</Text>
                <Text style={styles.fieldValue}>{businessProfile.brandName || 'N/A'}</Text>
              </View>

              <View style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>Industry Category</Text>
                <Text style={styles.fieldValue}>{businessProfile.category || 'N/A'}</Text>
              </View>

              <View style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>Headquarters</Text>
                <Text style={styles.fieldValue}>{businessProfile.headquarters || 'N/A'}</Text>
              </View>

              <View style={[styles.fieldItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.fieldLabel}>Approval Status</Text>
                <Text style={styles.fieldValue}>
                  {businessProfile.approvalStatus?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </Card>
          )}

          {investorProfile && (
            <Card style={styles.sectionCard} padding="lg">
              <Text style={styles.sectionTitle}>Investor Profile Specifications</Text>

              <View style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>Investor Classification</Text>
                <Text style={styles.fieldValue}>{investorProfile.investorType || 'Individual'}</Text>
              </View>

              <View style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>Investment Timeline</Text>
                <Text style={styles.fieldValue}>{investorProfile.investmentTimeline || 'Flexible'}</Text>
              </View>

              <View style={[styles.fieldItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.fieldLabel}>Target Industries</Text>
                <Text style={styles.fieldValue}>
                  {investorProfile.targetIndustries?.join(', ') || 'All sectors'}
                </Text>
              </View>
            </Card>
          )}

          {/* Change Password Card */}
          <Card style={styles.sectionCard} padding="lg">
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Account Security</Text>
                <Text style={styles.sectionDesc}>Update your account login password</Text>
              </View>
              <Pressable
                onPress={() => setShowPasswordForm(!showPasswordForm)}
                style={styles.toggleFormButton}
                hitSlop={6}
              >
                <Text style={styles.toggleFormText}>{showPasswordForm ? 'Cancel' : 'Change'}</Text>
              </Pressable>
            </View>

            {passwordSuccess && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent.teal} />
                <Text style={styles.successBannerText}>{passwordSuccess}</Text>
              </View>
            )}

            {passwordErrors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{passwordErrors.general}</Text>
              </View>
            )}

            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <Input
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={(val) => {
                    setCurrentPassword(val);
                    if (passwordErrors.currentPassword)
                      setPasswordErrors((p) => ({ ...p, currentPassword: undefined }));
                  }}
                  secureTextEntry
                  error={passwordErrors.currentPassword}
                />

                <Input
                  label="New Password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChangeText={(val) => {
                    setNewPassword(val);
                    if (passwordErrors.newPassword)
                      setPasswordErrors((p) => ({ ...p, newPassword: undefined }));
                  }}
                  secureTextEntry
                  error={passwordErrors.newPassword}
                  helperText="Backend requires at least 8 characters"
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  secureTextEntry
                  error={passwordErrors.confirmPassword}
                />

                <Button
                  title="Update Password"
                  onPress={handleChangePassword}
                  loading={isChangingPassword}
                  fullWidth
                  size="md"
                  style={styles.passwordSubmitButton}
                />
              </View>
            )}
          </Card>

          {/* Sign Out Card */}
          <View style={styles.logoutContainer}>
            <Button
              title="Sign Out of FranchiseBridge"
              onPress={handleLogout}
              variant="danger"
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  identityCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.navy[900],
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
  },
  identityDetails: {
    flex: 1,
  },
  fullName: {
    ...typography.h2,
    color: colors.white,
  },
  emailText: {
    ...typography.caption,
    color: colors.slate[400],
    marginBottom: spacing.xs,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.navy[900],
    marginBottom: 2,
  },
  sectionDesc: {
    ...typography.caption,
    color: colors.slate[500],
  },
  toggleFormButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.slate[100],
    borderRadius: borderRadius.sm,
  },
  toggleFormText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  fieldItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.navy[900],
  },
  fieldValueMono: {
    ...typography.caption,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.slate[600],
  },
  passwordForm: {
    marginTop: spacing.md,
  },
  passwordSubmitButton: {
    marginTop: spacing.sm,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  successBannerText: {
    ...typography.caption,
    color: colors.success.text,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
