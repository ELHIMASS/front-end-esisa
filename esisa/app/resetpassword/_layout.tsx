// app/login/_layout.tsx

import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // ✅ supprime la barre pour toutes les pages login/*
            }}
        />
    );
}
