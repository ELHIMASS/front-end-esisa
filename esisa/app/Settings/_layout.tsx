import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // <---- IMPORTANT, désactive tous les headers natifs ici !
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
