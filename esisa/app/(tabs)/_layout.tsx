import { Tabs } from 'expo-router';
import React from 'react';
import { DarkModeProvider } from '../context/DarkModeContext'; // chemin à adapter


export default function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // 👈 masque complètement la barre
        },
      }}
    >
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );

  return <DarkModeProvider>{children}</DarkModeProvider>;
}
