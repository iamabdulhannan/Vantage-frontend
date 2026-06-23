import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, Wallet, Users, Settings } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';

export default function AppTabs() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.textSubtle,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 92 : 84,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 28 : 18,
        },
        tabBarLabelStyle: {
          fontFamily: t.fonts.medium,
          fontSize: 10.5,
          lineHeight: 15,
          letterSpacing: 0.2,
        },
        sceneStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, focused }) => <LayoutDashboard size={20} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="ledgers"
        options={{
          title: 'Ledgers',
          tabBarIcon: ({ color, focused }) => <BookOpen size={20} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="payroll"
        options={{
          title: 'Payroll',
          tabBarIcon: ({ color, focused }) => <Wallet size={20} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="partners"
        options={{
          title: 'Partners',
          tabBarIcon: ({ color, focused }) => <Users size={20} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Settings size={20} color={color} strokeWidth={focused ? 2.6 : 2} />,
        }}
      />
      {/* Routable but hidden from the tab bar */}
      <Tabs.Screen name="billing" options={{ href: null }} />
      <Tabs.Screen name="expenses" options={{ href: null }} />
    </Tabs>
  );
}
