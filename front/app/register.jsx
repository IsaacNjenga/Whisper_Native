import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        Sign In
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button mode="contained" onPress={() => {}} style={styles.button}>
        <Text>Sign In</Text>
      </Button>

      <Button onPress={() => router.push("/register")}>
        <Text>Dont have an account? Register</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  heading: { marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginBottom: 12 },
});
