import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function BrandLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="investor-matching" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="create-listing" />
      <Stack.Screen name="edit-listing/[id]" />
      <Stack.Screen name="enquiries" />
    </Stack>
  );
}
