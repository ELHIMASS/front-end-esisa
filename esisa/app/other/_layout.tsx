import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // 👈 masque complètement la barre
        },
      }}
    >
      <Tabs.Screen name="admission" options={{ href: null }} />
      <Tabs.Screen name="form" options={{ href: null }} />
    </Tabs>
  );
}

