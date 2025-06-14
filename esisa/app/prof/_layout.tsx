import { Stack } from "expo-router";

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // désactive le header natif ici aussi
      }}
    >
      <Stack.Screen name="Settings" />
      {/* autres écrans éventuels */}
    </Stack>
  );
}
