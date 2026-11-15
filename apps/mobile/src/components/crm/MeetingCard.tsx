import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { CrmMeeting, MeetingStatus } from '../../types/crm';

interface MeetingCardProps {
  meeting: CrmMeeting;
  onUpdateStatus?: (newStatus: MeetingStatus) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onUpdateStatus,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge label="COMPLETED" variant="success" size="sm" />;
      case 'cancelled':
        return <Badge label="CANCELLED" variant="danger" size="sm" />;
      case 'rescheduled':
        return <Badge label="RESCHEDULED" variant="warning" size="sm" />;
      case 'scheduled':
      default:
        return <Badge label="SCHEDULED" variant="primary" size="sm" />;
    }
  };

  const startTime = new Date(meeting.scheduledStartTime);
  const dateFormatted = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card style={styles.card} padding="md">
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={styles.titleText}>{meeting.title}</Text>
          <Text style={styles.typeText}>{meeting.meetingType.replace('_', ' ').toUpperCase()}</Text>
        </View>
        {getStatusBadge(meeting.status)}
      </View>

      <View style={styles.timeBox}>
        <Ionicons name="calendar-outline" size={16} color={colors.primary.DEFAULT} />
        <Text style={styles.timeText}>
          {dateFormatted} at {timeFormatted}
        </Text>
      </View>

      {meeting.agenda ? (
        <Text style={styles.agendaText} numberOfLines={2}>
          Agenda: {meeting.agenda}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.participantsBox}>
          <Ionicons name="people-outline" size={14} color={colors.slate[400]} />
          <Text style={styles.participantsText}>
            {meeting.participants?.length || 1} Participant(s)
          </Text>
        </View>

        {meeting.status === 'scheduled' && onUpdateStatus && (
          <View style={styles.actionsBox}>
            <Pressable
              onPress={() => onUpdateStatus('completed')}
              style={styles.actionBtn}
              hitSlop={6}
            >
              <Text style={styles.actionCompleteText}>Mark Done</Text>
            </Pressable>
            <Pressable
              onPress={() => onUpdateStatus('cancelled')}
              style={styles.actionBtn}
              hitSlop={6}
            >
              <Text style={styles.actionCancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleText: {
    ...typography.bodyBold,
    color: colors.navy[900],
  },
  typeText: {
    ...typography.captionBold,
    color: colors.slate[400],
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.soft,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  timeText: {
    ...typography.captionBold,
    color: colors.primary.dark,
    fontSize: 12,
  },
  agendaText: {
    ...typography.caption,
    color: colors.slate[600],
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  participantsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    ...typography.caption,
    color: colors.slate[500],
    fontSize: 11,
  },
  actionsBox: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  actionCompleteText: {
    ...typography.captionBold,
    color: colors.success.text,
    fontSize: 11,
  },
  actionCancelText: {
    ...typography.caption,
    color: colors.danger.text,
    fontSize: 11,
  },
});
