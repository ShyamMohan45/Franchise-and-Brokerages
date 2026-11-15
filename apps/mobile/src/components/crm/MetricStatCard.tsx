import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../Card';

export interface MetricStatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  onPress?: () => void;
}

export const MetricStatCard: React.FC<MetricStatCardProps> = ({
  title,
  value,
  icon,
  color = colors.primary.DEFAULT,
  subtitle,
  onPress,
}) => {
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
        {title}
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
      <Pressable onPress={onPress} style={styles.pressableContainer}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pressableContainer: {
    flex: 1,
    minWidth: '46%',
    margin: spacing.xs,
  },
  card: {
    flex: 1,
    minWidth: '46%',
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
    marginTop: 2,
  },
  subtitleText: {
    ...typography.caption,
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },
});
