import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../src/theme/ThemeContext';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rutinas',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
