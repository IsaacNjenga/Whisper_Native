import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
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
            }}
          />

          {/* Register — same clean minimal header */}
          <Stack.Screen
            name="register"
            options={{
              title: "",
              headerTransparent: true,
              headerShadowVisible: false,
            }}
          />
        </Stack>{" "}
      </PaperProvider>
    </AuthProvider>
  );
}
