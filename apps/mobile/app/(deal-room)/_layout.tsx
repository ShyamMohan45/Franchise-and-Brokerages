import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function DealRoomLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/documents" />
      <Stack.Screen name="[id]/due-diligence" />
      <Stack.Screen name="[id]/messages" />
      <Stack.Screen name="[id]/agreements" />
    </Stack>
  );
}
