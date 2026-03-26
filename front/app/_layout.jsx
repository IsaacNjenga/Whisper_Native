import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

// Your custom theme — tweak colors to match your brand
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6C47FF",
    secondary: "#f3f0ff",
  },
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // wait until auth state is known

    const inTabsGroup = segments[0] === "(tabs)";

    if (isAuthenticated && !inTabsGroup) {
      // User is authenticated but outside tabs — send them in
      router.replace("/(tabs)/home");
    } else if (!isAuthenticated && inTabsGroup) {
      // User is not authenticated but inside tabs — kick them out
      router.replace("/login");
    }
    //eslint-disable-next-line
  }, [isAuthenticated, loading, segments]);

  if (loading) return null; // or a splash/loading screen

  return (
    <Stack>
      {/* Landing page — no header needed */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Login — minimal header with just a back arrow */}
      <Stack.Screen
        name="login"
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: "#6C47FF",
        }}
      />

      {/* Register — same clean minimal header */}
      <Stack.Screen
        name="register"
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: "#6C47FF",
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          title: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: "#6C47FF",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <RootLayoutNav />
      </PaperProvider>
    </AuthProvider>
  );
}
