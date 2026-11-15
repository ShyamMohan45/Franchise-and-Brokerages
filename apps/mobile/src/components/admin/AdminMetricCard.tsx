import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';

interface AdminMetricCardProps {
  title?: string;
  label?: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  onPress?: () => void;
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  title,
  label,
  value,
  icon,
  color = colors.primary.DEFAULT,
  subtitle,
  onPress,
}) => {
  const displayTitle = title || label || '';
  const content = (
    <Card style={styles.card} padding="md">
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.valueText} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={styles.titleText} numberOfLines={1}>
        {displayTitle}
      </Text>
      {subtitle && (
        <Text style={styles.subtitleText} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
};

const styles = StyleSheet.create({
  pressable: {
    width: '47.5%',
    marginBottom: spacing.xs,
  },
  card: {
    height: 105,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  titleText: {
    ...typography.captionBold,
    color: colors.text.secondary,
    fontSize: 12,
  },
  subtitleText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 10,
  },
});
