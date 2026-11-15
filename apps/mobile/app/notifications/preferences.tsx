import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useNotifications } from '../../src/hooks/useNotifications';
import { colors, spacing, typography } from '../../src/theme';

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { preferences, isLoading, updatePreferences } = useNotifications();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    inAppNotifications: true,
    emailNotifications: true,
    leadAlerts: true,
    dealAlerts: true,
    commissionAlerts: true,
    meetingReminders: true,
    documentAlerts: true,
    diligenceAlerts: true,
  });

  useEffect(() => {
    if (preferences) {
      setForm({
        inAppNotifications: preferences.inAppNotifications ?? true,
        emailNotifications: preferences.emailNotifications ?? true,
        leadAlerts: preferences.leadAlerts ?? true,
        dealAlerts: preferences.dealAlerts ?? true,
        commissionAlerts: preferences.commissionAlerts ?? true,
        meetingReminders: preferences.meetingReminders ?? true,
        documentAlerts: preferences.documentAlerts ?? true,
        diligenceAlerts: preferences.diligenceAlerts ?? true,
      });
    }
  }, [preferences]);

  const toggle = (key: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(form);
      Alert.alert('Saved', 'Notification preferences updated successfully');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Notification Settings"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Channel Preferences */}
        <Text style={styles.groupTitle}>Channels</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Push & In-App Alerts</Text>
              <Text style={styles.itemDesc}>Receive alerts within the mobile application</Text>
            </View>
            <Switch
              value={form.inAppNotifications}
              onValueChange={() => toggle('inAppNotifications')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Email Notifications</Text>
              <Text style={styles.itemDesc}>Receive digests and urgent updates via email</Text>
            </View>
            <Switch
              value={form.emailNotifications}
              onValueChange={() => toggle('emailNotifications')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* Activity & Business Alerts */}
        <Text style={styles.groupTitle}>Activity Alerts</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Lead & Inquiry Alerts</Text>
              <Text style={styles.itemDesc}>New investor inquiries, assignments, and updates</Text>
            </View>
            <Switch
              value={form.leadAlerts}
              onValueChange={() => toggle('leadAlerts')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Deal Stage Updates</Text>
              <Text style={styles.itemDesc}>Deal room activity, milestone progress, and stage moves</Text>
            </View>
            <Switch
              value={form.dealAlerts}
              onValueChange={() => toggle('dealAlerts')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Commission & Payments</Text>
              <Text style={styles.itemDesc}>Agreement creation, approvals, and payout records</Text>
            </View>
            <Switch
              value={form.commissionAlerts}
              onValueChange={() => toggle('commissionAlerts')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Meeting Reminders</Text>
              <Text style={styles.itemDesc}>Upcoming investor pitches and discovery calls</Text>
            </View>
            <Switch
              value={form.meetingReminders}
              onValueChange={() => toggle('meetingReminders')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Documents & Signing</Text>
              <Text style={styles.itemDesc}>New uploads, signature requests, and signed NDAs</Text>
            </View>
            <Switch
              value={form.documentAlerts}
              onValueChange={() => toggle('documentAlerts')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Due Diligence Checklist</Text>
              <Text style={styles.itemDesc}>Status changes and verification approvals</Text>
            </View>
            <Switch
              value={form.diligenceAlerts}
              onValueChange={() => toggle('diligenceAlerts')}
              trackColor={{ false: colors.border, true: colors.primary.DEFAULT }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        <Button
          title={saving ? 'Saving...' : 'Save Preferences'}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Loading preferences..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  groupTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    marginLeft: 4,
  },
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemTitle: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.xl,
  },
});
