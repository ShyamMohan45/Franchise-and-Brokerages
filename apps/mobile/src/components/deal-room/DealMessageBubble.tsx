import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Badge } from '../Badge';
import { DealMessage } from '../../types/dealRoom';

interface DealMessageBubbleProps {
  message: DealMessage;
  isCurrentUser: boolean;
}

export const DealMessageBubble: React.FC<DealMessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'broker':
        return <Badge label="BROKER" variant="gold" size="sm" />;
      case 'admin':
      case 'super_admin':
        return <Badge label="ADMIN" variant="primary" size="sm" />;
      case 'business_owner':
      case 'brand_owner':
        return <Badge label="BRAND" variant="teal" size="sm" />;
      case 'investor':
        return <Badge label="INVESTOR" variant="info" size="sm" />;
      default:
        return <Badge label={role.toUpperCase()} variant="neutral" size="sm" />;
    }
  };

  const isInternal = message.isInternal;

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.containerRight : styles.containerLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
          isInternal && styles.bubbleInternal,
        ]}
      >
        {/* Internal confidential note banner */}
        {isInternal && (
          <View style={styles.internalBanner}>
            <Ionicons name="lock-closed" size={12} color={colors.warning.text} />
            <Text style={styles.internalBannerText}>INTERNAL BROKER NOTE</Text>
          </View>
        )}

        {/* Sender Header */}
        <View style={styles.senderHeader}>
          <Text style={styles.senderName}>
            {isCurrentUser ? 'You' : message.sender?.fullName || 'Participant'}
          </Text>
          {getRoleBadge(message.senderRole || message.sender?.role || 'investor')}
        </View>

        {/* Message Content */}
        <Text
          style={[
            styles.messageText,
            isCurrentUser && !isInternal ? styles.messageTextRight : styles.messageTextLeft,
          ]}
        >
          {message.text}
        </Text>

        {/* Linked references if any */}
        {message.relatedDocument && (
          <View style={styles.refTag}>
            <Ionicons name="document-text-outline" size={12} color={colors.text.muted} />
            <Text style={styles.refTagText} numberOfLines={1}>
              {message.relatedDocument.title || message.relatedDocument.fileName}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: spacing.md,
  },
  containerRight: {
    alignItems: 'flex-end',
  },
  containerLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 2,
  },
  bubbleRight: {
    backgroundColor: colors.primary.DEFAULT,
    borderTopRightRadius: 2,
  },
  bubbleInternal: {
    backgroundColor: colors.warning.soft,
    borderColor: colors.warning.border,
    borderWidth: 1,
  },
  internalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning.border,
  },
  internalBannerText: {
    ...typography.captionBold,
    color: colors.warning.text,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  senderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  senderName: {
    ...typography.captionBold,
    color: colors.text.primary,
  },
  messageText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextLeft: {
    color: colors.text.primary,
  },
  messageTextRight: {
    color: '#FFFFFF',
  },
  refTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  },
  refTagText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.muted,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
});
