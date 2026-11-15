import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function BrokerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="leads" />
      <Stack.Screen name="lead/[id]" />
      <Stack.Screen name="pipeline" />
      <Stack.Screen name="deal/[id]" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="meetings" />
      <Stack.Screen name="commissions" />
      <Stack.Screen name="commission-details/[id]" />
    </Stack>
  );
}
