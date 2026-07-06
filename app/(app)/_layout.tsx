import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { LayoutDashboard, BookOpen, Wallet, Users, Settings } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';

export default function AppTabs() {
  const t = useTheme();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
      <Tabs.Screen name="company" options={{ href: null }} />
      <Tabs.Screen name="team" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
