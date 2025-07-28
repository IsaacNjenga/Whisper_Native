import { TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const Layout = () => {
  const { onLogout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0333c1" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Meeting Room",
          headerRight: () => (
            <TouchableOpacity onPress={onLogout}>
              <Ionicons name="log-out-outline" size={28} color={"white"} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="(room)/[id]"
        options={{
          title: "Room",
        }}
      />
    </Stack>
  );
};

export default Layout;
