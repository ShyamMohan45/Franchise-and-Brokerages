import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header, EmptyState, RoleGuard, DealMessageBubble } from '../../../src/components';
import { useDealMessages } from '../../../src/hooks/useDealMessages';
import { useAuth } from '../../../src/hooks/useAuth';

export default function DealRoomMessagesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const {
    messages,
    loading,
    refreshing,
    isSending,
    refresh,
    sendMessage,
  } = useDealMessages(id || '');

  const isBrokerOrAdmin =
    user?.role === 'broker' || user?.role === 'admin' || user?.role === 'super_admin';

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      const text = messageText.trim();
      setMessageText('');
      await sendMessage({
        text,
        isInternal: isBrokerOrAdmin && isInternalNote,
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      Alert.alert('Send Error', err?.message || 'Could not send message');
    }
  };

  return (
    <RoleGuard
      allowedRoles={[
        'investor',
        'business_owner',
        'brand_owner',
        'broker',
        'admin',
        'super_admin',
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Communications"
          subtitle="Deal Room Dialogue & Audit Notes"
          showBack
          onBack={() => router.back()}
          rightAction={
            <Pressable onPress={refresh} hitSlop={8}>
              <Ionicons name="refresh-outline" size={20} color={colors.accent.teal} />
            </Pressable>
          }
        />

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Messages List */}
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.teal} />
              <Text style={styles.loadingText}>Loading deal messages...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <DealMessageBubble
                  message={item}
                  isCurrentUser={item.sender?._id === (user?.id || user?._id)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <EmptyState
                  icon="chatbubbles-outline"
                  title="No Messages Yet"
                  description="Start the conversation with investors, brand owners, and brokerage partners."
                />
              }
            />
          )}

          {/* Internal Broker Note Indicator */}
          {isBrokerOrAdmin && isInternalNote && (
            <View style={styles.internalWarningBar}>
              <Ionicons name="lock-closed" size={14} color={colors.warning.text} />
              <Text style={styles.internalWarningText}>
                Posting as Internal Note. Hidden from investor and brand owner.
              </Text>
            </View>
          )}

          {/* Composer Box */}
          <View style={styles.composerWrapper}>
            {isBrokerOrAdmin && (
              <View style={styles.brokerControlsRow}>
                <View style={styles.toggleRow}>
                  <Ionicons name="shield-outline" size={14} color={colors.warning.text} />
                  <Text style={styles.toggleLabel}>Internal Note Only</Text>
                  <Switch
                    value={isInternalNote}
                    onValueChange={setIsInternalNote}
                    trackColor={{ false: colors.border, true: colors.warning.DEFAULT }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder={
                  isInternalNote
                    ? 'Write confidential broker audit note...'
                    : 'Type a message to participants...'
                }
                placeholderTextColor={colors.text.muted}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  !messageText.trim() && styles.sendBtnDisabled,
                  isInternalNote && styles.sendBtnInternal,
                ]}
                onPress={handleSend}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
    flexGrow: 1,
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
  internalWarningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning.soft,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.warning.border,
  },
  internalWarningText: {
    ...typography.captionBold,
    color: colors.warning.text,
    fontSize: 11,
  },
  composerWrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brokerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    ...typography.captionBold,
    color: colors.text.secondary,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnInternal: {
    backgroundColor: colors.warning.DEFAULT,
  },
});
