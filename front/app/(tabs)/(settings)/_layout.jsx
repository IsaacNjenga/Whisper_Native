import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Edit Profile",
          headerBackTitle: "Settings",
          headerTintColor: "#6C47FF",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f9fafb" },
          headerTitleStyle: { fontWeight: "700", color: "#1a1a2e" },
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerBackTitle: "Settings",
          headerTintColor: "#6C47FF",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f9fafb" },
          headerTitleStyle: { fontWeight: "700", color: "#1a1a2e" },
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: "Privacy & Security",
          headerBackTitle: "Settings",
          headerTintColor: "#6C47FF",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f9fafb" },
          headerTitleStyle: { fontWeight: "700", color: "#1a1a2e" },
        }}
      />
    </Stack>
  );
}