import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemePreference } from '../theme';

interface Option {
  id: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: Option[] = [
  { id: 'light', label: 'Light', icon: 'sunny-outline', activeIcon: 'sunny' },
  { id: 'dark', label: 'Dark', icon: 'moon-outline', activeIcon: 'moon' },
  { id: 'system', label: 'System', icon: 'laptop-outline', activeIcon: 'laptop' },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
      {OPTIONS.map((opt) => {
        const isActive = theme === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => setTheme(opt.id)}
            style={[
              styles.option,
              isActive && [
                styles.activeOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderStrong,
                  shadowColor: colors.black,
                },
              ],
            ]}
          >
            <Ionicons
              name={isActive ? opt.activeIcon : opt.icon}
              size={18}
              color={isActive ? colors.primary.DEFAULT : colors.text.muted}
            />
            <Text
              style={[
                styles.optionLabel,
                { color: isActive ? colors.text.primary : colors.text.muted },
                isActive && styles.activeOptionLabel,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeOption: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeOptionLabel: {
    fontWeight: '700',
  },
});
