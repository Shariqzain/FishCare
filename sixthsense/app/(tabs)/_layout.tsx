import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarPosition: 'bottom',
        tabBarStyle: { backgroundColor: 'rgba(12, 12, 12, 0.73)',
          borderTopColor: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
         },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <IconSymbol size={28} name="house.fill" color="#3c6570ff" />,
        }}
      />
      {/* Removed signin and signup screens */}
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <IconSymbol size={28} name="person.circle" color="#3c6570ff" />,
        }}
      />
    </Tabs>
  );
}
