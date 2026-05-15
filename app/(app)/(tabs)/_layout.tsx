import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textPlaceholder,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 16,
          // marginBottom evita que os descendentes ('g' de Agenda, 'ç' de
          // Nomeações) batam na borda inferior do tab bar e sejam clipados.
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.bgBlueGrey,
          height: 76 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 12 + insets.bottom,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Nomeações',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="laudos"
        options={{
          title: 'Laudos',
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
