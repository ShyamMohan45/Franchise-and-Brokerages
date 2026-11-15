import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="approvals" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="audit-logs" />
    </Stack>
  );
}
